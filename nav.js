const campusMenus = document.querySelectorAll('.campus-menu');

campusMenus.forEach((menu) => {
  const trigger = menu.querySelector('summary');
  const links = menu.querySelectorAll('.campus-nav-link');

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
