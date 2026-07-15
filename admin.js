
const DEFAULT_TRIPS = [
  {id:"t1",destination:"Viña del Mar",origin:"Santiago",date:"2026-08-02",time:"08:30",price:18500,seats:40,status:"Activo",image:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",description:"Viaje directo con aire acondicionado y equipaje incluido."},
  {id:"t2",destination:"Valparaíso",origin:"Santiago",date:"2026-08-09",time:"07:45",price:17000,seats:36,status:"Activo",image:"https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1000&q=80",description:"Salida de fin de semana para disfrutar la ciudad puerto."},
  {id:"t3",destination:"Pucón",origin:"Santiago",date:"2026-08-16",time:"22:00",price:45900,seats:44,status:"Activo",image:"https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1000&q=80",description:"Viaje nocturno cómodo y seguro hacia el sur de Chile."}
];
if(!localStorage.getItem("vp_trips")) localStorage.setItem("vp_trips",JSON.stringify(DEFAULT_TRIPS));
if(!localStorage.getItem("vp_bookings")) localStorage.setItem("vp_bookings","[]");
if(!localStorage.getItem("vp_settings")) localStorage.setItem("vp_settings",JSON.stringify({companyName:"ViajaPro",currency:"CLP",contactPhone:"+56 9 1234 5678",contactEmail:"contacto@viajapro.cl"}));

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const getTrips=()=>JSON.parse(localStorage.getItem("vp_trips")||"[]"), saveTrips=v=>localStorage.setItem("vp_trips",JSON.stringify(v));
const getBookings=()=>JSON.parse(localStorage.getItem("vp_bookings")||"[]");
const getSettings=()=>JSON.parse(localStorage.getItem("vp_settings")||"{}");
const money=v=>new Intl.NumberFormat("es-CL",{style:"currency",currency:getSettings().currency||"CLP",maximumFractionDigits:0}).format(v);
const fmtDate=d=>new Date(d+"T12:00:00").toLocaleDateString("es-CL",{day:"2-digit",month:"short",year:"numeric"});
const occupied=id=>getBookings().filter(b=>b.tripId===id&&b.status!=="Cancelada").reduce((n,b)=>n+b.seats.length,0);
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.remove("hidden");setTimeout(()=>t.classList.add("hidden"),2500)}
function showApp(){ $("#loginScreen").classList.add("hidden"); $("#adminApp").classList.remove("hidden"); renderAll();}
$("#loginForm").addEventListener("submit",e=>{e.preventDefault();if($("#adminUser").value==="admin"&&$("#adminPassword").value==="1234"){sessionStorage.setItem("vp_admin","1");showApp()}else toast("Usuario o contraseña incorrectos")});
if(sessionStorage.getItem("vp_admin")==="1") showApp();
$("#logoutBtn").onclick=()=>{sessionStorage.removeItem("vp_admin");location.reload()};

const viewMeta={dashboard:["Resumen general","Controla tu operación desde un solo lugar."],trips:["Gestión de viajes","Administra destinos, precios, fechas y asientos."],bookings:["Reservas","Consulta pasajeros y ventas."],settings:["Ajustes generales","Personaliza la información del sistema."]};
$$(".nav-item").forEach(btn=>btn.onclick=()=>{
  $$(".nav-item").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
  $$(".admin-view").forEach(x=>x.classList.remove("active")); $("#"+btn.dataset.view+"View").classList.add("active");
  $("#viewTitle").textContent=viewMeta[btn.dataset.view][0]; $("#viewSubtitle").textContent=viewMeta[btn.dataset.view][1];
  $("#sidebar").classList.remove("open");
});
$("#sidebarBtn").onclick=()=>$("#sidebar").classList.toggle("open");

