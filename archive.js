// ===================== ARCHIVE.JS (archive.json + tiktoklive.json) =====================

// Containers
const TIMELINE_SOLO = document.getElementById("timeline-solo");
const TIMELINE_LUMI = document.getElementById("timeline-luminous");

const CAL_MONTH = document.getElementById("cal-month");
const CAL_WEEKDAYS = document.getElementById("cal-weekdays");
const CAL_DAYS = document.getElementById("cal-days");
const BTN_PREV = document.getElementById("cal-prev");
const BTN_NEXT = document.getElementById("cal-next");

// Modal
const MODAL_EL = document.getElementById("archiveEventModal");
const modal = MODAL_EL ? new bootstrap.Modal(MODAL_EL) : null;
const MODAL_TITLE = document.getElementById("modalDateTitle");
const MODAL_LIST = document.getElementById("modalEventList");

// Weekdays
const WEEKDAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

// Language (optional – supports your future KR/EN toggle)
// If you only want KR for now, it will still work (uses title_kr).
function getLangFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("lang") || "kr";
}
let currentLang = getLangFromURL();

// Data holders
let ARCHIVE_EVENTS = [];   // timeline + calendar
let LIVE_EVENTS = [];      // calendar only
let ALL_EVENTS = [];       // calendar map uses this

// Calendar state
let calYear, calMonth;

// Type priority (used to decide which color to show when multiple events collide)
const TYPE_PRIORITY = {
  anniversary: 6,
  anniv: 6,
  showcase: 5,
  concert: 5,
  woobin: 4,
  luminous: 3,
  live: 1
};

// ---------- Helpers ----------
function pad2(n){ return String(n).padStart(2,"0"); }

