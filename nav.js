import "./section-visibility.js?v=20261016";
import "./user-auth.js?v=20261021";

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
