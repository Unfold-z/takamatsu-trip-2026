import { watchEditor, watchTrip, loginEditor, logoutEditor, saveTrip } from "./firebase.js";

const STORAGE_KEY = "setouchi-trip-preferences-v2";

const seed = {
  selectedDay: 0,
  showPrivate: false,
  days: [
    { date:"2026-09-09", weekday:"週三", title:"高松 → 高知", subtitle:"天空鳥居與土佐第一夜", items:[
      {id:"d1-1",time:"05:40",name:"出發準備",type:"交通",status:"pending",note:"原文件記錄 05:40；請再確認這是集合／出門時間或班機起飛時間。"},
      {id:"d1-2",time:"12:20",name:"抵達高松機場・取車",type:"交通",status:"booked",map:"https://maps.app.goo.gl/",travel:"機場接駁與租車",note:"JX300；禁煙輕型車。取車後先確認 ETC、油種與還車方式。",private:"租車與預訂編號請查看私人訂位文件。"},
      {id:"d1-3",time:"午餐",name:"いなもくうどん Inamoku",type:"餐廳",status:"confirmed",map:"https://maps.app.goo.gl/cFqKMBQshbH1zn1z5",travel:"機場出發約 13 分鐘",note:"被稱為「烏龍麵的刺身」，可以先不加配料品嚐麵體。"},
      {id:"d1-4",time:"15:30",name:"高屋神社・天空鳥居",type:"景點",status:"confirmed",map:"https://maps.app.goo.gl/2h11P7hcKAw6DnDi7",travel:"車程約 57 分鐘",note:"標高 404 公尺，可眺望觀音寺與瀨戶內海；留意上山交通及天候。"},
      {id:"d1-5",time:"晚餐",name:"ひろめ市場・明神丸",type:"餐廳",status:"confirmed",map:"https://maps.app.goo.gl/UeurvSM5SvmjnQb68",travel:"前往高知約 1 小時 20 分鐘",note:"招牌是稻草炙燒鰹魚與鹽味鰹魚。"},
      {id:"d1-6",time:"住宿",name:"東橫 INN 高知",type:"住宿",status:"booked",map:"https://maps.app.goo.gl/7NkdyYyJ3qtUfHjb9",note:"連住兩晚；若延後抵達，記得依訂房規定聯絡飯店。",private:"住宿姓名、金額與預訂號碼請查看私人訂位文件。"}
    ], choices:[]},
    { date:"2026-09-10", weekday:"週四", title:"仁淀川・仁淀藍", subtitle:"清流、溪谷與山間茶屋", items:[
      {id:"d2-1",time:"早餐",name:"飯店早餐",type:"餐廳",status:"confirmed"},
      {id:"d2-2",time:"10:00",name:"高知城",type:"景點",status:"confirmed",map:"https://maps.app.goo.gl/T7UtLcKKhhTLdq7G9",note:"日本百座名城之一，也是現存十二天守之一。"},
      {id:"d2-3",time:"13:00",name:"大正軒 Taishoken",type:"餐廳",status:"booked",map:"https://maps.app.goo.gl/PSKT7HZzQHVPVbjV8",travel:"車程約 42 分鐘",note:"鰻魚蒲燒與鰻魚肝清湯；原文件記錄已訂位 13:00。"},
      {id:"d2-4",time:"待調整",name:"仁淀川",type:"景點",status:"pending",travel:"大正軒出發約 11 分鐘",note:"原文件同樣寫 13:00，與午餐訂位重疊，請調整出發時間。"},
      {id:"d2-5",time:"下午茶",name:"引地橋茶屋 Hikichi Chaya",type:"餐廳",status:"backup",map:"https://maps.app.goo.gl/qsPJZdN6dfUkX1CU7",travel:"車程約 19 分鐘",note:"可看仁淀川，供應關東煮、烤魚與烏龍麵；時間不足可略過。"},
      {id:"d2-6",time:"14:45",name:"中津溪谷",type:"景點",status:"confirmed",travel:"車程約 6 分鐘",note:"雨龍瀑布、七福神石像與溪谷步道。"},
      {id:"d2-7",time:"傍晚",name:"Blue Brew by Mukai Craft Brewing",type:"餐廳",status:"backup",map:"https://maps.app.goo.gl/pqP7jTLb9grDYZao",travel:"車程約 7 分鐘",note:"使用仁淀川水源釀造的精釀啤酒；開車者請勿飲酒。"},
      {id:"d2-8",time:"住宿",name:"東橫 INN 高知",type:"住宿",status:"booked",travel:"返回約 1 小時 30 分鐘"}
    ], choices:[
      {id:"c2-1",name:"屋台安兵衛 Yasube",type:"晚餐",map:"https://maps.app.goo.gl/8F6U67ZfXWWJanox6",note:"高知晚餐候選"},
      {id:"c2-2",name:"四十五圓",type:"晚餐",map:"https://maps.app.goo.gl/eUTfNNC51ELJrzoAA",note:"高知晚餐候選"},
      {id:"c2-3",name:"はりまや横丁",type:"晚餐",map:"https://maps.app.goo.gl/HvyX1t3rVRFsBSRC8",note:"高知晚餐候選"}
    ]},
    { date:"2026-09-11", weekday:"週五", title:"高知 → 高松", subtitle:"桂濱、峽谷與屋島夕陽", items:[
      {id:"d3-1",time:"08:30",name:"從飯店出發",type:"交通",status:"confirmed"},
      {id:"d3-2",time:"09:00–11:00",name:"桂濱水族館",type:"景點",status:"confirmed",map:"https://maps.app.goo.gl/jYawffLdP6YVWsRP9",travel:"車程約 25 分鐘",note:"原文件記錄成人票 1,600 日圓；出發前再確認最新票價。"},
      {id:"d3-3",time:"11:00–11:30",name:"桂濱公園",type:"景點",status:"confirmed",map:"https://maps.app.goo.gl/szAmgDewHU4sQ8TR8",note:"月牙形海岸、太平洋景色與坂本龍馬像。"},
      {id:"d3-4",time:"午餐",name:"桂浜 海のテラス",type:"餐廳",status:"pending",map:"https://maps.app.goo.gl/L51TTqEvWeAKMrBk7",note:"現場從海鮮、焙茶、神或 Bellmare 中挑選。"},
      {id:"d3-5",time:"13:30–14:30",name:"小步危展望點",type:"景點",status:"confirmed",travel:"車程約 1 小時 25 分鐘",note:"欣賞吉野川峽谷、岩石與群山。"},
      {id:"d3-6",time:"16:00",name:"呆呆獸公園・AEON 綾川",type:"景點",status:"confirmed",map:"https://maps.app.goo.gl/xGQDNH2vQ1YZJLcD8",travel:"車程約 1 小時 12 分鐘",note:"公園後可順路前往 AEON 綾川。"},
      {id:"d3-7",time:"日落前",name:"屋島展望台",type:"景點",status:"pending",travel:"車程約 45 分鐘",note:"出發前確認當日日落與天候；可眺望瀨戶內海。"},
      {id:"d3-8",time:"住宿",name:"巡り宿中野町",type:"住宿",status:"booked",travel:"車程約 30 分鐘",private:"住宿訂位資料請查看私人文件。"}
    ], choices:[
      {id:"c3-1",name:"活海老貝卸の店 うみさち",type:"午餐",map:"https://maps.app.goo.gl/z44QghfupTq3Xi9n6",note:"桂濱海鮮候選"},
      {id:"c3-2",name:"マンテンノホシ 桂浜店",type:"下午茶",map:"https://maps.app.goo.gl/msWfCBjDGeuuC8Nd9",note:"焙茶專門店"}
    ]},
    { date:"2026-09-12", weekday:"週六", title:"鳴門一日", subtitle:"漩渦、海鮮與海岸線", items:[
      {id:"d4-1",time:"09:00",name:"從高松出發",type:"交通",status:"confirmed"},
      {id:"d4-2",time:"10:00",name:"鳴門魚市場",type:"餐廳",status:"pending",map:"https://maps.app.goo.gl/kUJJ394q165jHMtS7",travel:"車程約 1 小時",note:"9/12 是週六；原文件只記錄星期日營業時間，務必再確認週六是否營業。"},
      {id:"d4-3",time:"12:15",name:"鳴門觀潮船 Aqua Eddy",type:"景點",status:"booked",map:"https://maps.app.goo.gl/HjYt2C2dDqFgFRUa9",travel:"車程約 21 分鐘",note:"至少提前 10 分鐘到售票櫃檯；旺季建議更早抵達。"},
      {id:"d4-4",time:"13:45",name:"渦之道",type:"景點",status:"confirmed",map:"https://maps.app.goo.gl/RSD3yMSseZ44SNEX9",travel:"車程約 6 分鐘",note:"需購票，可比較現場與線上票價。"},
      {id:"d4-5",time:"午餐",name:"潮風・鯛魚茶泡飯與鳴門烏龍麵",type:"餐廳",status:"pending",map:"https://maps.app.goo.gl/h6ciDThQ2hUH67My5",travel:"車程約 11 分鐘",note:"出發前查看店家社群的臨時店休公告。"},
      {id:"d4-6",time:"16:00",name:"四方見展望台",type:"景點",status:"confirmed",map:"https://maps.app.goo.gl/tB4Xui9bGP9o3L4y6",travel:"車程約 10 分鐘",note:"鳴門天際線上的內海、漁村與群山景觀。"},
      {id:"d4-7",time:"住宿",name:"巡り宿中野町",type:"住宿",status:"booked",travel:"返回約 1 小時 10 分鐘"}
    ], choices:[
      {id:"c4-1",name:"SAKE STAND CHIRO",type:"酒吧",map:"https://maps.app.goo.gl/RXmYeZFhYycDDFUs6",note:"清酒立吞"},
      {id:"c4-2",name:"BAR TIE",type:"酒吧",map:"https://maps.app.goo.gl/XPF3TTTzPxQSdRjp7",note:"氣氛親切的酒吧"},
      {id:"c4-3",name:"Bar タビ式",type:"酒吧",map:"https://maps.app.goo.gl/VyCjkQCkyXwpVp397",note:"以 Signature 為主；假日可能無法 walk-in"},
      {id:"c4-4",name:"BAR 足袋",type:"酒吧",map:"https://maps.app.goo.gl/HJcqnnhNQ7s7DteV7",note:"較傳統的姐妹店"}
    ]},
    { date:"2026-09-13", weekday:"週日", title:"高松市區散策", subtitle:"庭園、商店街與最後晚餐", items:[
      {id:"d5-1",time:"10:30",name:"栗林公園",type:"景點",status:"confirmed",map:"https://maps.app.goo.gl/RNE3WzkjXQCJTSRe9"},
      {id:"d5-2",time:"中午起",name:"高松中央商店街・高松三越",type:"購物",status:"pending",note:"原行程尚未安排午餐與停留時間，可視購物狀況調整。"},
      {id:"d5-3",time:"住宿",name:"巡り宿中野町",type:"住宿",status:"booked"}
    ], choices:[
      {id:"c5-1",name:"大衆焼肉しんすけ",type:"晚餐",map:"https://maps.app.goo.gl/ynJYGFcQfdrGWzYt5",note:"黑毛和牛與內臟燒肉"},
      {id:"c5-2",name:"しんみょう精肉店",type:"晚餐",map:"https://maps.app.goo.gl/HqHcjZFqEaRCj9Nn6",note:"在地高 CP 值燒肉候選"},
      {id:"c5-3",name:"骨付鳥 寄鳥味鳥",type:"晚餐",map:"https://maps.app.goo.gl/ykNaQCxixDtACRzj9",note:"香川骨付鳥候選"},
      {id:"c5-4",name:"骨付鳥一鶴 高松店",type:"晚餐",map:"https://maps.app.goo.gl/tuAtFBDXRyqMJ3Qd6",note:"經典骨付鳥"},
      {id:"c5-5",name:"ぎょうざ屋 Gyouzaya",type:"晚餐",map:"https://maps.app.goo.gl/nCzzK9DtHbVf3UgJ6",note:"餃子候選"},
      {id:"c5-6",name:"旬彩真 和っか Wakka",type:"晚餐",map:"https://maps.app.goo.gl/VRRFGa8CFvs4bHSS8",note:"旬味料理候選"},
      {id:"c5-7",name:"うどん棒 高松本店",type:"餐廳",map:"https://maps.app.goo.gl/fRxMwggMgEvdfAMY9",note:"烏龍麵候選"}
    ]},
    { date:"2026-09-14", weekday:"週一", title:"返程", subtitle:"把瀨戶內的風帶回家", items:[
      {id:"d6-1",time:"上午",name:"飯店退房",type:"住宿",status:"confirmed"},
      {id:"d6-2",time:"10:20",name:"抵達高松機場・還車",type:"交通",status:"confirmed",note:"預留加油、還車與接駁時間。"},
      {id:"d6-3",time:"12:20",name:"高松起飛",type:"交通",status:"booked"},
      {id:"d6-4",time:"16:15",name:"抵達臺中國際機場",type:"交通",status:"booked"}
    ], choices:[
      {id:"c6-1",name:"高松東魚市場・海町商店街",type:"備案",map:"https://maps.app.goo.gl/sQqoEnsvymon4T1BA",note:"若最後一天時間充裕可考慮"}
    ]}
  ]
};

