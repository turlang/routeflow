export const isMercadoPagoProduction = (env = process.env) =>
  env.MERCADOPAGO_ENVIRONMENT === 'production';

export const mercadoPagoWebhookSecrets = (env = process.env) => {
  const preferred = isMercadoPagoProduction(env)
    ? env.MERCADOPAGO_WEBHOOK_SECRET_PRODUCTION
    : env.MERCADOPAGO_WEBHOOK_SECRET_TEST;

  return [...new Set([preferred, env.MERCADOPAGO_WEBHOOK_SECRET])]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
};

export const isMercadoPagoTestOrderId = (value) =>
  /^ORDTST[A-Z0-9]+$/i.test(String(value || ''));

export const mayVerifyUnsignedMercadoPagoTestOrder = ({
  environment = process.env,
  signatureValid,
  orderId,
  eventType,
  checkoutKnown,
}) =>
  !isMercadoPagoProduction(environment) &&
  !signatureValid &&
  checkoutKnown &&
  isMercadoPagoTestOrderId(orderId) &&
  (!eventType || String(eventType).toLowerCase() === 'order');
