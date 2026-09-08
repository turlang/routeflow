import test from'node:test';
import assert from'node:assert/strict';
import{entitlementsFor,checkRouteEntitlement,normalizePlan}from'../src/entitlements.js';
test('unknown plans fall back to FREE',()=>assert.equal(normalizePlan('unknown'),'FREE'));
test('driver plan exposes commercial limits',()=>{const x=entitlementsFor('driver');assert.equal(x.routesPerMonth,30);assert.equal(x.stopsPerRoute,80)});
test('free route exceeding stop limit is rejected',()=>{const x=checkRouteEntitlement({plan:'FREE',stops:26,routesThisMonth:0});assert.equal(x.allowed,false);assert.equal(x.code,'STOP_LIMIT')});
test('free third monthly route is rejected',()=>{const x=checkRouteEntitlement({plan:'FREE',stops:20,routesThisMonth:2});assert.equal(x.allowed,false);assert.equal(x.code,'MONTHLY_ROUTE_LIMIT')});
test('business plan accepts large monthly usage inside stop cap',()=>assert.equal(checkRouteEntitlement({plan:'BUSINESS',stops:400,routesThisMonth:5000}).allowed,true));
