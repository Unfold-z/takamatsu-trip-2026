import {watchEditor,loginEditor,logoutEditor,watchShopping,saveShopping,deleteShopping} from './firebase.js';
import {splitBill} from './split.js';
const $=id=>document.getElementById(id);
const escape=text=>{const d=document.createElement('div');d.textContent=String(text??'');return d.innerHTML;};
const money=n=>Number(n).toLocaleString('zh-TW',{maximumFractionDigits:0});
const labels={pending:'待買',bought:'已買',missing:'缺貨',cancelled:'取消'};
let items=[],unwatch=null,active=false,ready=false,editing=null,busy=false;
function message(text){$('shopMessage').textContent=text;}
function safeLink(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}}
function person(x){return x.kind==='self'?'自己':x.person||'未指定';}
function twd(x){return x.rate>0&&Number.isFinite(x.actual)?Math.round(x.actual*x.rate):null;}
function fillFilter(id,values){const el=$(id),selected=el.value;el.replaceChildren(new Option(id==='storeFilter'?'全部商店':'全部對象','all'),...values.map(v=>new Option(v,v)));if(values.includes(selected))el.value=selected;}
function render(){
  fillFilter('storeFilter',[...new Set(items.map(x=>x.store||'未指定商店'))].sort());
  fillFilter('personFilter',[...new Set(items.map(person))].sort());
  const filtered=items.filter(x=>($('statusFilter').value==='all'||x.status===$('statusFilter').value)&&($('storeFilter').value==='all'||(x.store||'未指定商店')===$('storeFilter').value)&&($('personFilter').value==='all'||person(x)===$('personFilter').value));
  $('shoppingCards').innerHTML=filtered.map(x=>`<article class="shopping-card"><small>${escape(labels[x.status])} · ${escape(person(x))}</small><h2>${escape(x.name)}</h2><p>${escape(x.spec||'未填規格')}</p><p>預計 ${x.quantity} 件${x.budget!==null?' · 預算 ¥'+money(x.budget):''}<br>${escape(x.store||'未指定商店')}</p>${x.status==='bought'?`<p>已買 ${x.actualQuantity} 件 · 實付 ¥${money(x.actual)}${twd(x)!==null?' · NT$'+money(twd(x)):''}</p>`:''}${x.note?`<details><summary>備註</summary><p>${escape(x.note)}</p></details>`:''}<div class="shop-card-actions"><button class="secondary-button" data-edit="${escape(x.id)}">編輯</button>${x.status!=='bought'?`<button class="primary-button" data-buy="${escape(x.id)}">記錄購買</button>`:''}${safeLink(x.link)?`<a class="map-button" href="${escape(safeLink(x.link))}" target="_blank" rel="noopener noreferrer">商品參考 ↗</a>`:''}</div></article>`).join('')||'<div class="empty">這個分類還沒有商品，點「＋ 新增」建立一筆。</div>';
  const bought=items.filter(x=>x.status==='bought');
  const total=bought.reduce((n,x)=>n+(Number(x.actual)||0),0);
  const pending=bought.filter(x=>x.kind==='proxy'&&!x.paid);
  const debt=pending.reduce((n,x)=>n+(twd(x)||0),0);
  $('shoppingTotals').innerHTML=`<div><span>已買總支出（日圓）</span><strong>¥${money(total)}</strong></div><div><span>代購待收（已填匯率／台幣）</span><strong>NT$${money(debt)}</strong></div><div><span>待補匯率／未收款商品</span><strong>${pending.filter(x=>twd(x)===null).length} 筆</strong></div>`;
  $('shoppingLedger').innerHTML=bought.map(x=>`<article class="ledger-item"><h3>${escape(x.name)}</h3><p>${escape(x.purchaseDate||'未填日期')} · ${escape(person(x))} · ${x.actualQuantity} 件</p><p>日圓 ¥${money(x.actual)} · ${twd(x)===null?'未填匯率':`台幣 NT$${money(twd(x))}（匯率 ${x.rate}）`}</p><p>${x.kind==='self'?'自己購物，不計待收款':x.paid?'已收款':'尚未收款'}</p><button class="secondary-button" data-edit="${escape(x.id)}">修改／記錄收款</button></article>`).join('')||'<div class="empty">尚無已買商品。購買時記錄實付金額，這裡就會自動彙總。</div>';
  const bills=bought.map(x=>({item:x,bill:splitBill(x)})).filter(x=>x.bill);
  const balance=bills.filter(x=>!x.item.settled).reduce((n,x)=>n+x.bill.balance,0);
  const splitSection=document.createElement('section');
  splitSection.className='split-summary';
  splitSection.innerHTML=`<h2>兩人分帳</h2><p class="split-result">${balance>0?`女友需給我 ¥${money(balance)}`:balance<0?`我需給女友 ¥${money(-balance)}`:'目前沒有未結清差額'}</p><p class="ledger-note">以未結清商品的日圓差額互相抵銷；朋友代購款不計入。${bought.filter(x=>x.kind==='self'&&!splitBill(x)).length} 筆自己購物尚未設定分帳。</p>${bills.map(({item:x,bill:b})=>`<article class="ledger-item"><h3>${escape(x.name)}</h3><p>${x.payer==='me'?'我':'女友'}先付 ¥${money(x.actual)} · 我負擔 ¥${money(b.mine)}／女友負擔 ¥${money(b.partner)}</p><p>${x.settled?'已結清':b.balance>0?`未結清：女友給我 ¥${money(b.balance)}`:b.balance<0?`未結清：我給女友 ¥${money(-b.balance)}`:'無需補款'}</p><button class="secondary-button" data-edit="${escape(x.id)}">調整分帳／結清</button></article>`).join('')}`;
  $('shoppingLedger').prepend(splitSection);
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEditor(b.dataset.edit));
  document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>openEditor(b.dataset.buy,true));
}
function fields(){
  const purchased=$('shopStatus').value==='bought',proxy=$('shopKind').value==='proxy';
  $('purchaseFields').hidden=!purchased;
  ['shopActual','shopActualQuantity','shopDate'].forEach(id=>$(id).required=purchased);
  $('shopPerson').required=proxy;$('shopPerson').disabled=!proxy;
  $('paidLabel').hidden=!proxy;
  const split=purchased&&!proxy;
  $('splitFields').hidden=!split;
  $('shopPayer').required=split&&$('shopSplit').value!=='none';
  $('customShareLabel').hidden=!split||$('shopSplit').value!=='custom';
  $('shopMyShare').required=split&&$('shopSplit').value==='custom';
}
function openEditor(id=null,buy=false){
  if(!active||!ready)return;
  editing=id?items.find(x=>x.id===id):null;
  if(id&&!editing)return;
  const x=editing||{};
  $('shoppingForm').reset();
  const values={shopName:x.name||'',shopKind:x.kind||'proxy',shopPerson:x.person||'',shopSpec:x.spec||'',shopQuantity:x.quantity||1,shopBudget:x.budget??'',shopStore:x.store||'',shopLink:x.link||'',shopStatus:buy?'bought':x.status||'pending',shopActualQuantity:x.actualQuantity||x.quantity||1,shopActual:x.actual??'',shopDate:x.purchaseDate||new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo'}).format(new Date()),shopRate:x.rate??'',shopPaid:x.paid?'yes':'no',shopNote:x.note||''};
  Object.entries(values).forEach(([id,value])=>$(id).value=value);
  $('shopPayer').value=x.payer||'';$('shopSplit').value=x.splitMode||'none';$('shopMyShare').value=x.myShare??'';$('shopSettled').value=x.settled?'yes':'no';
  $('shoppingDialogTitle').textContent=buy?'記錄實際購買':id?'編輯購物':'新增購物';
  $('removeShopping').hidden=!id;$('shoppingFormError').textContent='';fields();$('shoppingDialog').showModal();
}
function setBusy(value){busy=value;$('saveShoppingButton').disabled=value;$('removeShopping').disabled=value;$('closeShopping').disabled=value;$('cancelShopping').disabled=value;$('shoppingForm').classList.toggle('busy',value);}
function failure(e){return e.message==='conflict'?'另一台裝置已修改這筆資料。請關閉後重新開啟，避免覆蓋對方的修改。':e.code==='permission-denied'?'資料權限尚未設定或登入已失效，這次沒有儲存成功。':'同步失敗，請確認網路後重試；輸入內容仍保留。';}
$('shoppingForm').onsubmit=async event=>{
  event.preventDefault();if(busy||!active||!ready)return;
  const bought=$('shopStatus').value==='bought';
  const number=id=>$(id).value===''?null:Number($(id).value);
  const value={name:$('shopName').value.trim(),kind:$('shopKind').value,person:$('shopKind').value==='proxy'?$('shopPerson').value.trim():'',spec:$('shopSpec').value.trim(),quantity:number('shopQuantity'),budget:number('shopBudget'),store:$('shopStore').value.trim(),link:$('shopLink').value.trim(),status:$('shopStatus').value,actualQuantity:bought?number('shopActualQuantity'):null,actual:bought?number('shopActual'):null,purchaseDate:bought?$('shopDate').value:'',rate:bought?number('shopRate'):null,paid:bought&&$('shopKind').value==='proxy'&&$('shopPaid').value==='yes',note:$('shopNote').value.trim()};
  if(!value.name||(value.kind==='proxy'&&!value.person)||(value.link&&!safeLink(value.link))){$('shoppingFormError').textContent='請填寫商品、代購對象，並使用 http 或 https 商品連結。';return;}
  const splitting=bought&&value.kind==='self'&&$('shopSplit').value!=='none';
  Object.assign(value,{payer:splitting?$('shopPayer').value:'',splitMode:splitting?$('shopSplit').value:'none',myShare:splitting&&$('shopSplit').value==='custom'?number('shopMyShare'):null,settled:splitting&&$('shopSettled').value==='yes'});
  if(splitting&&!splitBill(value)){$('shoppingFormError').textContent='請選擇付款人；自訂負擔需為 0 到實付總額之間的整數日圓。';return;}
  if(editing?.settled&&['actual','payer','splitMode','myShare'].some(key=>editing[key]!==value[key]))value.settled=false;
  setBusy(true);$('shoppingFormError').textContent='';
  try{await saveShopping(editing?.id,value,editing?.revision||0);$('shoppingDialog').close();message('已儲存並同步。已買商品可在「購物記帳」查看。');}catch(e){$('shoppingFormError').textContent=failure(e);}finally{setBusy(false);}
};
$('removeShopping').onclick=async()=>{if(!editing||busy||!confirm('確定刪除這筆商品及其記帳資料？此操作無法復原。'))return;setBusy(true);try{await deleteShopping(editing.id,editing.revision);$('shoppingDialog').close();message('已刪除商品與對應記帳資料。');}catch(e){$('shoppingFormError').textContent=failure(e);}finally{setBusy(false);}};
['closeShopping','cancelShopping'].forEach(id=>$(id).onclick=()=>{if(!busy)$('shoppingDialog').close();});
$('shoppingDialog').addEventListener('cancel',e=>{if(busy)e.preventDefault();});
['shopStatus','shopKind','shopSplit'].forEach(id=>$(id).onchange=fields);
['statusFilter','storeFilter','personFilter'].forEach(id=>$(id).onchange=render);
$('addShopping').onclick=()=>openEditor();
document.querySelectorAll('[data-shop-tab]').forEach(b=>b.onclick=()=>{const ledger=b.dataset.shopTab==='ledger';$('listPanel').hidden=ledger;$('ledgerPanel').hidden=!ledger;document.querySelectorAll('[data-shop-tab]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));});
$('shoppingLogin').onsubmit=async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;try{await loginEditor($('shopPassword').value);$('shopPassword').value='';}catch{message('無法登入，請確認共用密碼與網路後重試。');}finally{b.disabled=false;}};
$('lockButton').onclick=async()=>{try{await logoutEditor();}catch{message('鎖定失敗，請重試。');}};
watchEditor(signedIn=>{
  active=signedIn;ready=false;if(unwatch){unwatch();unwatch=null;}items=[];
  $('shoppingForm').reset();$('shoppingDialog').close();editing=null;
  $('shoppingCards').replaceChildren();$('shoppingLedger').replaceChildren();$('shoppingTotals').replaceChildren();
  $('shoppingGate').hidden=signedIn;$('shoppingWorkspace').hidden=true;$('addShopping').hidden=!signedIn;$('addShopping').disabled=true;$('lockButton').hidden=!signedIn;
  if(!signedIn){message('購物資料需解鎖才能讀取。');return;}
  message('正在讀取私人購物資料…');
  unwatch=watchShopping(data=>{if(!active)return;items=data.sort((a,b)=>a.name.localeCompare(b.name,'zh-TW'));ready=true;$('shoppingWorkspace').hidden=false;$('addShopping').disabled=false;message('已連線，修改會同步到兩人的裝置。');render();},e=>{ready=false;$('addShopping').disabled=true;$('shoppingWorkspace').hidden=true;message(e.code==='permission-denied'?'尚未開放私人購物資料權限，請先在 Firebase 發佈購物資料規則。清單未載入，請勿改用公開行程存放。':'購物資料讀取失敗，請確認網路並重新整理。');});
});
