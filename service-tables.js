import { supabase } from './supabase.js';

const normalizeCellText = (cell) => cell?.textContent.replace(/\s+/g, ' ').trim() ?? '';

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function getSourceTable(target) {
  const sourceId = target.dataset.sourceTable;
  return sourceId ? document.getElementById(sourceId) : null;
}

function createMessDayCard(day, dayIndex, meals, headingPrefix) {
  const headingId = `${headingPrefix}-${day.toLowerCase()}`;
  const card = document.createElement('article');
  card.className = 'menu-day-card';
  card.setAttribute('aria-labelledby', headingId);

  const heading = createTextElement('h2', 'menu-day-header', day);
  heading.id = headingId;
  card.append(heading);

  meals.forEach((meal) => {
    const mealSection = document.createElement('section');
    mealSection.className = 'menu-meal';
    mealSection.append(createTextElement('h3', 'menu-meal-name', meal.name));

    if (meal.shared) {
      mealSection.append(createTextElement('p', 'menu-meal-shared', meal.shared));
    }

    const dailyItem = meal.dailyItems[dayIndex];
    if (dailyItem) {
      mealSection.append(createTextElement('p', 'menu-meal-detail', dailyItem));
    }

    card.append(mealSection);
  });

  return card;
}

function getTodayMenuIndex() {
  return (new Date().getDay() + 6) % 7;
}

function getMessMeals(table) {
  const rows = [...table.tBodies[0].rows];
  const meals = [];

  for (let index = 0; index < rows.length; index += 2) {
    const sharedRow = rows[index];
    const detailsRow = rows[index + 1];
    if (!sharedRow || !detailsRow) continue;
    meals.push({ name: normalizeCellText(sharedRow.cells[0]), shared: normalizeCellText(sharedRow.cells[1]), dailyItems: [...detailsRow.cells].slice(1).map(normalizeCellText) });
  }
  return meals;
}

function applyPublishedMessMenu(table, menu) {
  if (!Array.isArray(menu?.meals)) return;
  const rows = [...table.tBodies[0].rows];
  menu.meals.forEach((meal, index) => {
    const sharedRow = rows[index * 2];
    const detailsRow = rows[index * 2 + 1];
    if (!sharedRow || !detailsRow || !Array.isArray(meal.dailyItems)) return;
    sharedRow.cells[1].textContent = meal.shared ?? '';
    [...detailsRow.cells].slice(1).forEach((cell, dayIndex) => { cell.textContent = meal.dailyItems[dayIndex] ?? ''; });
  });
}

async function loadPublishedMessMenu(table) {
  const { data, error } = await supabase.from('mess_menu').select('menu').eq('id', 1).maybeSingle();
  if (error || !data?.menu) return;
  applyPublishedMessMenu(table, data.menu);
  renderMessMenu(document.getElementById('messMenuMobile'), table);
  updateNextMeal(table);
}

function formatMealTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(mins).padStart(2, '0')} ${period}`;
}

function formatTimeUntil(minutes) {
  if (minutes <= 0) return 'now';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) return `in ${hours}h ${mins}m`;
  if (hours) return `in ${hours}h`;
  return `in ${mins}m`;
}

function updateNextMeal(table) {
  const card = document.getElementById('nextMealCard');
  const kicker = document.getElementById('nextMealKicker');
  const heading = document.getElementById('nextMealHeading');
  const time = document.getElementById('nextMealTime');
  const menu = document.getElementById('nextMealMenu');
  if (!card || !kicker || !heading || !time || !menu) return;

  const now = new Date();
  const todayIndex = getTodayMenuIndex();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const mealTimes = [
    { name: 'Breakfast', start: isWeekend ? 480 : 450, end: isWeekend ? 600 : 540 },
    { name: 'Lunch', start: isWeekend ? 750 : 720, end: isWeekend ? 870 : 840 },
    { name: 'Snacks', start: 1035, end: 1095 },
    { name: 'Dinner', start: 1170, end: 1290 },
  ];
  let meal = mealTimes.find(({ start, end }) => currentMinutes >= start && currentMinutes < end);
  let isServing = Boolean(meal);
  let dayIndex = todayIndex;
  let startsIn = 0;

  if (!meal) {
    meal = mealTimes.find(({ start }) => currentMinutes < start);
    if (meal) {
      startsIn = meal.start - currentMinutes;
    } else {
      meal = mealTimes[0];
      dayIndex = (todayIndex + 1) % 7;
      startsIn = (24 * 60 - currentMinutes) + meal.start;
    }
  }

  const mealMenu = getMessMeals(table).find((entry) => entry.name === meal.name);
  kicker.textContent = isServing ? 'NOW SERVING' : 'UP NEXT';
  heading.textContent = isServing ? `${meal.name} is being served` : `${meal.name} ${formatTimeUntil(startsIn)}`;
  time.textContent = `${formatMealTime(meal.start)}–${formatMealTime(meal.end)}${dayIndex !== todayIndex ? ' tomorrow' : ''}`;
  menu.replaceChildren();
  if (mealMenu?.shared) menu.append(createTextElement('span', 'next-meal-shared', mealMenu.shared));
  if (mealMenu?.dailyItems[dayIndex]) menu.append(createTextElement('span', 'next-meal-detail', mealMenu.dailyItems[dayIndex]));
  if (!menu.childElementCount) menu.textContent = 'Menu details are unavailable.';
  card.setAttribute('aria-busy', 'false');
}

function renderMessMenu(target, table) {
  const headerCells = [...table.tHead.rows[0].cells];
  const days = headerCells.slice(1).map(normalizeCellText);
  const meals = getMessMeals(table);

  const todayIndex = getTodayMenuIndex();
  const today = days[todayIndex] ?? days[0];
  const todayTarget = document.getElementById(target.dataset.todayTarget);

  if (todayTarget && today) {
    todayTarget.replaceChildren(createMessDayCard(today, todayIndex, meals, 'today-menu-day'));

    const todayTitle = document.getElementById('todayMenuTitle');
    if (todayTitle) todayTitle.textContent = `${today}'s menu`;

    const todayDate = document.getElementById('todayMenuDate');
    if (todayDate) {
      todayDate.textContent = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date());
    }
  }

  target.replaceChildren();
  days.forEach((day, dayIndex) => {
    target.append(createMessDayCard(day, dayIndex, meals, 'menu-day'));
  });
}