const clone = (x) => JSON.parse(JSON.stringify(x));
let preferences={selectedDay:0,showPrivate:false};
try { preferences={...preferences,...JSON.parse(localStorage.getItem(STORAGE_KEY))}; } catch {}
let state={...clone(seed),...preferences};
let isEditor=false;
let currentFilter="all";
const collapsedCards=new Set();
let mapMode="day";
let routeMap;
let routeLayer;

const LOCATION_COORDS={
  "d1-2":[34.2142,134.0156],"d1-3":[34.2228,134.0168],"d1-4":[34.1174,133.6455],"d1-5":[33.5596,133.5311],"d1-6":[33.5681,133.5434],
  "d2-1":[33.5681,133.5434],"d2-2":[33.5613,133.5315],"d2-3":[33.5007,133.2894],"d2-4":[33.5485,133.2162],"d2-5":[33.5712,133.1686],"d2-6":[33.5758,133.1037],"d2-7":[33.5858,133.1022],"d2-8":[33.5681,133.5434],
  "d3-1":[33.5681,133.5434],"d3-2":[33.4982,133.5738],"d3-3":[33.4968,133.5727],"d3-4":[33.4974,133.5735],"d3-5":[33.8778,133.7550],"d3-6":[34.2490,133.9298],"d3-7":[34.3591,134.1058],"d3-8":[34.3332,134.0431],
  "d4-1":[34.3332,134.0431],"d4-2":[34.1829,134.6080],"d4-3":[34.2366,134.6380],"d4-4":[34.2393,134.6370],"d4-5":[34.2172,134.6190],"d4-6":[34.2204,134.5838],"d4-7":[34.3332,134.0431],
  "d5-1":[34.3294,134.0443],"d5-2":[34.3450,134.0500],"d5-3":[34.3332,134.0431],
  "d6-1":[34.3332,134.0431],"d6-2":[34.2142,134.0156],"d6-3":[34.2142,134.0156]
};
const DAY_COLORS=["#e96743","#1d7f8c","#4b8164","#735f9b","#d39b38","#456b8a"];

