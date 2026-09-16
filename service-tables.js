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

function renderMessMenu(target, table) {
  const headerCells = [...table.tHead.rows[0].cells];
  const days = headerCells.slice(1).map(normalizeCellText);
  const rows = [...table.tBodies[0].rows];
  const meals = [];

  for (let index = 0; index < rows.length; index += 2) {
    const sharedRow = rows[index];
    const detailsRow = rows[index + 1];
    if (!sharedRow || !detailsRow) continue;

    meals.push({
      name: normalizeCellText(sharedRow.cells[0]),
      shared: normalizeCellText(sharedRow.cells[1]),
      dailyItems: [...detailsRow.cells].slice(1).map(normalizeCellText),
    });
  }

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

function getNextDeparture(target, now = new Date()) {
  const entries = getScheduleEntries(target);
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

function updateNextBus(target) {
  const heading = document.getElementById('nextBusHeading');
  const detail = document.getElementById('nextBusDetail');
  if (!heading || !detail) return;

  const next = getNextDeparture(target);
  if (!next) {
    heading.textContent = 'No upcoming bus found';
    detail.textContent = 'Check the timetable for the next available departure.';
    heading.closest('.next-bus')?.setAttribute('aria-busy', 'false');
    return;
  }

  const millisecondsUntilDeparture = next.departure.getTime() - Date.now();
  if (millisecondsUntilDeparture < 60000) {
    heading.textContent = 'Next bus is departing now';
  } else {
    heading.textContent = `Next bus in ${formatCountdown(millisecondsUntilDeparture)}`;
  }
  detail.textContent = `${next.from} → ${next.to} · departs at ${next.timeText}`;
  heading.closest('.next-bus')?.setAttribute('aria-busy', 'false');
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

document.querySelectorAll('[data-service-view]').forEach((target) => {
  if (target.dataset.serviceView === 'route-schedule') {
    renderRouteSchedule(target);
    updateNextBus(target);
    setInterval(() => updateNextBus(target), 60000);
  }
});

setupMessMenuToggle();
