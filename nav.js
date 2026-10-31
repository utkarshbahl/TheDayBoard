import "./section-visibility.js?v=20261016";
import "./brand.js?v=20261021";
import "./ui-polish.js";

const navLayoutStyle = document.createElement("style");
navLayoutStyle.textContent = `
  @media (min-width: 901px) { .nav-start { flex: 1; min-width: 0; } .nav-links { flex: 1; justify-content: space-between; gap: 12px; } .nav-link { white-space: nowrap; } .nav-actions { margin-left: 32px; } }
  .enhanced-ui body { background: radial-gradient(circle at 8% -10%, rgba(215,250,82,.26), transparent 26rem), radial-gradient(circle at 96% 18%, rgba(215,250,82,.12), transparent 22rem), var(--paper); }
  .enhanced-ui .nav { border-bottom: 1px solid transparent; transition: border-color .25s ease, background-color .25s ease; }
  .enhanced-ui .nav:hover { border-color: var(--line); }
  .enhanced-ui .brand-mark { box-shadow: 0 5px 14px rgba(20,40,31,.18); transition: transform .25s ease, box-shadow .25s ease; }
  .enhanced-ui .brand:hover .brand-mark { transform: rotate(-8deg) scale(1.05); box-shadow: 0 8px 18px rgba(20,40,31,.24); }
  .enhanced-ui .nav-link { position: relative; padding: 7px 0; transition: color .2s ease, transform .2s ease; }
  .enhanced-ui .nav-link::after { position: absolute; right: 0; bottom: 1px; left: 0; height: 2px; border-radius: 999px; background: var(--lime); content: ""; transform: scaleX(0); transform-origin: right; transition: transform .22s ease; }
  .enhanced-ui .nav-link:hover { opacity: 1; transform: translateY(-1px); }
  .enhanced-ui .nav-link:hover::after, .enhanced-ui .nav-link[aria-current=page]::after { transform: scaleX(1); transform-origin: left; }
  .enhanced-ui .theme-toggle { box-shadow: 0 3px 0 rgba(20,40,31,.08); transition: transform .2s ease, box-shadow .2s ease !important; }
  .enhanced-ui .theme-toggle:hover { transform: translateY(-2px); box-shadow: 0 6px 0 rgba(20,40,31,.1); }
  .enhanced-ui .service-card, .enhanced-ui .placement-record, .enhanced-ui .survey-card, .enhanced-ui .club-card, .enhanced-ui .route-group, .enhanced-ui .course-panel, .enhanced-ui .map-frame { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
  .enhanced-ui .service-card:hover, .enhanced-ui .placement-record:hover, .enhanced-ui .club-card:hover, .enhanced-ui .route-group:hover { transform: translateY(-4px); border-color: rgba(20,40,31,.55); box-shadow: 0 12px 24px rgba(20,40,31,.09); }
  .enhanced-ui .placement-stat, .enhanced-ui .traffic-stat, .enhanced-ui .survey-choice { transition: transform .22s ease, box-shadow .22s ease; }
  .enhanced-ui .placement-stat:hover, .enhanced-ui .traffic-stat:hover, .enhanced-ui .survey-choice:hover { transform: translateY(-3px); box-shadow: 0 9px 20px rgba(20,40,31,.09); }
  .enhanced-ui [data-reveal] { opacity: 0; transform: translateY(16px); transition: opacity .55s ease, transform .55s cubic-bezier(.16,1,.3,1); }
  .enhanced-ui [data-reveal].is-revealed { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) { .enhanced-ui *, .enhanced-ui *::before, .enhanced-ui *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; } .enhanced-ui [data-reveal] { opacity: 1; transform: none; } }
`;
document.head.append(navLayoutStyle);

document.documentElement.classList.add("enhanced-ui");
const revealTargets = document.querySelectorAll(".service-card, .placement-stat, .placement-record, .survey-choice, .club-card, .route-group, .course-panel, .map-frame, .notice-card");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-revealed");
    observer.unobserve(entry.target);
  }), { threshold: 0.08 });
  revealTargets.forEach((target, index) => {
    target.dataset.reveal = "";
    target.style.transitionDelay = `${Math.min(index % 6 * 45, 225)}ms`;
    revealObserver.observe(target);
  });
} else revealTargets.forEach((target) => target.classList.add("is-revealed"));

