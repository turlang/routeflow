import test from'node:test';import assert from'node:assert/strict';import{deliveryMetrics,routeMetrics}from'../src/metrics.js';
test('delivery metrics calculate success rate',()=>assert.deepEqual(deliveryMetrics([{status:'DELIVERED'},{status:'FAILED'},{status:'DELIVERED'}]),{total:3,delivered:2,failed:1,pending:0,successRate:66.7}));
test('route metrics aggregate planned distance',()=>assert.deepEqual(routeMetrics([{status:'COMPLETED',plannedKm:12.4},{status:'ACTIVE',plannedKm:4.6}]),{total:2,completed:1,active:1,cancelled:0,plannedKm:17}));
