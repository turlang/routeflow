import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createOwnedRoute,updateOwnedRoute} from '../src/route-service.js';
import jwt from 'jsonwebtoken';

test('route idempotency, concurrent requests and replay use userId + clientId', async () => {
  const url = new URL(process.env.DATABASE_URL);
  assert.equal(url.pathname, '/routeflow_gate_a_test', 'Use only the dedicated Gate A test database');
  const {app,db} = await import('../src/server.js');
  const server = app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const users = [];
  try {
    for (const name of ['A','B']) users.push(await db.user.create({data:{email:`gate-a-${name}-${crypto.randomUUID()}@example.invalid`,passwordHash:'test-only',plan:'BUSINESS',subscriptionStatus:'ACTIVE'}}));
    const input = {clientId:'same-client-id',stops:3,deliveriesCount:3,completedStops:0,operational:{}};
    const results = await Promise.all(Array.from({length:12}, () => createOwnedRoute(db,users[0].id,input)));
    assert.equal(new Set(results.map(result=>result.route.id)).size,1);
    assert.equal(results.filter(result=>result.created).length,1);
    assert.equal(await db.route.count({where:{userId:users[0].id,clientId:input.clientId}}),1);
    // Retrying after a lost response must return the original record without cancelling it.
    const replay=await createOwnedRoute(db,users[0].id,input);
    assert.equal(replay.route.id,results[0].route.id);assert.equal(replay.created,false);assert.equal(replay.route.status,'ACTIVE');
    const other=await createOwnedRoute(db,users[1].id,input);
    assert.notEqual(other.route.id,replay.route.id);
    const historical=await createOwnedRoute(db,users[0].id,{...input,clientId:'offline-completed',status:'COMPLETED',completedStops:3,finishedAt:'2026-09-30T12:00:00.000Z'});
    assert.equal(historical.route.status,'COMPLETED');
    assert.equal((await db.route.findUnique({where:{id:replay.route.id}})).status,'ACTIVE');
    await Promise.all([updateOwnedRoute(db,users[0].id,replay.route.id,{completedStops:2}),updateOwnedRoute(db,users[0].id,replay.route.id,{completedStops:1})]);
    assert.equal((await db.route.findUnique({where:{id:replay.route.id}})).completedStops,2);
    assert.equal(await updateOwnedRoute(db,users[1].id,replay.route.id,{completedStops:3}),null);
    const headers = userId=>({'Content-Type':'application/json',Authorization:`Bearer ${jwt.sign({sub:userId},process.env.JWT_SECRET,{issuer:'routeflow-api',audience:'routeflow-web',expiresIn:'2m'})}`});
    const httpInput={...input,clientId:'http-concurrent',status:'COMPLETED',completedStops:3,finishedAt:'2026-09-30T12:00:00.000Z'};
    const responses=await Promise.all(Array.from({length:12},()=>fetch(`${base}/v1/routes`,{method:'POST',headers:headers(users[0].id),body:JSON.stringify(httpInput)})));
    assert.equal(responses.filter(r=>r.status===201).length,1);assert.equal(responses.filter(r=>r.status===200).length,11);
    const bodies=await Promise.all(responses.map(r=>r.json()));assert.equal(new Set(bodies.map(r=>r.id)).size,1);
    // Ignore a successful response, then replay exactly the same request.
    const retried=await fetch(`${base}/v1/routes`,{method:'POST',headers:headers(users[0].id),body:JSON.stringify(httpInput)});
    assert.equal(retried.status,200);assert.equal((await retried.json()).id,bodies[0].id);
    const crossAccount=await fetch(`${base}/v1/routes`,{method:'POST',headers:headers(users[1].id),body:JSON.stringify(httpInput)});
    assert.equal(crossAccount.status,201);assert.notEqual((await crossAccount.json()).id,bodies[0].id);
    const active=await db.route.findUnique({where:{id:replay.route.id}});assert.equal(active.status,'ACTIVE');
    const unauthorized=await fetch(`${base}/v1/routes`);assert.equal(unauthorized.status,401);
    const terminal=await updateOwnedRoute(db,users[0].id,historical.route.id,{status:'ACTIVE',completedStops:1});
    assert.equal(terminal.status,'COMPLETED');assert.equal(terminal.completedStops,3);
    const free=await db.user.create({data:{email:`gate-a-free-${crypto.randomUUID()}@example.invalid`,passwordHash:'test-only'}});
    users.push(free);
    const quotaResponses=await Promise.all(Array.from({length:4},(_,i)=>fetch(`${base}/v1/routes`,{method:'POST',headers:headers(free.id),body:JSON.stringify({...input,clientId:`quota-${i}`})})));
    assert.equal(quotaResponses.filter(r=>r.status===201).length,2);
    assert.equal(quotaResponses.filter(r=>r.status===403).length,2);
    const acceptedIndex=quotaResponses.findIndex(r=>r.status===201);
    const quotaReplay=await fetch(`${base}/v1/routes`,{method:'POST',headers:headers(free.id),body:JSON.stringify({...input,clientId:`quota-${acceptedIndex}`})});
    assert.equal(quotaReplay.status,200,'Idempotent replay still works after quota is exhausted');
    const deniedStop=await fetch(`${base}/v1/routes`,{method:'POST',headers:headers(free.id),body:JSON.stringify({...input,clientId:'stop-limit',stops:26})});
    assert.equal(deniedStop.status,403);assert.equal((await deniedStop.json()).code,'STOP_LIMIT');
    const allowedOrigin=process.env.CORS_ORIGIN.split(',')[0].trim();
    const preflight=await fetch(`${base}/v1/routes`,{method:'OPTIONS',headers:{Origin:allowedOrigin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization,content-type'}});
    assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),allowedOrigin);
    const rejectedOrigin=await fetch(`${base}/v1/routes`,{method:'OPTIONS',headers:{Origin:'https://not-allowed.example.invalid','Access-Control-Request-Method':'POST'}});
    assert.equal(rejectedOrigin.headers.get('access-control-allow-origin'),null);
  } finally {
    for(const user of users)await db.user.delete({where:{id:user.id}});
    await new Promise(resolve=>server.close(resolve));await db.$disconnect();
  }
});