function setupMessMenuToggle() {
  const toggle = document.getElementById('menuToggle');
  const weeklyMenu = document.getElementById('weeklyMenu');
  const label = toggle?.querySelector('[data-menu-toggle-label]');
  if (!toggle || !weeklyMenu || !label) return;

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    weeklyMenu.hidden = isExpanded;
    label.textContent = isExpanded ? 'See full weekly menu' : 'Hide full weekly menu';
  });
}

function setupBusScheduleToggle() {
  const toggle = document.getElementById('busScheduleToggle');
  const schedule = document.getElementById('fullBusSchedule');
  const label = toggle?.querySelector('[data-bus-toggle-label]');
  if (!toggle || !schedule || !label) return;

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    schedule.hidden = isExpanded;
    label.textContent = isExpanded ? 'See full bus schedule' : 'Hide full bus schedule';
  });
}

function getScheduleEntries(target) {
  const sourceIds = (target.dataset.sourceTables ?? '').split(/\s+/).filter(Boolean);
  const entries = [];

  sourceIds.forEach((sourceId) => {
    const table = document.getElementById(sourceId);
    if (!table) return;

    const headers = [...table.tHead.rows[0].cells].map(normalizeCellText);
    const rows = [...table.tBodies[0].rows];
    const fromIndex = headers.indexOf('From');
    const toIndex = headers.indexOf('To');
    const timeIndex = headers.indexOf('Time');
    const runsOnIndex = headers.indexOf('Runs on');
    const defaultDay = table.dataset.scheduleLabel ?? 'Schedule';

    rows.forEach((row) => {
      const values = [...row.cells].map(normalizeCellText);
      const from = values[fromIndex];
      const to = values[toIndex];
      const timeText = values[timeIndex];
      const time = parseScheduleTime(timeText);
      const rawDay = runsOnIndex >= 0 && values[runsOnIndex] ? values[runsOnIndex] : defaultDay;
      const day = rawDay === 'Friday' ? 'Fridays' : rawDay;

      if (from && to && time !== null) {
        entries.push({ from, to, time, timeText, day });
      }
    });
  });

  return entries;
}

function getScheduleDayIndices(dayLabel) {
  const normalized = dayLabel.toLowerCase().replace(/\s+/g, ' ').trim();
  if (normalized.includes('monday to friday') || normalized.includes('weekdays')) {
    return [1, 2, 3, 4, 5];
  }
  if (normalized.includes('saturday') && normalized.includes('sunday')) {
    return [0, 6];
  }

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days.flatMap((day, index) => normalized.includes(day) ? [index] : []);
}

