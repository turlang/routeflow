import test from'node:test';import assert from'node:assert/strict';import{normalizeSubscriptionEvent}from'../src/billing.js';
test('active subscription preserves paid plan',()=>assert.equal(normalizeSubscriptionEvent({customerId:'cus_1',status:'active',plan:'driver'}).plan,'DRIVER'));
test('cancelled subscription falls back to free',()=>assert.equal(normalizeSubscriptionEvent({customerId:'cus_1',status:'cancelled',plan:'pro'}).plan,'FREE'));
test('rejects unknown paid plan',()=>assert.throws(()=>normalizeSubscriptionEvent({customerId:'cus_1',status:'active',plan:'gold'})));
test('parses billing period end',()=>assert.equal(normalizeSubscriptionEvent({customerId:'cus_1',status:'trialing',plan:'team',periodEnd:'2026-10-01T00:00:00.000Z'}).billingPeriodEnd.toISOString(),'2026-10-01T00:00:00.000Z'));
