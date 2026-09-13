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

  days.forEach((day, dayIndex) => {
    const headingId = `menu-day-${day.toLowerCase()}`;
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

    target.append(card);
  });
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
  if (target.dataset.serviceView === 'route-schedule') renderRouteSchedule(target);
});
