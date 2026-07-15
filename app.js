
const DEFAULT_TRIPS = [
  {id:"t1",destination:"Viña del Mar",origin:"Santiago",date:"2026-08-02",time:"08:30",price:18500,seats:40,status:"Activo",image:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",description:"Viaje directo con aire acondicionado y equipaje incluido."},
  {id:"t2",destination:"Valparaíso",origin:"Santiago",date:"2026-08-09",time:"07:45",price:17000,seats:36,status:"Activo",image:"https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1000&q=80",description:"Salida de fin de semana para disfrutar la ciudad puerto."},
  {id:"t3",destination:"Pucón",origin:"Santiago",date:"2026-08-16",time:"22:00",price:45900,seats:44,status:"Activo",image:"https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1000&q=80",description:"Viaje nocturno cómodo y seguro hacia el sur de Chile."}
];

function initData(){
  if(!localStorage.getItem("vp_trips")) localStorage.setItem("vp_trips",JSON.stringify(DEFAULT_TRIPS));
  if(!localStorage.getItem("vp_bookings")) localStorage.setItem("vp_bookings","[]");
  if(!localStorage.getItem("vp_settings")) localStorage.setItem("vp_settings",JSON.stringify({companyName:"ViajaPro",currency:"CLP",contactPhone:"+56 9 1234 5678",contactEmail:"contacto@viajapro.cl"}));
}
initData();

const $ = s => document.querySelector(s);
const tripGrid=$("#tripGrid"), emptyTrips=$("#emptyTrips"), tripCount=$("#tripCount");
let currentTrip=null, selectedSeats=[];

const getTrips=()=>JSON.parse(localStorage.getItem("vp_trips")||"[]");
const getBookings=()=>JSON.parse(localStorage.getItem("vp_bookings")||"[]");
const getSettings=()=>JSON.parse(localStorage.getItem("vp_settings")||"{}");
const money=v=>new Intl.NumberFormat("es-CL",{style:"currency",currency:getSettings().currency||"CLP",maximumFractionDigits:0}).format(v);
const fmtDate=d=>new Date(d+"T12:00:00").toLocaleDateString("es-CL",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});

