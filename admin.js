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
const adminStyle = document.createElement("style");
adminStyle.textContent = `
  .admin-section-nav { display: flex; gap: 8px; max-width: 760px; margin: 0 auto 18px; }
  .admin-section-nav button, .admin-section-select { padding: 10px 13px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); color: var(--ink); font: 700 12px Manrope; cursor: pointer; }
  .admin-section-nav button.is-active { background: var(--ink); color: #fff; border-color: var(--ink); }
  .admin-section-select { display: none; width: 100%; }
  .is-admin-section-hidden { display: none; }
  @media (max-width: 700px) { .admin-section-nav { display: block; } .admin-section-nav button { display: none; } .admin-section-select { display: block; } }
`;
document.head.append(adminStyle);

function initializeTheme() {
  if (!themeToggle || !themeLabel) return;
  const root = document.documentElement;
  const applyTheme = (theme) => {
    root.toggleAttribute("data-theme", theme === "dusk");
    themeToggle.setAttribute("aria-pressed", String(theme === "dusk"));
    themeLabel.textContent = theme === "dusk" ? "Dusk" : "Lime";
  };
  let theme = "lime";
  try { theme = localStorage.getItem("lnmiit-theme") || "lime"; } catch (error) { console.error("Theme preference could not be read.", error); }
  applyTheme(theme);
  themeToggle.addEventListener("click", () => {
    const next = root.hasAttribute("data-theme") ? "lime" : "dusk";
    try { localStorage.setItem("lnmiit-theme", next); } catch (error) { console.error("Theme preference could not be saved.", error); }
    applyTheme(next);
  });
}

function showLogin(message = "") {
  byId("adminLogin").classList.remove("hidden");
  byId("analyticsPanel").classList.add("hidden");
  byId("adminSectionNav")?.classList.add("hidden");
  byId("adminMessage").textContent = message;
}

function showAdmin() {
  byId("adminLogin").classList.add("hidden");
  byId("analyticsPanel").classList.remove("hidden");
  byId("adminSectionNav")?.classList.remove("hidden");
}

function createSectionNav() {
  if (byId("adminSectionNav")) return;
  const nav = document.createElement("nav");
  nav.id = "adminSectionNav";
  nav.className = "admin-section-nav";
  nav.setAttribute("aria-label", "Admin sections");
  nav.innerHTML = `<button type="button" data-section="traffic" class="is-active">Traffic</button><button type="button" data-section="visibility">Hide tabs</button><select class="admin-section-select" aria-label="Admin section"><option value="traffic">Traffic</option><option value="visibility">Hide tabs</option></select>`;
  byId("analyticsPanel").before(nav);
  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-section]");
    if (button) setSection(button.dataset.section);
  });
  nav.querySelector("select").addEventListener("change", (event) => setSection(event.target.value));
}

function setSection(section) {
  [".analytics-topline", ".analytics-subtitle", ".traffic-stats", ".traffic-breakdown"].forEach((selector) => {
    document.querySelector(selector)?.classList.toggle("is-admin-section-hidden", section !== "traffic");
  });
  byId("sectionVisibilityPanel")?.classList.toggle("is-admin-section-hidden", section !== "visibility");
  document.querySelectorAll("[data-section]").forEach((button) => button.classList.toggle("is-active", button.dataset.section === section));
  const select = document.querySelector(".admin-section-select");
  if (select) select.value = section;
}

async function loadAnalytics() {
  const { data, error } = await supabase.rpc("get_site_traffic_analytics");
  if (error) throw error;
  byId("todayViews").textContent = data.today ?? 0;
  byId("weekViews").textContent = data.week ?? 0;
  byId("allViews").textContent = data.all ?? 0;
  const breakdown = data.breakdown ?? {};
  byId("trafficBreakdown").replaceChildren(...Object.entries(pageNames).map(([path, name]) => {
    const row = document.createElement("div");
    row.className = "traffic-row";
    row.innerHTML = `<span>${name}</span><span>${breakdown[path] ?? 0} views</span>`;
    return row;
  }));
}

