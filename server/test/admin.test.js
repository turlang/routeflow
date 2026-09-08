import test from'node:test';import assert from'node:assert/strict';import{configuredAdminEmails,roleForLogin,adminOnly}from'../src/admin.js';
test('admin email bootstrap is normalized',()=>{const old=process.env.ADMIN_EMAILS;process.env.ADMIN_EMAILS=' Owner@Example.com ,second@example.com ';assert.equal(configuredAdminEmails().has('owner@example.com'),true);assert.equal(roleForLogin({email:'OWNER@example.com',role:'USER'}),'ADMIN');process.env.ADMIN_EMAILS=old});
test('existing admin role remains admin',()=>assert.equal(roleForLogin({email:'user@example.com',role:'ADMIN'}),'ADMIN'));
test('adminOnly rejects regular user',()=>{let status,body;const res={status(v){status=v;return this},json(v){body=v;return this}};adminOnly({auth:{role:'USER'}},res,()=>assert.fail('must not call next'));assert.equal(status,403);assert.match(body.error,/administrativo/i)});
test('adminOnly allows admin',()=>{let called=false;adminOnly({auth:{role:'ADMIN'}},{},()=>called=true);assert.equal(called,true)});
