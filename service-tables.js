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

function renderSchedule(target, table) {
  const headers = [...table.tHead.rows[0].cells].map(normalizeCellText);
  const rows = [...table.tBodies[0].rows];
  const fromIndex = headers.indexOf('From');
  const toIndex = headers.indexOf('To');
  const timeIndex = headers.indexOf('Time');
  const runsOnIndex = headers.indexOf('Runs on');

  rows.forEach((row) => {
    const values = [...row.cells].map(normalizeCellText);
    const from = values[fromIndex];
    const to = values[toIndex];
    const time = values[timeIndex];
    const runsOn = runsOnIndex >= 0 ? values[runsOnIndex] : '';

    const card = document.createElement('article');
    card.className = 'schedule-card';
    card.setAttribute('aria-label', [from, to, time, runsOn].filter(Boolean).join(', '));

    const route = document.createElement('div');
    route.className = 'schedule-card-route';
    route.append(
      createTextElement('span', 'schedule-card-place', from),
      createTextElement('span', 'schedule-route-arrow', ''),
      createTextElement('span', 'schedule-card-place', to),
    );
    card.append(route);

    const timeBlock = document.createElement('div');
    timeBlock.className = 'schedule-card-time';
    timeBlock.append(
      createTextElement('span', 'schedule-card-time-label', 'Departure'),
      createTextElement('strong', 'schedule-card-time-value', time),
    );
    card.append(timeBlock);

    if (runsOn) {
      card.append(createTextElement('p', 'schedule-card-meta', `Runs ${runsOn}`));
    }

    target.append(card);
  });
}

document.querySelectorAll('[data-mobile-view]').forEach((target) => {
  const table = getSourceTable(target);
  if (!table) return;

  if (target.dataset.mobileView === 'mess') renderMessMenu(target, table);
  if (target.dataset.mobileView === 'schedule') renderSchedule(target, table);
});