function occupiedForTrip(id){
  return getBookings().filter(b=>b.tripId===id && b.status!=="Cancelada").flatMap(b=>b.seats);
}
function renderTrips(filterDest="",filterDate=""){
  const trips=getTrips().filter(t=>t.status==="Activo").filter(t=>(!filterDest||t.destination.toLowerCase().includes(filterDest.toLowerCase()))&&(!filterDate||t.date===filterDate));
  tripGrid.innerHTML="";
  tripCount.textContent=`${trips.length} ${trips.length===1?"viaje":"viajes"}`;
  emptyTrips.classList.toggle("hidden",trips.length>0);
  trips.forEach(t=>{
    const occupied=occupiedForTrip(t.id).length, available=Math.max(0,t.seats-occupied), percent=Math.max(0,available/t.seats*100);
    const card=document.createElement("article");
    card.className="trip-card";
    card.innerHTML=`
      <div class="trip-image" style="background-image:url('${t.image||"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80"}')">
        <span class="trip-badge">${available>0?"Disponible":"Agotado"}</span>
      </div>
      <div class="trip-body">
        <div class="trip-route"><div><h3>${t.destination}</h3><p>Desde ${t.origin}</p></div><div class="trip-price"><strong>${money(t.price)}</strong><small>por persona</small></div></div>
        <div class="trip-meta"><div class="meta-item">📅 Fecha<strong>${fmtDate(t.date)}</strong></div><div class="meta-item">🕒 Salida<strong>${t.time} hrs</strong></div></div>
        <div class="availability"><span style="width:${percent}%"></span></div>
        <div class="availability-text"><span>${available} disponibles</span><span>${t.seats} asientos</span></div>
        <button class="primary-btn full" ${available===0?"disabled":""} data-book="${t.id}">${available===0?"Sin disponibilidad":"Reservar ahora"}</button>
      </div>`;
    tripGrid.appendChild(card);
  });
  document.querySelectorAll("[data-book]").forEach(b=>b.onclick=()=>openBooking(b.dataset.book));
}
function openBooking(id){
  currentTrip=getTrips().find(t=>t.id===id); selectedSeats=[];
  $("#modalTripSummary").innerHTML=`<span class="eyebrow dark">Reserva de viaje</span><h2>${currentTrip.origin} → ${currentTrip.destination}</h2><p class="muted">${fmtDate(currentTrip.date)} · ${currentTrip.time} hrs · ${money(currentTrip.price)} por persona</p>`;
  renderSeats(); updateTotal(); $("#bookingModal").classList.remove("hidden");
}
function renderSeats(){
  const occupied=occupiedForTrip(currentTrip.id), map=$("#seatMap"); map.innerHTML="";
  for(let i=1;i<=currentTrip.seats;i++){
    const btn=document.createElement("button"); btn.type="button"; btn.className="seat-btn"; btn.textContent=i;
    if(occupied.includes(i)){btn.classList.add("occupied");btn.disabled=true}
    btn.onclick=()=>{selectedSeats.includes(i)?selectedSeats=selectedSeats.filter(x=>x!==i):selectedSeats.push(i);btn.classList.toggle("selected");updateTotal()}
    map.appendChild(btn);
  }
}
function updateTotal(){
  selectedSeats.sort((a,b)=>a-b);
  $("#selectedSeatsLabel").textContent=selectedSeats.length?selectedSeats.join(", "):"Ninguno";
  $("#bookingTotal").textContent=money((currentTrip?.price||0)*selectedSeats.length);
}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.remove("hidden");setTimeout(()=>t.classList.add("hidden"),3000)}
$("#bookingForm").addEventListener("submit",e=>{
  e.preventDefault(); if(!selectedSeats.length){toast("Selecciona al menos un asiento");return}
  const bookings=getBookings(), code="VP-"+Math.floor(100000+Math.random()*900000);
  bookings.push({id:crypto.randomUUID?crypto.randomUUID():Date.now().toString(),code,tripId:currentTrip.id,passenger:$("#passengerName").value,document:$("#passengerId").value,phone:$("#passengerPhone").value,email:$("#passengerEmail").value,seats:[...selectedSeats],total:currentTrip.price*selectedSeats.length,createdAt:new Date().toISOString(),status:"Confirmada"});
  localStorage.setItem("vp_bookings",JSON.stringify(bookings)); e.target.reset(); $("#bookingModal").classList.add("hidden"); renderTrips(); toast(`Reserva confirmada. Código: ${code}`);
});
$("#searchBtn").onclick=()=>renderTrips($("#searchDestination").value.trim(),$("#searchDate").value);
$("#lookupBtn").onclick=()=>{
  const code=$("#bookingCode").value.trim().toUpperCase(), b=getBookings().find(x=>x.code.toUpperCase()===code), out=$("#bookingResult");
  if(!b){out.innerHTML=`<div class="booking-card"><strong>No encontramos esa reserva.</strong><p class="muted">Revisa el código e intenta nuevamente.</p></div>`;return}
  const t=getTrips().find(x=>x.id===b.tripId);
  out.innerHTML=`<div class="booking-card"><div class="booking-card-head"><div><span class="eyebrow dark">${b.code}</span><h3>${t?.origin||"-"} → ${t?.destination||"-"}</h3></div><span class="status confirmed">${b.status}</span></div><p><strong>Pasajero:</strong> ${b.passenger}</p><p><strong>Fecha:</strong> ${t?fmtDate(t.date):"-"} · ${t?.time||"-"}</p><p><strong>Asientos:</strong> ${b.seats.join(", ")}</p><p><strong>Total:</strong> ${money(b.total)}</p></div>`;
};
document.querySelectorAll("[data-close-modal]").forEach(x=>x.onclick=()=>$("#bookingModal").classList.add("hidden"));
$("#menuBtn").onclick=()=>document.querySelector(".topbar nav").classList.toggle("open");
renderTrips();