const $ = (id) => document.getElementById(id);
const statusLabel = {pending:"待討論",confirmed:"已確認",booked:"已預約",backup:"備案"};
let toastTimer;

function savePreferences(){ localStorage.setItem(STORAGE_KEY,JSON.stringify({selectedDay:state.selectedDay,showPrivate:state.showPrivate})); }
async function save(message){
  savePreferences();
  if(!isEditor){if(message)toast("請先輸入編輯密碼");return;}
  try{await saveTrip(state.days);if(message)toast(message);}catch{toast("同步失敗，請確認網路後重試");}
}
function requireEditor(action){
  if(isEditor){action();return;}
  $("loginError").textContent="";
  $("passwordInput").value="";
  $("loginDialog").showModal();
}
function toast(message){ clearTimeout(toastTimer); $("toast").textContent=message; $("toast").classList.add("show"); toastTimer=setTimeout(()=>$("toast").classList.remove("show"),1800); }
function safe(text=""){ const d=document.createElement("div"); d.textContent=text; return d.innerHTML; }

function render(){
  const day=state.days[state.selectedDay];
  $("dayTabs").innerHTML=state.days.map((d,i)=>`<button class="day-tab ${i===state.selectedDay?"active":""}" data-day="${i}"><span>DAY ${i+1}</span><strong>${d.date.slice(5).replace("-","/")} ${d.weekday}</strong></button>`).join("");
  $("dayMeta").textContent=`DAY ${state.selectedDay+1} · ${day.date.replaceAll("-",".")} · ${day.weekday}`;
  $("dayTitle").textContent=day.title;
  const visibleItems=currentFilter==="all"?day.items:day.items.filter(x=>x.status===currentFilter||(currentFilter==="confirmed"&&x.status==="booked"));
  $("timeline").innerHTML=visibleItems.length?visibleItems.map(itemCard).join(""):`<div class="empty">這個篩選條件下沒有行程。</div>`;
  $("choiceGrid").innerHTML=day.choices.length?day.choices.map(choiceCard).join(""):`<div class="empty">尚無候選地點</div>`;
  const done=day.items.filter(x=>["confirmed","booked"].includes(x.status)).length;
  $("progressText").textContent=`${done} / ${day.items.length}`;
  $("progressBar").style.width=`${day.items.length?done/day.items.length*100:0}%`;
  $("countAll").textContent=day.items.length;
  $("countPending").textContent=day.items.filter(x=>x.status==="pending").length;
  $("countConfirmed").textContent=day.items.filter(x=>x.status==="confirmed").length;
  $("countBooked").textContent=day.items.filter(x=>x.status==="booked").length;
  $("privacyToggle").checked=!!state.showPrivate;
  $("editorButton").textContent=isEditor?"✓ 編輯中":"🔒 編輯";
  $("editorButton").classList.toggle("active",isEditor);
  bindDynamic();
  requestAnimationFrame(renderRouteMap);
}

