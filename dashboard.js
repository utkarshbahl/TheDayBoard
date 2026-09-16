const byId = (id) => document.getElementById(id);
const cleanText = (value) => value?.replace(/\s+/g, ' ').trim() ?? '';
const mealTimes = [
  { name: 'Breakfast', weekday: [450, 540], weekend: [480, 600] },
  { name: 'Lunch', weekday: [720, 840], weekend: [750, 870] },
  { name: 'Snacks', weekday: [1035, 1095], weekend: [1035, 1095] },
  { name: 'Dinner', weekday: [1170, 1290], weekend: [1170, 1290] },
];

function formatUntil(minutes) {
  const hours = Math.floor(minutes / 60); const mins = minutes % 60;
  return hours ? `in ${hours}h${mins ? ` ${mins}m` : ''}` : `in ${mins}m`;
}

function syncLaundryCard() {
  const source = byId('readyNumber'); const target = byId('dashboardToken');
  const sync = () => { target.textContent = /^\D+$/.test(source.textContent) ? 'Checking…' : source.textContent; };
  new MutationObserver(sync).observe(source, { childList: true, characterData: true, subtree: true });
  sync();
}

function currentOrNextMeal() {
  const now = new Date(); const minutes = now.getHours() * 60 + now.getMinutes(); const weekend = now.getDay() === 0 || now.getDay() === 6;
  const meals = mealTimes.map((meal) => ({ ...meal, start: (weekend ? meal.weekend : meal.weekday)[0], end: (weekend ? meal.weekend : meal.weekday)[1] }));
  const active = meals.find((meal) => minutes >= meal.start && minutes < meal.end);
  if (active) return { ...active, active: true, dayOffset: 0 };
  const next = meals.find((meal) => minutes < meal.start);
  return next ? { ...next, active: false, remaining: next.start - minutes, dayOffset: 0 } : { ...meals[0], active: false, remaining: 1440 - minutes + meals[0].start, dayOffset: 1 };
}

async function loadMealCard() {
  const meal = currentOrNextMeal();
  byId('dashboardMealLabel').textContent = meal.active ? 'NOW SERVING' : 'UP NEXT · MESS';
  byId('dashboardMeal').textContent = meal.active ? meal.name : `${meal.name} ${formatUntil(meal.remaining)}`;
  try {
    const source = await fetch('mess-menu.html').then((response) => response.text());
    const doc = new DOMParser().parseFromString(source, 'text/html'); const day = (new Date().getDay() + 6 + meal.dayOffset) % 7;
    const rows = [...doc.querySelector('#messMenuSource tbody').rows]; const index = rows.findIndex((row) => cleanText(row.cells[0]) === meal.name);
    const shared = cleanText(rows[index]?.cells[1]); const daily = cleanText(rows[index + 1]?.cells[day + 1]);
    byId('dashboardMealDetail').textContent = [shared, daily].filter(Boolean).join(' · ');
  } catch { byId('dashboardMealDetail').textContent = 'See today’s menu'; }
}

function parseTime(value) {
  const match = cleanText(value).match(/(\d+):(\d+)\s*(AM|PM)/i); if (!match) return null;
  let hours = Number(match[1]) % 12; if (match[3].toUpperCase() === 'PM') hours += 12;
  return hours * 60 + Number(match[2]);
}

async function loadBusCard() {
  try {
    const source = await fetch('bus-timings.html').then((response) => response.text()); const doc = new DOMParser().parseFromString(source, 'text/html');
    const now = new Date(); const weekend = now.getDay() === 0 || now.getDay() === 6; const minutes = now.getHours() * 60 + now.getMinutes();
    const table = doc.querySelector(weekend ? '#weekendScheduleSource' : '#weekdayScheduleSource');
    const next = [...table.tBodies[0].rows].map((row) => ({ from: cleanText(row.cells[0]), to: cleanText(row.cells[1]), label: cleanText(row.cells[2]), time: parseTime(row.cells[2]?.textContent) })).filter((item) => item.from === 'LNMIIT' && item.time > minutes).sort((a, b) => a.time - b.time)[0];
    byId('dashboardBus').textContent = next ? `${next.label} · ${next.to}` : 'No more buses today';
    byId('dashboardBusDetail').textContent = next ? `Leaves ${formatUntil(next.time - minutes)}` : 'See the full timetable';
  } catch { byId('dashboardBus').textContent = 'Bus timetable'; byId('dashboardBusDetail').textContent = 'See the full schedule'; }
}

const laundryCard = document.querySelector('.dashboard-card[href="#top"]');
laundryCard?.addEventListener('click', (event) => {
  event.preventDefault();
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.style.display = 'block';
  hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

syncLaundryCard(); loadMealCard(); loadBusCard();
setInterval(() => { loadMealCard(); loadBusCard(); }, 60000);
