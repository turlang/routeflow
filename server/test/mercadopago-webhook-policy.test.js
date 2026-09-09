import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isMercadoPagoProduction,
  isMercadoPagoTestOrderId,
  mayVerifyUnsignedMercadoPagoTestOrder,
  mercadoPagoWebhookSecrets,
} from '../src/mercadopago-webhook-policy.js';

test('selects dedicated test webhook secret before legacy secret', () => {
  assert.deepEqual(
    mercadoPagoWebhookSecrets({
      MERCADOPAGO_ENVIRONMENT: 'test',
      MERCADOPAGO_WEBHOOK_SECRET_TEST: 'test-secret',
      MERCADOPAGO_WEBHOOK_SECRET: 'legacy-secret',
    }),
    ['test-secret', 'legacy-secret'],
  );
});

test('selects dedicated production webhook secret before legacy secret', () => {
  assert.deepEqual(
    mercadoPagoWebhookSecrets({
      MERCADOPAGO_ENVIRONMENT: 'production',
      MERCADOPAGO_WEBHOOK_SECRET_PRODUCTION: 'prod-secret',
      MERCADOPAGO_WEBHOOK_SECRET: 'legacy-secret',
    }),
    ['prod-secret', 'legacy-secret'],
  );
});

test('detects Mercado Pago sandbox order ids', () => {
  assert.equal(isMercadoPagoTestOrderId('ORDTST01M23JJSVFZRFGW2JSHMMGFF94'), true);
  assert.equal(isMercadoPagoTestOrderId('123456'), false);
  assert.equal(isMercadoPagoTestOrderId('ORD01ABC'), false);
});

test('unsigned sandbox fallback requires a known local ORDTST checkout', () => {
  const base = {
    environment: { MERCADOPAGO_ENVIRONMENT: 'test' },
    signatureValid: false,
    orderId: 'ORDTST01M23JJSVFZRFGW2JSHMMGFF94',
    eventType: 'order',
  };

  assert.equal(
    mayVerifyUnsignedMercadoPagoTestOrder({ ...base, checkoutKnown: true }),
    true,
  );
  assert.equal(
    mayVerifyUnsignedMercadoPagoTestOrder({ ...base, checkoutKnown: false }),
    false,
  );
});

test('unsigned sandbox fallback is forbidden in production', () => {
  assert.equal(isMercadoPagoProduction({ MERCADOPAGO_ENVIRONMENT: 'production' }), true);
  assert.equal(
    mayVerifyUnsignedMercadoPagoTestOrder({
      environment: { MERCADOPAGO_ENVIRONMENT: 'production' },
      signatureValid: false,
      orderId: 'ORDTST01M23JJSVFZRFGW2JSHMMGFF94',
      eventType: 'order',
      checkoutKnown: true,
    }),
    false,
  );
});