function routePoints(dayIndex){
  return state.days[dayIndex].items.map((item,index)=>({item,index,coords:LOCATION_COORDS[item.id]})).filter(x=>x.coords);
}

function initRouteMap(){
  if(routeMap||!window.L)return;
  routeMap=L.map("routeMap",{scrollWheelZoom:false,zoomControl:true});
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(routeMap);
  routeLayer=L.layerGroup().addTo(routeMap);
  routeMap.setView([34.05,133.85],8);
}

function renderRouteMap(){
  initRouteMap();
  if(!routeMap)return;
  routeLayer.clearLayers();
  const days=mapMode==="all"?state.days.map((_,i)=>i):[state.selectedDay];
  const bounds=[];
  let count=0;
  days.forEach(dayIndex=>{
    const points=routePoints(dayIndex);
    const color=DAY_COLORS[dayIndex];
    if(points.length>1)L.polyline(points.map(x=>x.coords),{color,weight:4,opacity:.72,dashArray:mapMode==="all"?"8 7":null}).addTo(routeLayer);
    points.forEach((point,routeIndex)=>{
      count++;
      bounds.push(point.coords);
      const label=mapMode==="all"?`${dayIndex+1}-${routeIndex+1}`:`${routeIndex+1}`;
      const icon=L.divIcon({className:"route-marker-wrap",html:`<span class="route-marker" style="--marker-color:${color}">${label}</span>`,iconSize:[34,34],iconAnchor:[17,17]});
      const navigation=point.item.map?`<a href="${safe(point.item.map)}" target="_blank" rel="noopener">開啟導航 ↗</a>`:"";
      L.marker(point.coords,{icon}).bindPopup(`<div class="map-popup"><small>DAY ${dayIndex+1} · ${safe(point.item.time)}</small><strong>${safe(point.item.name)}</strong>${navigation}</div>`).addTo(routeLayer);
    });
  });
  if(bounds.length)routeMap.fitBounds(bounds,{padding:[34,34],maxZoom:12});
  setTimeout(()=>routeMap.invalidateSize(),50);
  const day=state.days[state.selectedDay];
  $("mapSummary").textContent=mapMode==="all"?`六天共 ${count} 個行程地標`:`DAY ${state.selectedDay+1} · ${day.title} · ${count} 個地標`;
  document.querySelectorAll("[data-map-mode]").forEach(button=>button.classList.toggle("active",button.dataset.mapMode===mapMode));
  const points=routePoints(state.selectedDay);
  const routeButton=$("dayRouteButton");
  if(mapMode==="day"&&points.length>1){
    const names=points.map(x=>x.item.name);
    const params=new URLSearchParams({api:"1",origin:names[0],destination:names[names.length-1],travelmode:"driving"});
    if(names.length>2)params.set("waypoints",names.slice(1,-1).join("|"));
    routeButton.href=`https://www.google.com/maps/dir/?${params}`;
    routeButton.hidden=false;
  }else routeButton.hidden=true;
}

