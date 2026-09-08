import test from'node:test';import assert from'node:assert/strict';import{proofObjectKey,storageStatus}from'../src/storage.js';
test('proof object keys are account scoped and sanitized',()=>assert.equal(proofObjectKey({userId:'user_1',deliveryId:'delivery-22',extension:'JPG'}),'proofs/user_1/delivery-22.jpg'));
test('proof object key rejects missing identity',()=>assert.throws(()=>proofObjectKey({userId:'',deliveryId:'x'}),/inválida/));
test('storage status does not expose secrets',()=>{const s=storageStatus();assert.equal('accessKey'in s,false);assert.equal('secret'in s,false)});
