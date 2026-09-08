const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
export const cardFeeConfig=()=>({percent:clamp(Number(process.env.ASAAS_CARD_FEE_PERCENT||0),0,50),fixedCents:clamp(Math.round(Number(process.env.ASAAS_CARD_FIXED_FEE_CENTS||0)),0,100000)});
export function paymentPrices(baseCents){const base=Math.max(0,Math.round(Number(baseCents)||0)),fee=cardFeeConfig(),rate=fee.percent/100;const card=rate<1?Math.ceil((base+fee.fixedCents)/(1-rate)):base;return{baseCents:base,pixCents:base,cardCents:card,pixDiscountCents:Math.max(0,card-base),cardFee:{percent:fee.percent,fixedCents:fee.fixedCents}}}
