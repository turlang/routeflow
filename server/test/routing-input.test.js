import test from'node:test';import assert from'node:assert/strict';import{routingCoordinates,osrmCoordinates}from'../src/routing-input.js';
test('normalizes numeric routing coordinates',()=>assert.deepEqual(routingCoordinates([{lat:'-23.5',lon:'-46.6'},{lat:-23.6,lon:-46.7}]),[{lat:-23.5,lon:-46.6},{lat:-23.6,lon:-46.7}]));
test('rejects invalid and excessive coordinates',()=>{assert.throws(()=>routingCoordinates([{lat:0,lon:0}]),/entre 2/);assert.throws(()=>routingCoordinates([{lat:91,lon:0},{lat:0,lon:0}]),/Coordenada 1 inválida/);assert.throws(()=>routingCoordinates(Array.from({length:3},()=>({lat:0,lon:0})),{max:2}),/entre 2 e 2/)});
test('serializes coordinates for OSRM',()=>assert.equal(osrmCoordinates([{lat:-23.5,lon:-46.6},{lat:-23.6,lon:-46.7}]),'-46.6,-23.5;-46.7,-23.6'));
