const buckets=new Map();
export function rateLimit({windowMs=60_000,max=120,keyPrefix='api'}={}){return(req,res,next)=>{const now=Date.now(),ip=req.ip||req.socket?.remoteAddress||'unknown',key=`${keyPrefix}:${ip}`,old=buckets.get(key);if(!old||old.resetAt<=now){buckets.set(key,{count:1,resetAt:now+windowMs});return next()}old.count++;if(old.count>max){res.setHeader('Retry-After',String(Math.ceil((old.resetAt-now)/1000)));return res.status(429).json({error:'Muitas tentativas. Aguarde e tente novamente.'})}next()}}
export function cleanupRateLimits(now=Date.now()){for(const[key,value]of buckets)if(value.resetAt<=now)buckets.delete(key)}
setInterval(()=>cleanupRateLimits(),300_000).unref?.();
