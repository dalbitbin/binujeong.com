// ================= ARCHIVE.JS =================

const TIMELINE_SOLO = document.getElementById("timeline-solo");
const TIMELINE_LUMI = document.getElementById("timeline-luminous");

const CAL_MONTH = document.getElementById("cal-month");
const CAL_WEEKDAYS = document.getElementById("cal-weekdays");
const CAL_DAYS = document.getElementById("cal-days");

const BTN_PREV = document.getElementById("cal-prev");
const BTN_NEXT = document.getElementById("cal-next");

const MODAL_EL = document.getElementById("archiveEventModal");
const modal = MODAL_EL ? new bootstrap.Modal(MODAL_EL) : null;
const MODAL_TITLE = document.getElementById("modalDateTitle");
const MODAL_LIST = document.getElementById("modalEventList");

const WEEKDAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

/* ---------- helpers ---------- */

function pad2(n){
  return String(n).padStart(2,"0");
}

function ymd(d){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

function prettyDate(iso){
  const [,m,d] = iso.split("-").map(Number);
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${pad2(d)} ${MONTHS[m-1]}`;
}

function monthLabel(year, monthIndex){
  const m = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
  return `${m[monthIndex]} ${year}`;
}

/* ---------- priority ---------- */

const TYPE_PRIORITY = {
  anniv: 3,
  woobin: 2,
  luminous: 1,
  live: 0
};

function primaryTypeForDay(evs){
  return evs
    .slice()
    .sort((a,b)=> TYPE_PRIORITY[b.type] - TYPE_PRIORITY[a.type])[0].type;
}

/* ---------- timeline ---------- */

function groupByYear(items){
  const map = new Map();

  items.forEach(it=>{
    const y = Number(it.date.slice(0,4));
    if(!map.has(y)) map.set(y,[]);
    map.get(y).push(it);
  });

  return [...map.entries()].sort((a,b)=> b[0]-a[0]);
}

function renderTimeline(container, items){

  container.innerHTML = "";

  const byYear = groupByYear(items);

  byYear.forEach(([year, list])=>{

    const yearEl = document.createElement("div");
    yearEl.className = "archive-year";
    yearEl.textContent = year;
    container.appendChild(yearEl);

    list.sort((a,b)=> b.date.localeCompare(a.date));

    list.forEach(it=>{

      const row = document.createElement("div");
      row.className = "archive-item";

      row.innerHTML = `
        <div class="archive-date">${prettyDate(it.date)}</div>
        <div class="archive-title">${it.title}</div>
      `;

      container.appendChild(row);

    });

  });

}

/* ---------- calendar ---------- */

function renderWeekdays(){

  CAL_WEEKDAYS.innerHTML = "";

  WEEKDAYS.forEach(w=>{

    const el = document.createElement("div");
    el.className = "calendar-weekday";
    el.textContent = w;
    CAL_WEEKDAYS.appendChild(el);

  });

}

function eventsMapByDate(events){

  const map = new Map();

  events.forEach(ev=>{

    if(!map.has(ev.date))
      map.set(ev.date,[]);

    map.get(ev.date).push(ev);

  });

  return map;

}

/* ---------- modal ---------- */

function openEventModal(dateIso, eventsForDay){

  if(!modal) return;

  const [y,m,d] = dateIso.split("-");
  MODAL_TITLE.textContent = `${y}.${m}.${d}`;

  // sort important first, LIVE last
  const sorted = eventsForDay
    .slice()
    .sort((a,b)=> TYPE_PRIORITY[b.type] - TYPE_PRIORITY[a.type]);

  MODAL_LIST.innerHTML = sorted.map(ev=>`

    <div style="display:flex; gap:10px; padding:10px 0; border-top:1px solid rgba(255,255,255,0.10);">
      <span class="legend-dot dot-${ev.type}"></span>
      <div>${ev.title}</div>
    </div>

  `).join("");

  modal.show();

}

/* ---------- render calendar ---------- */

function renderCalendar(year, monthIndex, map){

  CAL_MONTH.textContent = monthLabel(year, monthIndex);

  CAL_DAYS.innerHTML = "";

  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex+1,0);

  const startDow = first.getDay();
  const daysInMonth = last.getDate();

  for(let i=0;i<startDow;i++){

    const cell = document.createElement("div");
    cell.className = "calendar-day muted";
    CAL_DAYS.appendChild(cell);

  }

  for(let day=1;day<=daysInMonth;day++){

    const d = new Date(year,monthIndex,day);
    const iso = ymd(d);

    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.innerHTML = `<div class="day-num">${day}</div>`;

    const evs = map.get(iso) || [];

    if(evs.length){

      const primary = primaryTypeForDay(evs);

      cell.classList.add("has-event");
      cell.classList.add(`type-${primary}`);

      cell.addEventListener("click", ()=> openEventModal(iso, evs));

    }

    CAL_DAYS.appendChild(cell);

  }

}

/* ---------- INIT ---------- */

Promise.all([
  fetch("archive.json").then(r=>r.json()),
  fetch("tiktoklive.json").then(r=>r.json())
])
.then(([archiveData, liveData])=>{

  const archiveEvents = archiveData.events || [];
  const liveEvents = liveData.events || [];

  // timeline = archive only
  renderTimeline(
    TIMELINE_SOLO,
    archiveEvents.filter(e=> e.era==="solo")
  );

  renderTimeline(
    TIMELINE_LUMI,
    archiveEvents.filter(e=> e.era==="luminous")
  );

  // calendar = both
  const allEvents = [...archiveEvents, ...liveEvents];

  renderWeekdays();

  const map = eventsMapByDate(allEvents);

  const now = new Date();

  let calYear = now.getFullYear();
  let calMonth = now.getMonth();

  function draw(){
    renderCalendar(calYear, calMonth, map);
  }

  draw();

  BTN_PREV.onclick = ()=>{
    calMonth--;
    if(calMonth<0){ calMonth=11; calYear--; }
    draw();
  };

  BTN_NEXT.onclick = ()=>{
    calMonth++;
    if(calMonth>11){ calMonth=0; calYear++; }
    draw();
  };

});