function itemCard(x){
  const note=x.note?`<p class="note">${safe(x.note)}</p>`:"";
  const privacy=x.private&&state.showPrivate?`<p class="private-note">🔒 ${safe(x.private)}</p>`:"";
  const travel=x.travel?`<p class="travel-line">→ ${safe(x.travel)}</p>`:"";
  const map=x.map?`<a class="map-button" href="${safe(x.map)}" target="_blank" rel="noopener">↗ 開啟導航</a>`:"";
  const checked=["confirmed","booked"].includes(x.status);
  return `<article class="timeline-item"><time class="timeline-time">${safe(x.time)}</time><span class="timeline-dot"></span><div class="timeline-card ${collapsedCards.has(x.id)?"collapsed":""}" data-card="${x.id}"><div class="card-top"><div><div class="type-line"><span class="type-badge">${safe(x.type)}</span><span class="status-badge ${x.status}">${statusLabel[x.status]||"待討論"}</span></div><h3>${safe(x.name)}</h3></div><button class="card-menu edit-item" data-id="${x.id}" aria-label="編輯 ${safe(x.name)}">•••</button></div>${travel}${note}${privacy}<div class="card-actions">${map}<button class="confirm-button ${checked?"checked":""}" data-confirm="${x.id}">${checked?"✓ 已確認":"○ 標為確認"}</button></div></div></article>`;
}

