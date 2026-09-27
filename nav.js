const campusMenus = document.querySelectorAll('.campus-menu');

campusMenus.forEach((menu) => {
  const trigger = menu.querySelector('summary');
  const links = menu.querySelectorAll('.campus-nav-link');

  if (!menu.querySelector('[href="resources.html"]')) {
    const resources = document.createElement('a');
    resources.className = 'campus-nav-link';
    resources.href = 'resources.html';
    resources.innerHTML = '<span>Student <b>Resources</b></span><span class="campus-link-arrow" aria-hidden="true"></span>';
    menu.querySelector('.campus-dropdown')?.append(resources);
  }
  if (!menu.querySelector('[href="campus-life.html"]')) {
    const life = document.createElement('a');
    life.className = 'campus-nav-link';
    life.href = 'campus-life.html';
    life.innerHTML = '<span>Campus <b>Life</b></span><span class="campus-link-arrow" aria-hidden="true"></span>';
    menu.querySelector('.campus-dropdown')?.append(life);
  }

  const closeMenu = () => {
    menu.removeAttribute('open');
  };

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      event.preventDefault();
      closeMenu();
      trigger.focus();
    }
  });

  links.forEach((link) => link.addEventListener('click', closeMenu));
});
