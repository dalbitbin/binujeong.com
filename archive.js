// ================= ARCHIVE.JS (LANG TOGGLE) =================

// ===================== SETTINGS =====================
let currentLang = "kr"; // "kr" or "en"

// ===================== DOM =====================
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

// ===================== DATA STATE =====================
let ALL_EVENTS = [];
let calYear = null;
let calMonth = null;

// ===================== HELPERS =====================
function pad2(n){ return String(n).padStart(2,"0"); }
function ymd(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }

function prettyDate(iso){
  const [,m,d] = iso.split("-").map(Number);
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${pad2(d)} ${MONTHS[m-1]}`;
}

function monthLabel(year, monthIndex){
  const m = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
  return `${m[monthIndex]} ${year}`;
}

function getTitle(ev){
  // fallback if missing
  return ev?.["title_" + currentLang] || ev?.title_kr || ev?.title_en || "";
}

function safeOpen(link){
  if(!link) return;
  window.open(link, "_blank", "noopener,noreferrer");
}

function dotClass(type){
  if(type === "woobin") return "dot-woobin";
  if(type === "luminous") return "dot-luminous";
  if(type === "anniv" || type === "anniversary") return "dot-anniv";
  return "dot-live";
}

// calendar priority (color for the day)
const TYPE_PRIORITY = { anniversary: 4, anniv: 4, woobin: 3, luminous: 2, live: 1 };

function primaryTypeForDay(evs){
  return evs
    .slice()
    .sort((a,b)=> (TYPE_PRIORITY[b.type]||0) - (TYPE_PRIORITY[a.type]||0))[0]?.type || null;
}

function hasMultipleTypes(evs){
  return new Set(evs.map(e=>e.type)).size > 1;
}

function groupByYear(items){
  const map = new Map();
  items.forEach(it=>{
    const y = Number(it.date.slice(0,4));
    if(!map.has(y)) map.set(y,[]);
    map.get(y).push(it);
  });
  return [...map.entries()].sort((a,b)=> b[0]-a[0]);
}

// ===================== RENDER: TIMELINE =====================
function renderTimeline(container, items){
  if(!container) return;
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
      const hasLink = Boolean(it.link && String(it.link).trim().length);

      row.className = "archive-item" + (hasLink ? " clickable" : "");
      row.innerHTML = `
        <div class="archive-date">${prettyDate(it.date)}</div>
        <div>
          <div class="archive-title">${getTitle(it)}</div>
        </div>
      `;

      if(hasLink){
        row.addEventListener("click", ()=> safeOpen(it.link));
      }

      container.appendChild(row);
    });
  });
}

// ===================== RENDER: CALENDAR =====================
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
    if(!map.has(ev.date)) map.set(ev.date,[]);
    map.get(ev.date).push(ev);
  });
  return map;
}

function openEventModal(dateIso, eventsForDay){
  if(!modal) return;

  const [y,m,d] = dateIso.split("-");
  MODAL_TITLE.textContent = `${y}.${m}.${d}`;

  const sorted = eventsForDay
    .slice()
    .sort((a,b)=> (TYPE_PRIORITY[b.type]||0) - (TYPE_PRIORITY[a.type]||0));

  MODAL_LIST.innerHTML = sorted.map(ev=>{
    const hasLink = Boolean(ev.link && String(ev.link).trim().length);

    return `
      <div class="${hasLink ? "modal-row-clickable" : ""}"
           style="display:flex; gap:10px; align-items:flex-start; padding:10px 0; border-top:1px solid rgba(255,255,255,0.10); ${hasLink ? "cursor:pointer;" : ""}"
           ${hasLink ? `data-link="${ev.link}"` : ""}>
        <span class="legend-dot ${dotClass(ev.type)}" style="margin-top:6px;"></span>
        <div>
          <div style="letter-spacing:0.12rem; font-size:0.85rem; color: rgba(255,255,255,0.92);">${getTitle(ev)}</div>
        </div>
      </div>
    `;
  }).join("");

  // click links in modal
  MODAL_LIST.querySelectorAll(".modal-row-clickable").forEach(row=>{
    row.addEventListener("click", ()=>{
      const link = row.getAttribute("data-link");
      safeOpen(link);
    });
  });

  const first = MODAL_LIST.firstElementChild;
  if(first) first.style.borderTop = "none";

  modal.show();
}

function renderCalendar(year, monthIndex, map){
  CAL_MONTH.textContent = monthLabel(year, monthIndex);
  CAL_DAYS.innerHTML = "";

  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex+1, 0);

  const startDow = first.getDay();
  const daysInMonth = last.getDate();

  // leading blanks
  for(let i=0;i<startDow;i++){
    const cell = document.createElement("div");
    cell.className = "calendar-day muted";
    CAL_DAYS.appendChild(cell);
  }

  for(let day=1; day<=daysInMonth; day++){
    const d = new Date(year, monthIndex, day);
    const iso = ymd(d);

    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.innerHTML = `<div class="day-num">${day}</div>`;

    const evs = map.get(iso) || [];
    if(evs.length){
      let primary = primaryTypeForDay(evs);
      if(primary === "anniversary") primary = "anniv"; // CSS expects type-anniv

      cell.classList.add("has-event");
      if(primary) cell.classList.add(`type-${primary}`);
      if(hasMultipleTypes(evs)) cell.classList.add("multi");

      cell.addEventListener("click", ()=> openEventModal(iso, evs));
    }

    CAL_DAYS.appendChild(cell);
  }
}

// ===================== MASTER RENDER =====================
function renderAll(){
  // Timeline depends on language
  renderTimeline(TIMELINE_SOLO, ALL_EVENTS.filter(e => e.era === "solo"));
  renderTimeline(TIMELINE_LUMI, ALL_EVENTS.filter(e => e.era === "luminous"));

  // Calendar does NOT depend on language for day marking,
  // but modal text does, so calendar can stay; no need to redraw.
  // Still safe to redraw because it's cheap and keeps it consistent.
  const map = eventsMapByDate(ALL_EVENTS);
  renderCalendar(calYear, calMonth, map);
}

// ===================== LANGUAGE API =====================
window.setLang = function(lang){
  if(lang !== "kr" && lang !== "en") return;
  currentLang = lang;
  renderAll();
};

// ===================== INIT =====================
fetch("archive.json")
  .then(r => r.json())
  .then(data => {
    ALL_EVENTS = data.events || [];

    renderWeekdays();

    const now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();

    renderAll();

    BTN_PREV.addEventListener("click", ()=>{
      calMonth -= 1;
      if(calMonth < 0){ calMonth = 11; calYear -= 1; }
      renderAll();
    });

    BTN_NEXT.addEventListener("click", ()=>{
      calMonth += 1;
      if(calMonth > 11){ calMonth = 0; calYear += 1; }
      renderAll();
    });
  })
  .catch(err => console.error("Failed to load archive.json:", err));