function parseScheduleTime(timeText) {
  const normalized = timeText.toLowerCase().replace(/\s+/g, ' ').trim();
  if (normalized.includes('noon')) return 12 * 60;

  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const meridiem = match[3];

  if (meridiem) {
    if (hour < 1 || hour > 12 || minute > 59) return null;
    return (hour % 12) * 60 + minute + (meridiem === 'pm' ? 12 * 60 : 0);
  }

  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function getNextDeparture(target, now = new Date(), routeFilter = () => true) {
  const entries = getScheduleEntries(target).filter(routeFilter);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  let next = null;

  for (let offset = 0; offset < 8; offset += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    const dayIndex = date.getDay();

    entries.forEach((entry) => {
      if (!getScheduleDayIndices(entry.day).includes(dayIndex)) return;

      const departure = new Date(date);
      departure.setHours(Math.floor(entry.time / 60), entry.time % 60, 0, 0);
      if (departure < now) return;

      if (!next || departure < next.departure) {
        next = { ...entry, departure };
      }
    });
  }

  return next;
}

function formatCountdown(milliseconds) {
  const totalMinutes = Math.floor(milliseconds / 60000);
  if (totalMinutes < 1) return 'less than a minute';
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

function updateNextBusCard(heading, detail, next) {
  const card = heading.closest('.next-bus');
  if (!next) {
    heading.textContent = 'No upcoming bus found';
    detail.textContent = 'No departure is scheduled for this direction.';
    card?.setAttribute('aria-busy', 'false');
    return;
  }

  const millisecondsUntilDeparture = next.departure.getTime() - Date.now();
  if (millisecondsUntilDeparture < 60000) {
    heading.textContent = 'Next bus is departing now';
  } else {
    heading.textContent = `Next bus in ${formatCountdown(millisecondsUntilDeparture)}`;
  }
  detail.textContent = `${next.from} → ${next.to} · departs at ${next.timeText}`;
  card?.setAttribute('aria-busy', 'false');
}

function updateNextBus(target) {
  const fromHeading = document.getElementById('nextBusFromLnmiitHeading');
  const fromDetail = document.getElementById('nextBusFromLnmiitDetail');
  const toHeading = document.getElementById('nextBusToLnmiitHeading');
  const toDetail = document.getElementById('nextBusToLnmiitDetail');
  if (!fromHeading || !fromDetail || !toHeading || !toDetail) return;

  const now = new Date();
  const fromLnmiit = (entry) => entry.from === 'LNMIIT' && (entry.to === 'Raja Park' || entry.to === 'Ajmeri Gate');
  const toLnmiit = (entry) => entry.to === 'LNMIIT' && (entry.from === 'Raja Park' || entry.from === 'Ajmeri Gate');
  const nextFromLnmiit = getNextDeparture(target, now, fromLnmiit);
  const nextToLnmiit = getNextDeparture(target, now, toLnmiit);

  updateNextBusCard(fromHeading, fromDetail, nextFromLnmiit);
  updateNextBusCard(toHeading, toDetail, nextToLnmiit);
}

function renderRouteSchedule(target) {
  const sourceIds = (target.dataset.sourceTables ?? '').split(/\s+/).filter(Boolean);
  const groups = new Map();

  sourceIds.forEach((sourceId) => {
    const table = document.getElementById(sourceId);
    if (!table) return;

    const headers = [...table.tHead.rows[0].cells].map(normalizeCellText);
    const rows = [...table.tBodies[0].rows];
    const fromIndex = headers.indexOf('From');
    const toIndex = headers.indexOf('To');
    const timeIndex = headers.indexOf('Time');
    const runsOnIndex = headers.indexOf('Runs on');
    const defaultDay = table.dataset.scheduleLabel ?? 'Schedule';

    rows.forEach((row) => {
      const values = [...row.cells].map(normalizeCellText);
      const from = values[fromIndex];
      const to = values[toIndex];
      const time = values[timeIndex];
      const rawDay = runsOnIndex >= 0 && values[runsOnIndex] ? values[runsOnIndex] : defaultDay;
      const day = rawDay === 'Friday' ? 'Fridays' : rawDay;
      const key = `${from}::${to}`;

      if (!groups.has(key)) groups.set(key, { from, to, entries: [] });
      groups.get(key).entries.push({ day, time });
    });
  });

  groups.forEach(({ from, to, entries }) => {
    const headingId = `route-${from}-${to}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const group = document.createElement('article');
    group.className = 'route-group';
    group.setAttribute('aria-labelledby', headingId);

    const heading = createTextElement('h2', 'route-group-header', '');
    heading.id = headingId;
    heading.append(
      createTextElement('span', 'route-group-place', from),
      createTextElement('span', 'route-group-arrow', ''),
      createTextElement('span', 'route-group-place', to),
    );
    group.append(heading);

    const list = document.createElement('ul');
    list.className = 'route-group-list';
    entries.forEach(({ day, time }) => {
      const item = document.createElement('li');
      item.className = 'route-group-entry';
      item.setAttribute('aria-label', `${day} - ${time}`);
      item.append(
        createTextElement('span', 'route-group-day', day),
        createTextElement('span', 'route-group-dash', '-'),
        createTextElement('strong', 'route-group-time', time),
      );
      list.append(item);
    });

    group.append(list);
    target.append(group);
  });
}

document.querySelectorAll('[data-mobile-view]').forEach((target) => {
  const table = getSourceTable(target);
  if (!table) return;

  if (target.dataset.mobileView === 'mess') renderMessMenu(target, table);
});

const messSource = document.getElementById('messMenuSource');
if (messSource) {
  updateNextMeal(messSource);
  loadPublishedMessMenu(messSource);
  supabase.channel('mess-menu-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'mess_menu', filter: 'id=eq.1' }, ({ new: record }) => {
      applyPublishedMessMenu(messSource, record.menu);
      renderMessMenu(document.getElementById('messMenuMobile'), messSource);
      updateNextMeal(messSource);
    })
    .subscribe();
  setInterval(() => updateNextMeal(messSource), 60000);
}

document.querySelectorAll('[data-service-view]').forEach((target) => {
  if (target.dataset.serviceView === 'route-schedule') {
    renderRouteSchedule(target);
    updateNextBus(target);
    setInterval(() => updateNextBus(target), 60000);
  }
});

setupMessMenuToggle();
setupBusScheduleToggle();