function choiceCard(x){ return `<article class="choice-card"><span class="type-badge">${safe(x.type)}</span><h3>${safe(x.name)}</h3><p>${safe(x.note||"")}</p><div class="choice-actions">${x.map?`<a class="map-button" href="${safe(x.map)}" target="_blank" rel="noopener">↗ 地圖</a>`:""}<button class="confirm-button edit-choice" data-id="${x.id}">編輯</button></div></article>`; }

function bindDynamic(){
  document.querySelectorAll("[data-day]").forEach(b=>b.onclick=()=>{state.selectedDay=Number(b.dataset.day);savePreferences();render();window.scrollTo({top:300,behavior:"smooth"});});
  document.querySelectorAll(".edit-item").forEach(b=>b.onclick=()=>requireEditor(()=>openEditor("item",b.dataset.id)));
  document.querySelectorAll(".edit-choice").forEach(b=>b.onclick=()=>requireEditor(()=>openEditor("choice",b.dataset.id)));
  document.querySelectorAll("[data-confirm]").forEach(b=>b.onclick=()=>requireEditor(()=>{const x=currentDay().items.find(i=>i.id===b.dataset.confirm);x.status=["confirmed","booked"].includes(x.status)?"pending":"confirmed";save("狀態已更新");render();}));
  document.querySelectorAll("[data-card]").forEach(card=>card.onclick=e=>{if(e.target.closest("button,a"))return;const id=card.dataset.card;collapsedCards.has(id)?collapsedCards.delete(id):collapsedCards.add(id);card.classList.toggle("collapsed");});
}

const currentDay=()=>state.days[state.selectedDay];
function openEditor(kind,id){
  const list=kind==="choice"?currentDay().choices:currentDay().items;
  const item=id?list.find(x=>x.id===id):{id:"",time:"",name:"",type:kind==="choice"?"備案":"景點",map:"",travel:"",status:kind==="choice"?"backup":"pending",note:""};
  $("editId").value=item.id; $("editKind").value=kind; $("editTime").value=item.time||""; $("editName").value=item.name||""; $("editType").value=item.type||"景點"; $("editMap").value=item.map||""; $("editTravel").value=item.travel||""; $("editStatus").value=item.status||"pending"; $("editNote").value=item.note||"";
  $("dialogTitle").textContent=id?"編輯行程":"新增行程"; $("deleteButton").style.visibility=id?"visible":"hidden"; $("editTime").parentElement.style.display=kind==="choice"?"none":"block"; $("editTravel").parentElement.style.display=kind==="choice"?"none":"block"; $("editStatus").parentElement.style.display=kind==="choice"?"none":"block"; $("editDialog").showModal();
}

