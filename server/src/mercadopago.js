import crypto from 'node:crypto';
import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from 'mercadopago';
import { paymentPrices } from './payment-pricing.js';

const PLANS = new Set(['DRIVER', 'PRO', 'TEAM', 'BUSINESS']);
const API = 'https://api.mercadopago.com';

export const mercadoPagoConfigured = () =>
  Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);

export const mercadoPagoWebhookConfigured = () =>
  Boolean(process.env.MERCADOPAGO_WEBHOOK_SECRET);

const addMonth = (date) => {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
};

async function mp(path, { method = 'GET', body, idempotencyKey } = {}) {
  if (!mercadoPagoConfigured()) {
    throw new Error('Mercado Pago não configurado');
  }

  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.errors
        ?.map?.((error) => error.message || error.code)
        .filter(Boolean)
        .join('; ') ||
      `Mercado Pago HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

function webhookValid(req) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  const queryDataId = req.query?.['data.id'];

  try {
    WebhookSignatureValidator.validate({
      xSignature: xSignature == null ? undefined : String(xSignature),
      xRequestId: xRequestId == null ? undefined : String(xRequestId),
      dataId: queryDataId == null ? undefined : String(queryDataId),
      secret,
    });
    return true;
  } catch (error) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        type: 'mercadopago_webhook_signature_rejected',
        reason:
          error instanceof InvalidWebhookSignatureError
            ? 'invalid_signature'
            : 'validator_error',
        hasSignature: Boolean(xSignature),
        hasRequestId: Boolean(xRequestId),
        hasDataId: Boolean(queryDataId),
      }),
    );
    return false;
  }
}

const paid = (order) =>
  order?.status === 'processed' && order?.status_detail === 'accredited';

const terminalStatus = (order) =>
  ['expired', 'canceled', 'failed', 'refunded'].includes(
    String(order?.status || ''),
  );

async function reconcile(db, order, eventId) {
  const id = String(order?.id || '');
  if (!id) return { found: false, paid: false };

  const checkout = await db.billingCheckout.findUnique({
    where: { providerId: id },
  });
  if (!checkout) return { found: false, paid: false };

  if (
    eventId &&
    !(await db.billingEvent.findUnique({ where: { providerEventId: eventId } }))
  ) {
    await db.billingEvent.create({
      data: {
        providerEventId: eventId,
        type: `MERCADOPAGO_ORDER_${String(order.status || 'UNKNOWN').toUpperCase()}`,
        payload: order,
      },
    });
  }

  if (paid(order) && checkout.status !== 'PAID') {
    const user = await db.user.findUnique({
      where: { id: checkout.userId },
      select: { billingPeriodEnd: true },
    });
    const now = new Date();
    const current = user?.billingPeriodEnd
      ? new Date(user.billingPeriodEnd)
      : null;
    const base = current && current > now ? current : now;

    await db.$transaction([
      db.billingCheckout.update({
        where: { providerId: id },
        data: { status: 'PAID' },
      }),
      db.user.update({
        where: { id: checkout.userId },
        data: {
          plan: checkout.plan,
          subscriptionStatus: 'ACTIVE',
          billingPeriodEnd: addMonth(base),
        },
      }),
    ]);

    return { found: true, paid: true, activated: true };
  }

  if (terminalStatus(order) && checkout.status === 'ACTIVE') {
    await db.billingCheckout.update({
      where: { providerId: id },
      data: { status: String(order.status).toUpperCase() },
    });
  }

  return {
    found: true,
    paid: paid(order),
    activated: false,
    status: order.status,
    statusDetail: order.status_detail,
  };
}

export function mountMercadoPagoRoutes(app, { db, auth, planPrice }) {
  app.get('/v1/billing/mercadopago/status', auth, (req, res) =>
    res.json({
      configured: mercadoPagoConfigured(),
      webhookConfigured: mercadoPagoWebhookConfigured(),
      provider: 'mercadopago',
      methods: ['PIX'],
      environment:
        process.env.MERCADOPAGO_ENVIRONMENT === 'production'
          ? 'production'
          : 'test',
    }),
  );

  app.post('/v1/billing/mercadopago/pix', auth, async (req, res) => {
    try {
      if (!mercadoPagoConfigured()) {
        return res
          .status(503)
          .json({ error: 'Mercado Pago ainda não configurado' });
      }

      const plan = String(req.body?.plan || '').toUpperCase();
      if (!PLANS.has(plan)) {
        return res.status(400).json({ error: 'Plano inválido' });
      }

      const base = Number(await planPrice(plan));
      if (!(base > 0)) {
        return res
          .status(400)
          .json({ error: 'Preço do plano não configurado' });
      }

      const user = await db.user.findUnique({
        where: { id: req.auth.sub },
        select: { email: true },
      });
      if (!user?.email) {
        return res
          .status(400)
          .json({ error: 'Conta sem e-mail para pagamento' });
      }

      const amount = paymentPrices(base).pixCents;
      const reference = `routeflow:${req.auth.sub}:${plan}:MERCADOPAGO_PIX`;
      const idempotencyKey = crypto.randomUUID();
      const value = (amount / 100).toFixed(2);

      const order = await mp('/v1/orders', {
        method: 'POST',
        idempotencyKey,
        body: {
          type: 'online',
          total_amount: value,
          external_reference: reference,
          processing_mode: 'automatic',
          transactions: {
            payments: [
              {
                amount: value,
                payment_method: {
                  id: 'pix',
                  type: 'bank_transfer',
                },
                expiration_time: 'PT1H',
              },
            ],
          },
          payer: { email: user.email },
        },
      });

      if (!order?.id) {
        throw new Error('Mercado Pago não retornou a order');
      }

      const payment = order.transactions?.payments?.[0] || {};
      const method = payment.payment_method || {};
      const url = method.ticket_url || null;

      await db.billingCheckout.upsert({
        where: { providerId: order.id },
        update: { status: 'ACTIVE', plan, url },
        create: {
          providerId: order.id,
          userId: req.auth.sub,
          plan,
          status: 'ACTIVE',
          url,
        },
      });

      res.status(201).json({
        provider: 'mercadopago',
        orderId: order.id,
        plan,
        amountCents: amount,
        pixCopiaECola: method.qr_code || null,
        qrCodeBase64: method.qr_code_base64 || null,
        ticketUrl: url,
        status: order.status,
        statusDetail: order.status_detail,
        expiresInSeconds: 3600,
        environment:
          process.env.MERCADOPAGO_ENVIRONMENT === 'production'
            ? 'production'
            : 'test',
      });
    } catch (error) {
      console.error(
        JSON.stringify({
          level: 'warn',
          type: 'mercadopago_pix_rejected',
          status: error.status || 502,
          message: error.message,
        }),
      );
      res
        .status(error.status && error.status < 500 ? error.status : 502)
        .json({ error: error.message || 'Falha ao criar Pix Mercado Pago' });
    }
  });

  app.get('/v1/billing/mercadopago/orders/:id', auth, async (req, res) => {
    try {
      const checkout = await db.billingCheckout.findFirst({
        where: { providerId: req.params.id, userId: req.auth.sub },
      });
      if (!checkout) {
        return res.status(404).json({ error: 'Cobrança não encontrada' });
      }

      const order = await mp(`/v1/orders/${encodeURIComponent(req.params.id)}`);
      const result = await reconcile(db, order);
      res.json({
        orderId: order.id,
        status: order.status,
        statusDetail: order.status_detail,
        paid: result.paid,
        activated: result.activated || false,
      });
    } catch (error) {
      res
        .status(error.status && error.status < 500 ? error.status : 502)
        .json({ error: error.message || 'Falha ao consultar pagamento' });
    }
  });

  app.post('/v1/billing/mercadopago/webhook', async (req, res) => {
    if (!mercadoPagoWebhookConfigured()) {
      return res
        .status(503)
        .json({ error: 'Webhook Mercado Pago não configurado' });
    }

    if (!webhookValid(req)) {
      return res
        .status(401)
        .json({ error: 'Webhook Mercado Pago não autorizado' });
    }

    const orderId = String(
      req.query?.['data.id'] || req.body?.data?.id || '',
    );
    if (!orderId) {
      return res
        .status(200)
        .json({ ok: true, ignored: true, reason: 'missing_order_id' });
    }

    const type = String(req.query?.type || req.body?.type || '').toLowerCase();
    if (type && type !== 'order') {
      return res
        .status(200)
        .json({ ok: true, ignored: true, reason: 'unsupported_event_type' });
    }

    try {
      const eventId = `mercadopago:${String(
        req.body?.id || req.headers['x-request-id'] || orderId,
      )}`;

      if (
        await db.billingEvent.findUnique({
          where: { providerEventId: eventId },
        })
      ) {
        return res.json({ ok: true, duplicate: true });
      }

      const order = await mp(`/v1/orders/${encodeURIComponent(orderId)}`);
      const result = await reconcile(db, order, eventId);
      res.json({ ok: true, ...result });
    } catch (error) {
      const invalidSimulatorOrderId =
        error.status === 400 &&
        /path param order id is invalid/i.test(String(error.message || ''));

      if (error.status === 404 || invalidSimulatorOrderId) {
        return res.status(200).json({
          ok: true,
          verified: true,
          ignored: true,
          reason: invalidSimulatorOrderId
            ? 'invalid_simulator_order_id'
            : 'order_not_found',
        });
      }

      console.error(
        JSON.stringify({
          level: 'error',
          type: 'mercadopago_webhook',
          orderId,
          message: error.message,
        }),
      );
      res
        .status(500)
        .json({ error: 'Falha ao processar webhook Mercado Pago' });
    }
  });

  app.get('/v1/billing/mercadopago/history', auth, async (req, res) =>
    res.json(
      await db.billingCheckout.findMany({
        where: { userId: req.auth.sub },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ),
  );
}