function ymd(d){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

function prettyDate(iso){
  // expects YYYY-MM-DD
  const [y,m,d] = iso.split("-").map(Number);
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${String(d).padStart(2,"0")} ${MONTHS[m-1]}`;
}

function monthLabel(year, monthIndex){
  const m = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
  return `${m[monthIndex]} ${year}`;
}

function titleFor(ev){
  // fallbacks so KR-only JSON still works
  if (currentLang === "en") return ev.title_en || ev.title_kr || ev.title || "";
  return ev.title_kr || ev.title_en || ev.title || "";
}

function dotClass(type){
  if(type === "woobin") return "dot-woobin";
  if(type === "luminous") return "dot-luminous";
  if(type === "anniv" || type === "anniversary") return "dot-anniv";
  if(type === "showcase") return "dot-showcase";
  if(type === "concert") return "dot-concert";
  return "dot-live";
}

function groupByYear(items){
  const map = new Map();
  items.forEach(it => {
    const y = Number(it.date.slice(0,4));
    if(!map.has(y)) map.set(y, []);
    map.get(y).push(it);
  });
  return [...map.entries()].sort((a,b)=> b[0]-a[0]);
}

function renderTimeline(container, items){
  container.innerHTML = "";
  const byYear = groupByYear(items);

  byYear.forEach(([year, list]) => {
    const yearEl = document.createElement("div");
    yearEl.className = "archive-year";
    yearEl.textContent = year;
    container.appendChild(yearEl);

    // newest first
    list.sort((a,b)=> (a.date < b.date ? 1 : -1));

    list.forEach(it => {
      const row = document.createElement("div");
      row.className = "archive-item";

      // clickable if link exists (still looks like normal text if your CSS does)
      const t = titleFor(it);
      const hasLink = !!it.link;

      row.innerHTML = `
        <div class="archive-date">${prettyDate(it.date)}</div>
        <div>
          ${
            hasLink
              ? `<a class="archive-title archive-link" href="${it.link}" target="_blank" rel="noopener">${t}</a>`
              : `<div class="archive-title">${t}</div>`
          }
        </div>
      `;

      container.appendChild(row);
    });
  });
}

function renderWeekdays(){
  CAL_WEEKDAYS.innerHTML = "";
  WEEKDAYS.forEach(w => {
    const el = document.createElement("div");
    el.className = "calendar-weekday";
    el.textContent = w;
    CAL_WEEKDAYS.appendChild(el);
  });
}

function eventsMapByDate(events){
  const map = new Map();
  events.forEach(ev => {
    if(!map.has(ev.date)) map.set(ev.date, []);
    map.get(ev.date).push(ev);
  });
  return map;
}

function primaryTypeForDay(evs){
  const sorted = evs
    .slice()
    .sort((a,b) => (TYPE_PRIORITY[b.type]||0) - (TYPE_PRIORITY[a.type]||0));
  return sorted[0]?.type || null;
}

function hasMultipleTypes(evs){
  return new Set(evs.map(e => e.type)).size > 1;
}

// Modal: archive events first, tiktok lives last
function openEventModal(dateIso, eventsForDay){
  if(!modal) return;

  MODAL_TITLE.textContent = prettyDate(dateIso);

  const archiveFirst = [];
  const livesLast = [];

  eventsForDay.forEach(ev => {
    if (ev.type === "live") livesLast.push(ev);
    else archiveFirst.push(ev);
  });

  const ordered = [...archiveFirst, ...livesLast];

  MODAL_LIST.innerHTML = ordered.map(ev => {
    const t = titleFor(ev);
    const hasLink = !!ev.link;

    return `
      <div style="display:flex; gap:10px; align-items:flex-start; padding:10px 0; border-top:1px solid rgba(255,255,255,0.10);">
        <span class="legend-dot ${dotClass(ev.type)}" style="margin-top:6px;"></span>
        <div>
          ${
            hasLink
              ? `<a href="${ev.link}" target="_blank" rel="noopener" style="letter-spacing:0.12rem; font-size:0.85rem; color: rgba(255,255,255,0.9); text-decoration:none;">${t}</a>`
              : `<div style="letter-spacing:0.1rem; font-size:0.85rem; color: rgba(255,255,255,0.9);">${t}</div>`
          }
        </div>
      </div>
    `;
  }).join("");

  const first = MODAL_LIST.firstElementChild;
  if(first) first.style.borderTop = "none";

  modal.show();
}

function renderCalendar(year, monthIndex, map){
  CAL_MONTH.textContent = monthLabel(year, monthIndex);
  CAL_DAYS.innerHTML = "";

  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);

  const startDow = first.getDay();
  const daysInMonth = last.getDate();

  // leading blanks
  for(let i=0;i<startDow;i++){
    const cell = document.createElement("div");
    cell.className = "calendar-day muted";
    cell.textContent = "";
    CAL_DAYS.appendChild(cell);
  }

  // days
  for(let day=1; day<=daysInMonth; day++){
    const d = new Date(year, monthIndex, day);
    const iso = ymd(d);

    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.innerHTML = `<div class="day-num">${day}</div>`;

    const evs = map.get(iso) || [];
    if (evs.length) {
      const primary = primaryTypeForDay(evs);
      cell.classList.add("has-event");
      if (primary) cell.classList.add(`type-${primary}`);
      if (hasMultipleTypes(evs)) cell.classList.add("multi");

      cell.addEventListener("click", () => openEventModal(iso, evs));
    } else {
      cell.style.cursor = "default";
    }

    CAL_DAYS.appendChild(cell);
  }
}

// ---------- Load both JSON files ----------
Promise.all([
  fetch("archive.json").then(r => r.json()),
  fetch("tiktoklive.json").then(r => r.json()).catch(() => []) // if missing, just ignore
])
  .then(([archiveData, liveData]) => {
    // accept both formats: [ ... ] or { events:[...] }
    ARCHIVE_EVENTS = Array.isArray(archiveData) ? archiveData : (archiveData.events || []);
    LIVE_EVENTS = Array.isArray(liveData) ? liveData : (liveData.events || []);

    // Safety: ensure live events are tagged as type=live
    LIVE_EVENTS = LIVE_EVENTS.map(ev => ({ ...ev, type: "live" }));

    // Timeline shows ONLY archive.json (no tiktok lives)
    const soloItems = ARCHIVE_EVENTS.filter(e => e.era === "solo");
    const lumiItems = ARCHIVE_EVENTS.filter(e => e.era === "luminous");

    renderTimeline(TIMELINE_SOLO, soloItems);
    renderTimeline(TIMELINE_LUMI, lumiItems);

    // Calendar uses both
    ALL_EVENTS = [...ARCHIVE_EVENTS, ...LIVE_EVENTS];
    const map = eventsMapByDate(ALL_EVENTS);

    renderWeekdays();

    // Start at current month on refresh
    const now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();

    const draw = () => renderCalendar(calYear, calMonth, map);
    draw();

    BTN_PREV.addEventListener("click", () => {
      calMonth -= 1;
      if(calMonth < 0){ calMonth = 11; calYear -= 1; }
      draw();
    });

    BTN_NEXT.addEventListener("click", () => {
      calMonth += 1;
      if(calMonth > 11){ calMonth = 0; calYear += 1; }
      draw();
    });
  })
  .catch(err => console.error("Failed to load archive data:", err));


// Optional: expose setLang if you’re using the dropdown
// Call setLang('kr') or setLang('en') and rerender timeline text + modal text.
window.setLang = function(lang){
  if(lang !== "kr" && lang !== "en") return;
  currentLang = lang;

  // update url
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url.toString());

  // rerender timeline (calendar stays same; only text changes)
  const soloItems = ARCHIVE_EVENTS.filter(e => e.era === "solo");
  const lumiItems = ARCHIVE_EVENTS.filter(e => e.era === "luminous");
  renderTimeline(TIMELINE_SOLO, soloItems);
  renderTimeline(TIMELINE_LUMI, lumiItems);
};