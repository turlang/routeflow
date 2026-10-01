// User-row locking serializes both creation and updates across API processes.
// The existing database unique index (userId, clientId) is the final backstop.
async function lockUser(tx, userId) {
  await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
}
export async function createOwnedRoute(db, userId, input, beforeCreate) {
  return db.$transaction(async tx => {
    await lockUser(tx, userId);
    if (input.clientId) {
      const existing = await tx.route.findUnique({where:{userId_clientId:{userId,clientId:input.clientId}}});
      if (existing) return {route:existing,created:false};
    }
    if (beforeCreate) {
      const denied = await beforeCreate(tx);
      if (denied) return {denied};
    }
    const now = new Date(), status = input.status || 'ACTIVE';
    if (status === 'ACTIVE') await tx.route.updateMany({where:{userId,status:'ACTIVE'},data:{status:'CANCELLED',finishedAt:now}});
    const route = await tx.route.create({data:{
      userId,clientId:input.clientId,sourceFilename:input.sourceFilename,status,
      startedAt:input.startedAt?new Date(input.startedAt):now,
      finishedAt:input.finishedAt?new Date(input.finishedAt):['COMPLETED','CANCELLED'].includes(status)?now:undefined,
      plannedKm:input.plannedKm,plannedMinutes:input.plannedMinutes,stops:input.stops,
      deliveriesCount:input.deliveriesCount,completedStops:input.completedStops??0,operational:input.operational,
    }});
    return {route,created:true};
  }, {maxWait:15000,timeout:15000});
}
export async function updateOwnedRoute(db, userId, id, input) {
  return db.$transaction(async tx => {
    await lockUser(tx, userId);
    const route = await tx.route.findFirst({where:{id,userId}});
    if (!route) return null;
    const data = {...input};
    if (input.completedStops !== undefined) data.completedStops = Math.max(route.completedStops,input.completedStops);
    // Replayed stale updates cannot reopen or change a terminal route.
    if (['COMPLETED','CANCELLED'].includes(route.status)) {
      data.status = route.status;
      delete data.finishedAt;
    } else if (input.finishedAt !== undefined) data.finishedAt = input.finishedAt ? new Date(input.finishedAt) : null;
    return tx.route.update({where:{id},data});
  }, {maxWait:15000,timeout:15000});
}
