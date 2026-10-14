import { supabase } from "./supabase.js";

const byId = (id) => document.getElementById(id);
const pageNames = {
  "/": "Laundry status",
  "/mess-menu": "Mess menu",
  "/bus-timings": "Bus timings",
  "/campus-map": "Campus map",
  "/curriculum": "B.Tech curriculum",
};
const sections = [
  ["laundry", "Laundry status"],
  ["mess", "Mess menu"],
  ["bus", "Bus timings"],
  ["curriculum", "B.Tech curriculum"],
  ["campus-map", "Campus map"],
];

const themeToggle = byId("adminThemeToggle");
const themeLabel = themeToggle?.querySelector("[data-theme-toggle-label]");
const themeRoot = document.documentElement;

function initializeTheme() {
  let theme = "lime";
  try {
    theme = localStorage.getItem("lnmiit-theme") || "lime";
  } catch (error) {
    console.error("Theme preference could not be read.", error);
  }

  const applyTheme = (nextTheme) => {
    themeRoot.dataset.theme = nextTheme;
    themeToggle.setAttribute("aria-pressed", String(nextTheme === "dusk"));
    themeLabel.textContent = nextTheme === "dusk" ? "Dusk" : "Lime";
  };

  applyTheme(theme === "dusk" ? "dusk" : "lime");
  themeToggle.addEventListener("click", () => {
    const nextTheme = themeRoot.dataset.theme === "dusk" ? "lime" : "dusk";
    try {
      localStorage.setItem("lnmiit-theme", nextTheme);
    } catch (error) {
      console.error("Theme preference could not be saved.", error);
    }
    applyTheme(nextTheme);
  });
}

function showLogin(message = "") {
  byId("adminLogin").classList.remove("hidden");
  byId("analyticsPanel").classList.add("hidden");
  byId("adminMessage").textContent = message;
}

function showAdmin() {
  byId("adminLogin").classList.add("hidden");
  byId("analyticsPanel").classList.remove("hidden");
}

async function loadAnalytics() {
  const { data, error } = await supabase.rpc("get_site_traffic_analytics");
  if (error) throw error;
  byId("todayViews").textContent = data.today ?? 0;
  byId("weekViews").textContent = data.week ?? 0;
  byId("allViews").textContent = data.all ?? 0;
  const breakdown = data.breakdown ?? {};
  byId("trafficBreakdown").replaceChildren(
    ...Object.entries(pageNames).map(([path, name]) => {
      const row = document.createElement("div");
      row.className = "traffic-row";
      row.innerHTML = `<span>${name}</span><span>${breakdown[path] ?? 0} views</span>`;
      return row;
    }),
  );
}

function createVisibilityPanel() {
  const panel = document.createElement("section");
  panel.className = "section-visibility";
  panel.innerHTML = `
    <h2>Public section visibility</h2>
    <p>Temporarily hide any campus section from visitors. Hidden sections are removed from navigation and direct visits show an unavailable message.</p>
    <div class="section-visibility-list"></div>
    <p class="section-visibility-message" role="status"></p>
  `;
  byId("analyticsPanel").append(panel);
  return panel;
}

function renderVisibilityRows(panel, rows) {
  const visibility = new Map(rows.map((row) => [row.section_key, row.is_public]));
  const list = panel.querySelector(".section-visibility-list");
  list.replaceChildren(
    ...sections.map(([key, label]) => {
      const row = document.createElement("div");
      row.className = "section-visibility-row";
      const name = document.createElement("strong");
      name.textContent = label;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "visibility-toggle";
      button.dataset.sectionKey = key;
      button.dataset.isPublic = String(visibility.get(key) !== false);
      button.textContent = visibility.get(key) !== false ? "Public" : "Hidden";
      button.setAttribute("aria-pressed", String(visibility.get(key) !== false));
      row.append(name, button);
      return row;
    }),
  );
}

async function loadVisibility(panel) {
  const { data, error } = await supabase
    .from("site_section_visibility")
    .select("section_key, is_public")
    .order("section_key");
  if (error) throw error;
  renderVisibilityRows(panel, data ?? []);
}

async function updateVisibility(panel, button) {
  const isPublic = button.dataset.isPublic !== "true";
  button.disabled = true;
  const { error } = await supabase
    .from("site_section_visibility")
    .update({ is_public: isPublic })
    .eq("section_key", button.dataset.sectionKey);
  button.disabled = false;
  if (error) {
    panel.querySelector(".section-visibility-message").textContent =
      "Could not save that visibility change. Please try again.";
    console.error("Section visibility could not be updated.", error);
    return;
  }
  button.dataset.isPublic = String(isPublic);
  button.textContent = isPublic ? "Public" : "Hidden";
  button.setAttribute("aria-pressed", String(isPublic));
  panel.querySelector(".section-visibility-message").textContent =
    `${button.closest(".section-visibility-row").querySelector("strong").textContent} is now ${
      isPublic ? "public" : "hidden"
    }.`;
}

function bindVisibilityPanel(panel) {
  panel.addEventListener("click", (event) => {
    const button = event.target.closest(".visibility-toggle");
    if (button) updateVisibility(panel, button);
  });
}

async function initialize() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return showLogin();
  if (session.user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return showLogin("This account is not an admin account.");
  }
  showAdmin();
  const panel = createVisibilityPanel();
  bindVisibilityPanel(panel);
  try {
    await loadAnalytics();
  } catch (error) {
    console.error("Admin data could not be loaded.", error);
  }
  try {
    await loadVisibility(panel);
  } catch (error) {
    panel.querySelector(".section-visibility-message").textContent =
      "Visibility settings could not be loaded.";
    console.error("Section visibility could not be loaded.", error);
  }
}

byId("adminLoginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  const { error } = await supabase.auth.signInWithPassword({
    email: byId("adminEmail").value.trim(),
    password: byId("adminPassword").value,
  });
  button.disabled = false;
  if (error) return showLogin("Check the email and password, then try again.");
  initializeTheme();
  initialize();
});

byId("adminSignOut").addEventListener("click", async () => {
  await supabase.auth.signOut();
  showLogin();
});

initialize();
