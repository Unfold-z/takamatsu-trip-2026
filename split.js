export function splitBill(x){
  if(x.status!=='bought'||x.kind!=='self'||!['me','partner'].includes(x.payer)||!Number.isSafeInteger(x.actual)||x.actual<0)return null;
  let mine;
  if(x.splitMode==='half')mine=x.payer==='me'?Math.ceil(x.actual/2):Math.floor(x.actual/2);
  else if(x.splitMode==='me')mine=x.actual;
  else if(x.splitMode==='partner')mine=0;
  else if(x.splitMode==='custom')mine=x.myShare;
  else return null;
  if(!Number.isSafeInteger(mine)||mine<0||mine>x.actual)return null;
  return {mine,partner:x.actual-mine,balance:x.payer==='me'?x.actual-mine:-mine};
}
