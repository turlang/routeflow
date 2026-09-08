import test from'node:test';import assert from'node:assert/strict';import{routingErrorStatus,routingErrorBody}from'../src/routing-errors.js';
test('routing input errors are client errors',()=>{const e=new Error('Coordenada 2 inválida.');assert.equal(routingErrorStatus(e),400);assert.equal(routingErrorBody(e).code,'ROUTING_INPUT_INVALID')});
test('routing provider errors do not leak provider details',()=>{const e=new Error('upstream secret detail');assert.equal(routingErrorStatus(e),502);assert.equal(routingErrorBody(e).error,'Serviço de roteamento indisponível')});
test('abort maps to gateway timeout',()=>{const e=new Error('aborted');e.name='AbortError';assert.equal(routingErrorStatus(e),504)});
