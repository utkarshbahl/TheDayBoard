import "./section-visibility.js?v=20261016";

const isOpinionsPage = /\/surveys(?:\.html)?\/?$/.test(location.pathname);
const isClubsPage = /\/clubs(?:\.html)?\/?$/.test(location.pathname);
document.querySelectorAll(".nav-links").forEach((nav) => {
  if (nav.querySelector('a[href="clubs.html"]')) return;
  const link = document.createElement("a");
  link.className = "nav-link";
  link.href = "clubs.html";
  link.innerHTML = "Campus <b>Clubs</b>";
  if (isClubsPage) link.setAttribute("aria-current", "page");
  nav.insertBefore(link, nav.querySelector('a[href="surveys.html"]'));
});
document.querySelectorAll(".campus-dropdown").forEach((nav) => {
  if (nav.querySelector('a[href="clubs.html"]')) return;
  const link = document.createElement("a");
  link.className = "campus-nav-link";
  link.href = "clubs.html";
  link.innerHTML = '<span>Campus <b>Clubs</b></span><span class="campus-link-arrow" aria-hidden="true"></span>';
  if (isClubsPage) link.setAttribute("aria-current", "page");
  nav.insertBefore(link, nav.querySelector('a[href="surveys.html"]'));
});
document.querySelectorAll(".nav-links").forEach((nav) => {
  if (nav.querySelector('a[href="surveys.html"]')) return;
  const link = document.createElement("a");
  link.className = "nav-link";
  link.href = "surveys.html";
  link.innerHTML = "Campus <b>Opinions</b>";
  if (isOpinionsPage) link.setAttribute("aria-current", "page");
  nav.append(link);
});
document.querySelectorAll(".campus-dropdown").forEach((nav) => {
  if (nav.querySelector('a[href="surveys.html"]')) return;
  const link = document.createElement("a");
  link.className = "campus-nav-link";
  link.href = "surveys.html";
  link.innerHTML = '<span>Campus <b>Opinions</b></span><span class="campus-link-arrow" aria-hidden="true"></span>';
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