function createVisibilityPanel() {
  const panel = document.createElement("section");
  panel.id = "sectionVisibilityPanel";
  panel.className = "section-visibility";
  panel.innerHTML = `<h2>Public section visibility</h2><p>Temporarily hide any campus section from visitors. Hidden sections are removed from navigation and direct visits show an unavailable message.</p><div class="section-visibility-list"></div><p class="section-visibility-message" role="status"></p>`;
  byId("analyticsPanel").append(panel);
  panel.addEventListener("click", (event) => {
    const button = event.target.closest(".visibility-toggle");
    if (button) updateVisibility(panel, button);
  });
  return panel;
}

function renderVisibility(panel, rows) {
  const visibility = new Map(rows.map((row) => [row.section_key, row.is_public]));
  panel.querySelector(".section-visibility-list").replaceChildren(...sections.map(([key, label]) => {
    const row = document.createElement("div");
    row.className = "section-visibility-row";
    const name = document.createElement("strong");
    name.textContent = label;
    const button = document.createElement("button");
    const isPublic = visibility.get(key) !== false;
    button.type = "button";
    button.className = "visibility-toggle";
    button.dataset.sectionKey = key;
    button.dataset.isPublic = String(isPublic);
    button.textContent = isPublic ? "Public" : "Hidden";
    button.setAttribute("aria-pressed", String(isPublic));
    row.append(name, button);
    return row;
  }));
}

async function loadVisibility(panel) {
  const { data, error } = await supabase.from("site_section_visibility").select("section_key, is_public").order("section_key");
  if (error) throw error;
  renderVisibility(panel, data ?? []);
}

async function updateVisibility(panel, button) {
  const nextValue = button.dataset.isPublic !== "true";
  button.disabled = true;
  const { data, error } = await supabase.from("site_section_visibility").update({ is_public: nextValue }).eq("section_key", button.dataset.sectionKey).select("section_key, is_public").maybeSingle();
  button.disabled = false;
  if (error || !data) {
    panel.querySelector(".section-visibility-message").textContent = "Could not save that visibility change.";
    console.error("Section visibility could not be updated.", error ?? "No row was updated.");
    return;
  }
  button.dataset.isPublic = String(data.is_public);
  button.textContent = data.is_public ? "Public" : "Hidden";
  button.setAttribute("aria-pressed", String(data.is_public));
}

async function initializeAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return showLogin();
  const { data: profile, error } = await supabase.from("user_profiles").select("is_active").eq("id", session.user.id).maybeSingle();
  if (error || profile?.is_active !== true || session.user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return showLogin("This account is not authorized for the admin dashboard.");
  }
  showAdmin();
  createSectionNav();
  const visibilityPanel = byId("sectionVisibilityPanel") || createVisibilityPanel();
  setSection("traffic");
  try { await Promise.all([loadAnalytics(), loadVisibility(visibilityPanel)]); } catch (loadError) { console.error("Admin data could not be loaded.", loadError); }
}

supabase.auth.onAuthStateChange((event, session) => {
  if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) initializeAdmin();
  if (!session && event === "SIGNED_OUT") showLogin();
});

byId("adminLoginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  const { error } = await supabase.auth.signInWithPassword({ email: byId("adminEmail").value.trim(), password: byId("adminPassword").value });
  button.disabled = false;
  if (error) showLogin("Check the email and password, then try again.");
});
byId("adminGoogleLogin").addEventListener("click", async (event) => {
  event.currentTarget.disabled = true;
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/admin.html` } });
  if (error) { event.currentTarget.disabled = false; byId("adminMessage").textContent = "Google sign-in could not be started."; }
});
byId("adminSignOut").addEventListener("click", () => supabase.auth.signOut());

initializeTheme();
initializeAdmin();
