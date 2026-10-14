import { supabase } from "./supabase.js";

const sections = {
  laundry: { path: "/", label: "Laundry status" },
  mess: { path: "/mess-menu", label: "Mess menu" },
  bus: { path: "/bus-timings", label: "Bus timings" },
  curriculum: { path: "/curriculum", label: "B.Tech curriculum" },
  "campus-map": { path: "/campus-map", label: "Campus map" },
};

const normalizePath = (path) => {
  const normalized = path.replace(/\.html$/, "").replace(/\/index$/, "/");
  return normalized || "/";
};

const currentPath = normalizePath(location.pathname);
const getSectionKey = (path) =>
  Object.entries(sections).find(([, section]) => section.path === path)?.[0];

function addUnavailableMessage(label) {
  const message = document.createElement("section");
  message.className = "section-unavailable";
  message.innerHTML = `
    <p class="section-kicker">TEMPORARILY UNAVAILABLE</p>
    <h1>${label} is currently unavailable.</h1>
    <p>Please check back later.</p>
  `;
  message.style.cssText =
    "max-width:760px;margin:80px auto;padding:38px;border:1px solid var(--line);border-radius:12px;background:var(--surface);";
  message.querySelector("h1").style.cssText =
    "margin:0;font-size:clamp(30px,5vw,51px);letter-spacing:-2px;line-height:1.05;";
  message.querySelector("p:last-child").style.cssText =
    "margin:16px 0 0;color:var(--muted);";
  document.querySelector("main")?.append(message);
}

function applyVisibility(rows) {
  const visibility = new Map(rows.map((row) => [row.section_key, row.is_public]));

  document.querySelectorAll(".nav-link, .campus-nav-link").forEach((link) => {
    const key = getSectionKey(normalizePath(new URL(link.href).pathname));
    if (key && visibility.get(key) === false) link.hidden = true;
  });

  const currentSection = getSectionKey(currentPath);
  if (currentSection && visibility.get(currentSection) === false) {
    document.querySelectorAll("main > *:not(nav)").forEach((element) => {
      element.hidden = true;
    });
    addUnavailableMessage(sections[currentSection].label);
  }
}

async function initialize() {
  const { data, error } = await supabase
    .from("site_section_visibility")
    .select("section_key, is_public");
  if (error) throw error;
  applyVisibility(data ?? []);
}

initialize().catch((error) => {
  console.error("Section visibility could not be loaded.", error);
});