$("editForm").onsubmit=(e)=>{e.preventDefault();const kind=$("editKind").value;const list=kind==="choice"?currentDay().choices:currentDay().items;const id=$("editId").value||`${kind}-${Date.now()}`;const old=list.find(x=>x.id===id)||{};const value={...old,id,time:$("editTime").value.trim(),name:$("editName").value.trim(),type:$("editType").value,map:$("editMap").value.trim(),travel:$("editTravel").value.trim(),status:kind==="choice"?"backup":$("editStatus").value,note:$("editNote").value.trim()};const at=list.findIndex(x=>x.id===id);if(at>=0)list[at]=value;else list.push(value);save("行程已儲存");$("editDialog").close();render();};
$("deleteButton").onclick=()=>{const kind=$("editKind").value,id=$("editId").value;if(!id)return;const key=kind==="choice"?"choices":"items";currentDay()[key]=currentDay()[key].filter(x=>x.id!==id);save("項目已刪除");$("editDialog").close();render();};
$("addButton").onclick=()=>requireEditor(()=>openEditor("item")); $("addChoiceButton").onclick=()=>requireEditor(()=>openEditor("choice"));
$("settingsButton").onclick=()=>$("settingsDialog").showModal();
$("privacyToggle").onchange=(e)=>{state.showPrivate=e.target.checked;savePreferences();render();};
$("todayButton").onclick=()=>{const local=new Date().toLocaleDateString("en-CA");const found=state.days.findIndex(d=>d.date===local);state.selectedDay=found>=0?found:0;savePreferences();render();toast(found>=0?"已切換到今天":"旅程尚未開始，先顯示 Day 1");};
$("exportButton").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`setouchi-trip-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast("備份已下載");};
$("importInput").onchange=async(e)=>{if(!isEditor){e.target.value="";$("settingsDialog").close();requireEditor(()=>{});return;}try{const data=JSON.parse(await e.target.files[0].text());if(!Array.isArray(data.days)||data.days.length!==6)throw new Error();state={...state,days:data.days};await save("行程已匯入");$("settingsDialog").close();render();}catch{toast("檔案格式不正確");}e.target.value="";};
$("resetButton").onclick=()=>requireEditor(()=>{if(confirm("確定要清除所有人的修改，還原最初行程嗎？")){state={...state,days:clone(seed.days)};save("已還原原始行程");$("settingsDialog").close();render();}});
$("editorButton").onclick=()=>isEditor?logoutEditor():requireEditor(()=>{});
$("prevDayButton").onclick=()=>{state.selectedDay=(state.selectedDay+state.days.length-1)%state.days.length;savePreferences();render();};
$("nextDayButton").onclick=()=>{state.selectedDay=(state.selectedDay+1)%state.days.length;savePreferences();render();};
document.querySelectorAll("[data-filter]").forEach(button=>button.onclick=()=>{currentFilter=button.dataset.filter;document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x===button));render();});
document.querySelectorAll("[data-map-mode]").forEach(button=>button.onclick=()=>{mapMode=button.dataset.mapMode;renderRouteMap();});
document.querySelectorAll(".dialog-close").forEach(button=>button.onclick=()=>button.closest("dialog").close());
$("loginForm").onsubmit=async(e)=>{e.preventDefault();$("loginSubmit").disabled=true;$("loginError").textContent="";try{await loginEditor($("passwordInput").value);$("loginDialog").close();toast("已進入編輯模式");}catch{$("loginError").textContent="密碼不正確，請再試一次。";}finally{$("loginSubmit").disabled=false;}};

watchEditor(active=>{isEditor=active;render();});
watchTrip(data=>{if(data?.days?.length){state={...state,days:data.days};render();}},()=>toast("目前使用離線行程"));

render();