const isOpinionsPage = /\/surveys(?:\.html)?\/?$/.test(location.pathname);
const isClubsPage = /\/clubs(?:\.html)?\/?$/.test(location.pathname);
const isPlacementsPage = /\/placements(?:\.html)?\/?$/.test(location.pathname);
function setNavLabel(path, label) {
  document.querySelectorAll(`.nav-link[href="${path}"], .campus-nav-link[href="${path}"]`).forEach((link) => {
    link.innerHTML = link.classList.contains("campus-nav-link") ? `<span><b>${label}</b></span><span class="campus-link-arrow" aria-hidden="true"></span>` : `<b>${label}</b>`;
  });
}
[
  ["laundry.html", "Laundry"], ["mess-menu.html", "Mess"], ["bus-timings.html", "Bus"],
  ["curriculum.html", "Academics"], ["campus-map.html", "Map"], ["clubs.html", "Clubs"],
  ["surveys.html", "Opinions"], ["placements.html", "Placements"],
].forEach(([path, label]) => setNavLabel(path, label));
document.querySelectorAll('.service-card[href="curriculum.html"] strong').forEach((title) => { title.innerHTML = "<b>Academics</b>"; });
document.querySelectorAll(".service-grid").forEach((grid) => {
  if (grid.querySelector('a[href="placements.html"]')) return;
  const card = document.createElement("a");
  card.className = "service-card";
  card.href = "placements.html";
  card.innerHTML = '<span class="service-number">08</span><strong><b>Placements</b></strong><small>Follow live Batch 2027 placement updates.</small><i aria-hidden="true">→</i>';
  grid.append(card);
});
document.querySelectorAll(".nav-links").forEach((nav) => {
  if (nav.querySelector('a[href="placements.html"]')) return;
  const link = document.createElement("a");
  link.className = "nav-link";
  link.href = "placements.html";
  link.innerHTML = "<b>Placements</b>";
  if (isPlacementsPage) link.setAttribute("aria-current", "page");
  nav.insertBefore(link, nav.querySelector('a[href="clubs.html"], a[href="surveys.html"]'));
});
document.querySelectorAll(".campus-dropdown").forEach((nav) => {
  if (nav.querySelector('a[href="placements.html"]')) return;
  const link = document.createElement("a");
  link.className = "campus-nav-link";
  link.href = "placements.html";
  link.innerHTML = '<span><b>Placements</b></span><span class="campus-link-arrow" aria-hidden="true"></span>';
  if (isPlacementsPage) link.setAttribute("aria-current", "page");
  nav.insertBefore(link, nav.querySelector('a[href="clubs.html"], a[href="surveys.html"]'));
});
document.querySelectorAll(".nav-links").forEach((nav) => {
  if (nav.querySelector('a[href="clubs.html"]')) return;
  const link = document.createElement("a");
  link.className = "nav-link";
  link.href = "clubs.html";
  link.innerHTML = "<b>Clubs</b>";
  if (isClubsPage) link.setAttribute("aria-current", "page");
  nav.insertBefore(link, nav.querySelector('a[href="surveys.html"]'));
});
document.querySelectorAll(".campus-dropdown").forEach((nav) => {
  if (nav.querySelector('a[href="clubs.html"]')) return;
  const link = document.createElement("a");
  link.className = "campus-nav-link";
  link.href = "clubs.html";
  link.innerHTML = '<span><b>Clubs</b></span><span class="campus-link-arrow" aria-hidden="true"></span>';
  if (isClubsPage) link.setAttribute("aria-current", "page");
  nav.insertBefore(link, nav.querySelector('a[href="surveys.html"]'));
});
document.querySelectorAll(".nav-links").forEach((nav) => {
  if (nav.querySelector('a[href="surveys.html"]')) return;
  const link = document.createElement("a");
  link.className = "nav-link";
  link.href = "surveys.html";
  link.innerHTML = "<b>Opinions</b>";
  if (isOpinionsPage) link.setAttribute("aria-current", "page");
  nav.append(link);
});
document.querySelectorAll(".campus-dropdown").forEach((nav) => {
  if (nav.querySelector('a[href="surveys.html"]')) return;
  const link = document.createElement("a");
  link.className = "campus-nav-link";
  link.href = "surveys.html";
  link.innerHTML = '<span><b>Opinions</b></span><span class="campus-link-arrow" aria-hidden="true"></span>';
  if (isOpinionsPage) link.setAttribute("aria-current", "page");
  nav.append(link);
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch((error) => {
    console.error("Offline support could not be enabled.", error);
  });
}

document.querySelectorAll(".campus-menu").forEach((menu) => {
  const trigger = menu.querySelector("summary");
  const links = menu.querySelectorAll(".campus-nav-link");
  const close = () => menu.removeAttribute("open");
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      event.preventDefault();
      close();
      trigger.focus();
    }
  });
  links.forEach((link) => link.addEventListener("click", close));
});

const updateLiveTime = () => {
  const time = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
  document.querySelectorAll("[data-last-updated]").forEach((element) => {
    element.textContent = `Current time: ${time} IST`;
  });
};

updateLiveTime();
window.setInterval(updateLiveTime, 60_000);

(() => {
  const themeKey = "lnmiit-theme";
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const label = toggle?.querySelector("[data-theme-toggle-label]");
  if (!toggle || !label) return;

  let storedTheme = "lime";
  try {
    storedTheme = localStorage.getItem(themeKey) || "lime";
  } catch (error) {
    console.error("Theme preference could not be read.", error);
  }

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    toggle.setAttribute("aria-pressed", String(theme === "dusk"));
    label.textContent = theme === "dusk" ? "Dusk" : "Lime";
  };

  applyTheme(storedTheme === "dusk" ? "dusk" : "lime");
  toggle.addEventListener("click", () => {
    const theme = root.dataset.theme === "dusk" ? "lime" : "dusk";
    try {
      localStorage.setItem(themeKey, theme);
    } catch (error) {
      console.error("Theme preference could not be saved.", error);
    }
    applyTheme(theme);
  });
})();
