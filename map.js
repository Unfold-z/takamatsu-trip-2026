import { watchTrip } from "./firebase.js";

const DAYS=[
  {title:"高松 → 高知",points:[["d1-2","12:20","高松機場・取車",34.2142,134.0156],["d1-3","午餐","Inamoku 烏龍麵",34.2228,134.0168],["d1-4","15:30","高屋神社・天空鳥居",34.1174,133.6455],["d1-5","晚餐","ひろめ市場・明神丸",33.5596,133.5311],["d1-6","住宿","東橫 INN 高知",33.5681,133.5434]]},
  {title:"仁淀川・仁淀藍",points:[["d2-1","早餐","東橫 INN 高知",33.5681,133.5434],["d2-2","10:00","高知城",33.5613,133.5315],["d2-3","13:00","大正軒",33.5007,133.2894],["d2-4","午後","仁淀川",33.5485,133.2162],["d2-5","下午茶","引地橋茶屋",33.5712,133.1686],["d2-6","14:45","中津溪谷",33.5758,133.1037],["d2-7","傍晚","Blue Brew",33.5858,133.1022],["d2-8","住宿","東橫 INN 高知",33.5681,133.5434]]},
  {title:"高知 → 高松",points:[["d3-1","08:30","高知出發",33.5681,133.5434],["d3-2","09:00","桂濱水族館",33.4982,133.5738],["d3-3","11:00","桂濱公園",33.4968,133.5727],["d3-4","午餐","桂浜 海のテラス",33.4974,133.5735],["d3-5","13:30","小步危展望點",33.8778,133.755],["d3-6","16:00","呆呆獸公園・AEON 綾川",34.249,133.9298],["d3-7","日落前","屋島展望台",34.3591,134.1058],["d3-8","住宿","巡り宿中野町",34.3332,134.0431]]},
  {title:"鳴門一日",points:[["d4-1","09:00","高松出發",34.3332,134.0431],["d4-2","10:00","鳴門魚市場",34.1829,134.608],["d4-3","12:15","觀潮船 Aqua Eddy",34.2366,134.638],["d4-4","13:45","渦之道",34.2393,134.637],["d4-5","午餐","潮風",34.2172,134.619],["d4-6","16:00","四方見展望台",34.2204,134.5838],["d4-7","住宿","巡り宿中野町",34.3332,134.0431]]},
  {title:"高松市區散策",points:[["d5-1","10:30","栗林公園",34.3294,134.0443],["d5-2","中午起","高松中央商店街・三越",34.345,134.05],["d5-3","住宿","巡り宿中野町",34.3332,134.0431]]},
  {title:"返程",points:[["d6-1","上午","巡り宿中野町・退房",34.3332,134.0431],["d6-2","10:20","高松機場・還車",34.2142,134.0156],["d6-3","12:20","高松機場起飛",34.2142,134.0156]]}
];
const COLORS=["#e96743","#1d7f8c","#4b8164","#735f9b","#d39b38","#456b8a"];
let selected=-1;
let cloudDays=null;
const map=L.map("fullRouteMap",{zoomControl:true}).setView([34.05,133.85],8);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
const layer=L.layerGroup().addTo(map);
const strip=document.getElementById("mapDayStrip");
strip.innerHTML=`<button class="active" data-day="-1">六天總覽</button>`+DAYS.map((d,i)=>`<button data-day="${i}"><span>DAY ${i+1}</span>${d.title}</button>`).join("");

function pointsFor(i){
  return DAYS[i].points.map(p=>{const live=cloudDays?.[i]?.items?.find(x=>x.id===p[0]);return {...p,id:p[0],time:live?.time||p[1],name:live?.name||p[2],lat:p[3],lng:p[4],link:live?.map||""};});
}
function draw(){
  layer.clearLayers();
  const shown=selected<0?DAYS.map((_,i)=>i):[selected];
  const bounds=[];
  shown.forEach(day=>{
    const pts=pointsFor(day); const color=COLORS[day];
    L.polyline(pts.map(p=>[p.lat,p.lng]),{color,weight:selected<0?4:5,opacity:.78,dashArray:selected<0?"8 7":null}).addTo(layer);
    pts.forEach((p,i)=>{bounds.push([p.lat,p.lng]);const label=selected<0?`${day+1}-${i+1}`:`${i+1}`;const icon=L.divIcon({className:"route-marker-wrap",html:`<span class="route-marker" style="--marker-color:${color}">${label}</span>`,iconSize:[34,34],iconAnchor:[17,17]});L.marker([p.lat,p.lng],{icon}).bindPopup(`<div class="map-popup"><small>DAY ${day+1} · ${p.time}</small><strong>${p.name}</strong>${p.link?`<a href="${p.link}" target="_blank">開啟導航 ↗</a>`:""}</div>`).addTo(layer);});
  });
  if(bounds.length)map.fitBounds(bounds,{padding:[45,45],maxZoom:selected<0?9:12});
  const listDays=selected<0?shown:[selected];
  document.getElementById("sheetMeta").textContent=selected<0?"6 DAYS · ROUTE OVERVIEW":`DAY ${selected+1}`;
  document.getElementById("sheetTitle").textContent=selected<0?"高松・高知・鳴門":DAYS[selected].title;
  document.getElementById("mapPlaceList").innerHTML=listDays.flatMap(day=>pointsFor(day).map((p,i)=>`<li><button data-focus="${p.lat},${p.lng}"><b style="--day-color:${COLORS[day]}">${selected<0?`D${day+1}`:i+1}</b><span><small>${p.time}</small><strong>${p.name}</strong></span></button></li>`)).join("");
  document.querySelectorAll("[data-focus]").forEach(b=>b.onclick=()=>{const [lat,lng]=b.dataset.focus.split(",").map(Number);map.flyTo([lat,lng],14);});
  const nav=document.getElementById("fullRouteButton");
  if(selected>=0){const pts=pointsFor(selected);const q=new URLSearchParams({api:"1",origin:pts[0].name,destination:pts.at(-1).name,travelmode:"driving"});if(pts.length>2)q.set("waypoints",pts.slice(1,-1).map(p=>p.name).join("|"));nav.href=`https://www.google.com/maps/dir/?${q}`;nav.hidden=false;}else nav.hidden=true;
}
strip.querySelectorAll("button").forEach(b=>b.onclick=()=>{selected=Number(b.dataset.day);strip.querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));draw();});
watchTrip(data=>{if(data?.days){cloudDays=data.days;draw();}});
draw();