function renderAll(){renderStats();renderTripsTables();renderBookings();loadSettings()}
function renderStats(){
  const trips=getTrips(), bookings=getBookings();
  $("#statTrips").textContent=trips.filter(t=>t.status==="Activo").length;
  $("#statBookings").textContent=bookings.length;
  $("#statRevenue").textContent=money(bookings.filter(b=>b.status!=="Cancelada").reduce((s,b)=>s+b.total,0));
  $("#statSeats").textContent=bookings.filter(b=>b.status!=="Cancelada").reduce((s,b)=>s+b.seats.length,0);
}
function statusClass(s){return s==="Activo"?"active":s==="Pausado"?"paused":"finished"}
function renderTripsTables(){
  const trips=getTrips().sort((a,b)=>a.date.localeCompare(b.date));
  $("#dashboardTrips").innerHTML=trips.slice(0,5).map(t=>`<tr><td><strong>${t.destination}</strong><br><small>${t.origin}</small></td><td>${fmtDate(t.date)} · ${t.time}</td><td>${money(t.price)}</td><td>${t.seats-occupied(t.id)} / ${t.seats}</td><td><span class="status ${statusClass(t.status)}">${t.status}</span></td></tr>`).join("")||`<tr><td colspan="5">No hay viajes.</td></tr>`;
  $("#tripsTable").innerHTML=trips.map(t=>`<tr><td><strong>${t.destination}</strong></td><td>${t.origin}</td><td>${fmtDate(t.date)}<br><small>${t.time} hrs</small></td><td>${money(t.price)}</td><td>${occupied(t.id)} vendidos / ${t.seats}</td><td><span class="status ${statusClass(t.status)}">${t.status}</span></td><td><button class="action-btn" onclick="editTrip('${t.id}')">Editar</button><button class="action-btn delete" onclick="deleteTrip('${t.id}')">Eliminar</button></td></tr>`).join("")||`<tr><td colspan="7">No hay viajes creados.</td></tr>`;
}
function renderBookings(filter=""){
  const trips=getTrips(), q=filter.toLowerCase();
  const list=getBookings().filter(b=>!q||b.code.toLowerCase().includes(q)||b.passenger.toLowerCase().includes(q));
  $("#bookingsTable").innerHTML=list.map(b=>{const t=trips.find(x=>x.id===b.tripId);return `<tr><td><strong>${b.code}</strong></td><td>${b.passenger}<br><small>${b.document}</small></td><td>${t?.destination||"Viaje eliminado"}</td><td>${b.seats.join(", ")}</td><td>${money(b.total)}</td><td>${new Date(b.createdAt).toLocaleDateString("es-CL")}</td><td><span class="status confirmed">${b.status}</span></td></tr>`}).join("")||`<tr><td colspan="7">No hay reservas.</td></tr>`;
}
$("#bookingSearch").oninput=e=>renderBookings(e.target.value);

function openTripForm(trip=null){
  $("#tripForm").reset(); $("#tripId").value=trip?.id||""; $("#tripModalTitle").textContent=trip?"Editar viaje":"Nuevo viaje";
  if(trip){$("#tripDestination").value=trip.destination;$("#tripOrigin").value=trip.origin;$("#tripDate").value=trip.date;$("#tripTime").value=trip.time;$("#tripPrice").value=trip.price;$("#tripSeats").value=trip.seats;$("#tripImage").value=trip.image||"";$("#tripDescription").value=trip.description||"";$("#tripStatus").value=trip.status}
  $("#tripModal").classList.remove("hidden");
}
$$("[data-open-trip-form]").forEach(b=>b.onclick=()=>openTripForm());
$$("[data-close-trip-modal]").forEach(b=>b.onclick=()=>$("#tripModal").classList.add("hidden"));
window.editTrip=id=>openTripForm(getTrips().find(t=>t.id===id));
window.deleteTrip=id=>{
  if(getBookings().some(b=>b.tripId===id)){toast("No se puede eliminar: el viaje tiene reservas");return}
  if(confirm("¿Eliminar este viaje?")){saveTrips(getTrips().filter(t=>t.id!==id));renderAll();toast("Viaje eliminado")}
};
$("#tripForm").addEventListener("submit",e=>{
  e.preventDefault(); const list=getTrips(), id=$("#tripId").value||("t"+Date.now());
  const trip={id,destination:$("#tripDestination").value.trim(),origin:$("#tripOrigin").value.trim(),date:$("#tripDate").value,time:$("#tripTime").value,price:Number($("#tripPrice").value),seats:Number($("#tripSeats").value),image:$("#tripImage").value.trim(),description:$("#tripDescription").value.trim(),status:$("#tripStatus").value};
  const sold=occupied(id); if(trip.seats<sold){toast(`No puedes bajar de ${sold} asientos vendidos`);return}
  const idx=list.findIndex(t=>t.id===id); idx>=0?list[idx]=trip:list.push(trip); saveTrips(list); $("#tripModal").classList.add("hidden"); renderAll(); toast("Viaje guardado correctamente");
});
function loadSettings(){const s=getSettings();$("#companyName").value=s.companyName||"";$("#currency").value=s.currency||"CLP";$("#contactPhone").value=s.contactPhone||"";$("#contactEmail").value=s.contactEmail||""}
$("#settingsForm").addEventListener("submit",e=>{e.preventDefault();localStorage.setItem("vp_settings",JSON.stringify({companyName:$("#companyName").value,currency:$("#currency").value,contactPhone:$("#contactPhone").value,contactEmail:$("#contactEmail").value}));renderAll();toast("Ajustes guardados")});
