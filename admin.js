import { supabase } from "./supabase.js";
import "./brand.js?v=20261021";
import "./ui-polish.js";

const byId = (id) => document.getElementById(id);
let adminSurveys = [];
let selectedAdminSurveyId = null;
let surveyResultsLoaded = false;
const pageNames = {
  "/": "Home",
  "/laundry": "Laundry status",
  "/mess-menu": "Mess menu",
  "/bus-timings": "Bus timings",
  "/campus-map": "Campus map",
  "/curriculum": "Academics",
  "/placements": "Placements",
  "/clubs": "Campus clubs",
  "/surveys": "Campus opinions",
};
const sections = [
  ["auth", "Sign-in requirement"],
  ["laundry", "Laundry status"],
  ["mess", "Mess menu"],
  ["bus", "Bus timings"],
  ["curriculum", "Academics"],
  ["placements", "Placements"],
  ["campus-map", "Campus map"],
  ["clubs", "Campus clubs"],
  ["surveys", "Campus opinions"],
  ["eateries", "Eateries"],
  ["ai-chat", "AI Chat"],
];

const themeToggle = byId("adminThemeToggle");
const themeLabel = themeToggle?.querySelector("[data-theme-toggle-label]");
const adminStyle = document.createElement("style");
adminStyle.textContent = `
  .theme-toggle[hidden] { display: none !important; }
  .admin-section-nav { display: flex; gap: 8px; max-width: 760px; margin: 0 auto 18px; }
  .admin-section-nav button, .admin-section-select { padding: 10px 13px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); color: var(--ink); font: 700 12px Manrope; cursor: pointer; }
  .admin-section-nav button.is-active { background: var(--ink); color: var(--on-dark); border-color: var(--ink); }
  .admin-section-select { display: none; width: 100%; }
  .is-admin-section-hidden { display: none; }
  .section-visibility-row { min-height: 66px; padding: 12px 0; }
  .visibility-toggle { min-width: 125px; min-height: 42px; padding: 11px 16px; border-radius: 7px; font-size: 12px; }
  .visibility-toggle[data-is-public=true] { background: #dcebdd; color: #23402e; }
  .visibility-toggle[data-is-public=false] { background: #f0d7d2; color: #7d3027; }
  .order-admin, .chatbot-admin-panel { margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--line); }
  .order-admin h2, .chatbot-admin-panel h2 { margin: 0 0 8px; font-size: 20px; }
  .order-admin p, .chatbot-admin-panel > p { color: var(--muted); font-size: 13px; line-height: 1.6; }
  .section-order-list { display: grid; gap: 9px; margin: 20px 0; }
  .section-order-item { display: flex; align-items: center; gap: 13px; width: 100%; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); text-align: left; cursor: grab; font: 700 14px Manrope; }
  .section-order-item:hover, .section-order-item:focus-visible { border-color: var(--accent); box-shadow: 0 4px 10px rgba(32,38,45,.08); }
  .section-order-item span:last-child { margin-left: auto; color: var(--muted); font: 10px "DM Mono", monospace; text-transform: uppercase; }
  .order-grip { color: var(--accent); font-size: 21px; }
  .order-admin > button, .chatbot-admin-panel button[type=submit] { padding: 12px 16px; border: 0; border-radius: 6px; background: var(--ink); color: var(--on-dark); font: 800 12px Manrope; cursor: pointer; }
  .admin-toggle-card { display: flex !important; align-items: center; gap: 13px; margin: 18px 0 !important; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); cursor: pointer; }
  .admin-toggle-card input { width: 22px !important; height: 22px; accent-color: var(--ink); }
  .admin-toggle-card small { display: block; margin-top: 4px; color: var(--muted); font-weight: 400; }
  .survey-admin { margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--line); }
  .survey-admin h2 { margin: 0 0 8px; font-size: 18px; } .survey-admin p { color: var(--muted); font-size: 13px; line-height: 1.6; }
  .survey-admin label { display: block; margin-top: 14px; font-size: 12px; font-weight: 800; } .survey-admin input[type=text], .survey-admin textarea, .survey-admin select { display: block; width: 100%; margin-top: 6px; padding: 10px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); color: var(--ink); font: 13px Manrope; }
  .survey-admin textarea { min-height: 80px; resize: vertical; } .survey-admin input[type=checkbox] { margin-right: 8px; accent-color: var(--ink); }
  .users-admin { margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--line); }
  .users-admin h2 { margin: 0 0 8px; font-size: 18px; } .users-admin p { color: var(--muted); font-size: 13px; line-height: 1.6; }
  .users-admin-total { display: block; margin: 18px 0; padding: 18px; border-radius: 8px; background: var(--ink); color: var(--on-dark); font: 700 30px "DM Mono", monospace; }
  .users-admin-total small { display: block; margin-bottom: 8px; color: var(--accent); font: 10px "DM Mono", monospace; letter-spacing: 1px; }
  .users-admin-list { border-top: 1px solid var(--line); } .users-admin-row { display: flex; justify-content: space-between; gap: 20px; padding: 14px 0; border-bottom: 1px solid var(--line); font-size: 13px; } .users-admin-row strong { display: block; } .users-admin-row small { display: block; margin-top: 4px; color: var(--muted); } .users-admin-date { color: var(--muted); white-space: nowrap; font: 11px "DM Mono", monospace; }
  .chatbot-admin { margin-top: 34px; padding-top: 25px; border-top: 1px solid var(--line); } .chatbot-admin h3 { margin: 0 0 8px; font-size: 17px; } .chatbot-admin label { display: block; margin-top: 14px; font-size: 12px; font-weight: 800; } .chatbot-admin input, .chatbot-admin textarea, .chatbot-admin select { display: block; width: 100%; margin-top: 7px; padding: 11px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); color: var(--ink); font: 13px Manrope; } .chatbot-admin textarea { min-height: 88px; resize: vertical; } .chatbot-admin input[type=checkbox] { display: inline-block; width: auto; margin: 0 8px 0 0; padding: 0; accent-color: var(--ink); } .chatbot-admin-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px; } .chatbot-admin-stat { padding: 12px; border-radius: 6px; background: var(--ink); color: var(--on-dark); } .chatbot-admin-stat small { display: block; color: var(--accent); font: 10px "DM Mono", monospace; } .chatbot-admin-stat strong { display: block; margin-top: 7px; font: 700 22px "DM Mono", monospace; } .chatbot-admin-message { min-height: 18px; margin: 12px 0 0 !important; } .chatbot-admin button { padding: 10px 14px; border: 0; border-radius: 5px; background: var(--ink); color: var(--on-dark); font: 800 12px Manrope; cursor: pointer; } @media (max-width: 700px) { .chatbot-admin-stats { grid-template-columns: 1fr; } }
  .settings-admin { margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--line); } .settings-admin h2 { margin: 0 0 8px; font-size: 18px; } .settings-admin p { color: var(--muted); font-size: 13px; line-height: 1.6; } .settings-admin label { display: block; margin-top: 16px; font-size: 12px; font-weight: 800; } .settings-admin input { display: block; width: 100%; margin-top: 7px; padding: 11px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); color: var(--ink); font: 13px Manrope; } .settings-admin input[type=checkbox] { display: inline-block; width: auto; margin: 0 8px 0 0; padding: 0; accent-color: var(--ink); } .settings-admin-actions { display: flex; align-items: center; gap: 14px; margin-top: 18px; } .settings-admin-actions button { padding: 10px 14px; border: 0; border-radius: 5px; background: var(--ink); color: var(--on-dark); font: 800 12px Manrope; cursor: pointer; } .settings-admin-message { min-height: 18px; margin: 0 !important; }
  .analytics-panel { max-width: 960px; padding: 46px; border-radius: 18px; box-shadow: 11px 12px 0 var(--accent); } .admin-section-nav { max-width: 960px; gap: 10px; margin-bottom: 22px; overflow-x: auto; } .admin-section-nav button, .admin-section-select { min-height: 42px; padding: 11px 16px; border-radius: 999px; font-size: 12px; white-space: nowrap; } .section-visibility-row, .section-order-item, .admin-toggle-card { border-radius: 12px; } .section-visibility-row { padding: 16px 0; } .chatbot-admin-panel, .order-admin, .settings-admin, .survey-admin, .users-admin { padding-top: 34px; } .chatbot-admin-panel h2, .order-admin h2, .settings-admin h2, .survey-admin h2, .users-admin h2 { font-size: 24px; letter-spacing: -.8px; } .chatbot-admin form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 18px; } .chatbot-admin form .admin-toggle-card, .chatbot-admin form .chatbot-admin-stats, .chatbot-admin form .settings-admin-actions { grid-column: 1 / -1; } .chatbot-admin form label { min-width: 0; } .chatbot-admin input, .chatbot-admin textarea, .chatbot-admin select, .survey-admin input[type=text], .survey-admin textarea, .survey-admin select, .settings-admin input { min-height: 44px; padding: 12px 13px; border-radius: 8px; font-size: 13px; outline: none; transition: border-color .18s, box-shadow .18s; } .chatbot-admin textarea, .survey-admin textarea { min-height: 108px; } .chatbot-admin input:focus, .chatbot-admin textarea:focus, .chatbot-admin select:focus, .survey-admin input:focus, .survey-admin textarea:focus, .survey-admin select:focus, .settings-admin input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(200,139,85,.18); } .admin-toggle-card { min-height: 80px; padding: 18px; box-shadow: 0 4px 0 var(--line); } .chatbot-admin-stats { gap: 12px; } .chatbot-admin-stat { min-height: 96px; padding: 17px; border-radius: 10px; } .chatbot-admin-stat strong { font-size: 28px; } .settings-admin-actions { align-items: center; } .settings-admin-actions button, .chatbot-admin button, .order-admin > button { min-height: 44px; padding: 12px 18px; border-radius: 8px; transition: transform .18s, filter .18s; } .settings-admin-actions button:hover, .chatbot-admin button:hover, .order-admin > button:hover { filter: brightness(1.12); transform: translateY(-1px); } @media (max-width: 700px) { .analytics-panel { padding: 28px 22px; } .chatbot-admin form { grid-template-columns: 1fr; } .chatbot-admin form .admin-toggle-card, .chatbot-admin form .chatbot-admin-stats, .chatbot-admin form .settings-admin-actions { grid-column: auto; } }
  .admin-data-actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; } .admin-data-actions button { padding: 9px 11px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); color: var(--ink); font: 800 12px Manrope; cursor: pointer; } .admin-data-actions button:hover, .admin-data-actions button:focus-visible { border-color: var(--ink); } .users-admin-filter { display: block; width: 100%; margin: 16px 0; padding: 11px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); color: var(--ink); font: 13px Manrope; }
  .survey-question-editor { margin-top: 18px; padding: 16px; border: 1px solid var(--line); border-radius: 7px; } .survey-question-editor-header { display: flex; justify-content: space-between; gap: 12px; align-items: center; } .survey-question-editor-header strong { font-size: 13px; } .survey-question-editor button, .survey-admin-action { padding: 9px 11px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); color: var(--ink); font: 800 12px Manrope; cursor: pointer; } .survey-publish { margin-top: 18px; border: 0; background: var(--ink); color: var(--on-dark); }
  .survey-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; } .survey-options input { margin-top: 0 !important; } .survey-admin-message { min-height: 18px; margin: 12px 0 0 !important; } .survey-admin-message.is-error { color: var(--red); } .survey-results { margin-top: 34px; } .survey-result-card { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--line); } .survey-result-card h3 { margin: 0; font-size: 14px; } .survey-bar-row { display: grid; grid-template-columns: minmax(90px, .8fr) minmax(0, 2fr) 38px; gap: 10px; align-items: center; margin-top: 10px; font-size: 12px; } .survey-bar { height: 9px; overflow: hidden; border-radius: 999px; background: var(--line); } .survey-bar i { display: block; height: 100%; background: var(--ink); } .survey-written-answer { margin: 10px 0 0; padding: 11px; border-radius: 5px; background: var(--surface-muted); color: var(--ink) !important; font-size: 12px !important; white-space: pre-wrap; } .survey-written-answer small { display: block; margin-bottom: 5px; color: var(--muted); font: 10px "DM Mono", monospace; }
  @media (max-width: 700px) { .admin-section-nav { display: block; } .admin-section-nav button { display: none; } .admin-section-select { display: block; } }
`;
document.head.append(adminStyle);

function initializeTheme() {
  if (!themeToggle || !themeLabel) return;
  const root = document.documentElement;
  const applyTheme = (theme) => {
    root.toggleAttribute("data-theme", theme === "dusk");
    themeToggle.setAttribute("aria-pressed", String(theme === "dusk"));
    themeLabel.textContent = theme === "dusk" ? "Dark" : "Light";
  };
  let theme = "light";
  try {
    const savedTheme = localStorage.getItem("lnmiit-theme");
    theme = savedTheme === "dusk" || savedTheme === "light" ? savedTheme : "light";
  } catch (error) { console.error("Theme preference could not be read.", error); }
  applyTheme(theme);
  themeToggle.addEventListener("click", () => {
    const next = root.hasAttribute("data-theme") ? "light" : "dusk";
    try { localStorage.setItem("lnmiit-theme", next); } catch (error) { console.error("Theme preference could not be saved.", error); }
    applyTheme(next);
  });
  supabase.from("site_settings").select("value").eq("key", "theme_enabled").maybeSingle().then(({ data, error }) => {
    if (error) { console.error("Theme availability could not be loaded.", error); return; }
    if (data?.value === "false") {
      applyTheme("light");
      themeToggle.hidden = true;
      try { localStorage.setItem("lnmiit-theme", "light"); } catch (storageError) { console.error("Light theme preference could not be saved.", storageError); }
    }
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
  nav.innerHTML = `<button type="button" data-section="traffic" class="is-active">Traffic</button><button type="button" data-section="users">Users</button><button type="button" data-section="surveys">Opinions</button><button type="button" data-section="visibility">Hide tabs</button><button type="button" data-section="order">Order</button><button type="button" data-section="chatbot">AI Chat</button><button type="button" data-section="settings">Settings</button><select class="admin-section-select" aria-label="Admin section"><option value="traffic">Traffic</option><option value="users">Users</option><option value="surveys">Opinions</option><option value="visibility">Hide tabs</option><option value="order">Order</option><option value="chatbot">AI Chat</option><option value="settings">Settings</option></select>`;
  byId("analyticsPanel").before(nav);
  byId("analyticsPanel").querySelector(".analytics-topline")?.insertAdjacentHTML("beforeend", '<div class="admin-data-actions"><button type="button" id="refreshTraffic">Refresh</button><button type="button" id="exportTraffic">Export CSV</button></div>');
  byId("refreshTraffic")?.addEventListener("click", () => loadAnalytics());
  byId("exportTraffic")?.addEventListener("click", exportTraffic);
  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-section]");
    if (button) setSection(button.dataset.section);
  });
  nav.querySelector("select").addEventListener("change", (event) => setSection(event.target.value));
}

function setSection(section) {
  const validSections = ["traffic", "users", "surveys", "visibility", "order", "chatbot", "settings"];
  if (!validSections.includes(section)) section = "traffic";
  try {
    localStorage.setItem("dayboard-admin-section", section);
  } catch (error) {
    console.error("Admin section preference could not be saved.", error);
  }
  [".analytics-topline", ".analytics-subtitle", ".traffic-stats", ".traffic-breakdown"].forEach((selector) => {
    document.querySelector(selector)?.classList.toggle("is-admin-section-hidden", section !== "traffic");
  });
  byId("sectionVisibilityPanel")?.classList.toggle("is-admin-section-hidden", section !== "visibility");
  byId("surveyAdminPanel")?.classList.toggle("is-admin-section-hidden", section !== "surveys");
  byId("usersAdminPanel")?.classList.toggle("is-admin-section-hidden", section !== "users");
  byId("settingsAdminPanel")?.classList.toggle("is-admin-section-hidden", section !== "settings");
  byId("orderAdminPanel")?.classList.toggle("is-admin-section-hidden", section !== "order");
  byId("chatbotAdminPanel")?.classList.toggle("is-admin-section-hidden", section !== "chatbot");
  if (section === "surveys" && !surveyResultsLoaded) { surveyResultsLoaded = true; loadSurveyResults(); }
  if (section === "users") loadUsers(true);
  if (section === "settings") loadSettings();
  if (section === "order") loadOrder();
  if (section === "chatbot") loadChatbotSettings();
  document.querySelectorAll("[data-section]").forEach((button) => button.classList.toggle("is-active", button.dataset.section === section));
  const select = document.querySelector(".admin-section-select");
  if (select) select.value = section;
}

function createSettingsPanel() {
  const panel = document.createElement("section");
  panel.id = "settingsAdminPanel";
  panel.className = "settings-admin is-admin-section-hidden";
  panel.innerHTML = `<h2>Site settings</h2><p>Change the public identity and publish a campus-wide announcement without editing the website files.</p><form id="siteSettingsForm"><label for="siteNameSetting">Site name<input id="siteNameSetting" name="site_name" maxlength="80" required></label><label for="siteCreditSetting">Credit or subtitle<input id="siteCreditSetting" name="site_credit" maxlength="120"></label><label for="announcementTextSetting">Announcement<input id="announcementTextSetting" name="announcement_text" maxlength="240" placeholder="Optional message for every visitor"></label><label for="announcementLinkSetting">Announcement link<input id="announcementLinkSetting" name="announcement_link" maxlength="300" placeholder="/surveys.html or https://..."></label><label for="announcementExpiresSetting">Announcement expires<input id="announcementExpiresSetting" name="announcement_expires" type="datetime-local"></label><label><input id="announcementVisibleSetting" name="announcement_visible" type="checkbox"> Show announcement across the site</label><label><input id="announcementImportantSetting" name="announcement_important" type="checkbox"> Mark announcement as important</label><div class="settings-admin-actions"><button type="submit">Save settings</button><p id="siteSettingsMessage" class="settings-admin-message" role="status"></p></div></form>`;
  byId("analyticsPanel").append(panel);
  byId("siteSettingsForm").addEventListener("submit", saveSettings);
  return panel;
}

async function loadSettings() {
  const nameInput = byId("siteNameSetting");
  const creditInput = byId("siteCreditSetting");
  if (!nameInput || !creditInput || nameInput.dataset.loaded === "true") return;
  const { data, error } = await supabase.from("site_settings").select("key,value").in("key", ["site_name", "site_credit", "announcement_text", "announcement_visible", "announcement_important", "announcement_link", "announcement_expires", "chatbot_enabled", "chatbot_name", "chatbot_welcome", "chatbot_model", "chatbot_instructions"]);
  if (error) {
    byId("siteSettingsMessage").textContent = `Settings could not be loaded: ${error.message}`;
    console.error("Site settings could not be loaded.", error);
    return;
  }
  const values = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  nameInput.value = values.site_name || "TheDayBoard";
  creditInput.value = values.site_credit || "";
  byId("announcementTextSetting").value = values.announcement_text || "";
  byId("announcementLinkSetting").value = values.announcement_link || "";
  byId("announcementExpiresSetting").value = values.announcement_expires ? values.announcement_expires.slice(0, 16) : "";
  byId("announcementVisibleSetting").checked = values.announcement_visible === "true";
  byId("announcementImportantSetting").checked = values.announcement_important === "true";
  nameInput.dataset.loaded = "true";
}

async function loadChatbotAnalytics() {
  const { data, error } = await supabase.rpc("get_chatbot_analytics");
  if (error) {
    byId("chatbotSettingsMessage").textContent = `Request totals unavailable: ${error.message}. Run supabase-migration-chatbot.sql.`;
    console.error("Chatbot analytics could not be loaded.", error);
    return;
  }
  byId("chatbotTodayRequests").textContent = data?.today ?? 0;
  byId("chatbotWeekRequests").textContent = data?.week ?? 0;
  byId("chatbotAllRequests").textContent = data?.all ?? 0;
}

async function saveSettings(event) {
  event.preventDefault();
  const message = byId("siteSettingsMessage");
  const updates = [
    { key: "site_name", value: byId("siteNameSetting").value.trim() },
    { key: "site_credit", value: byId("siteCreditSetting").value.trim() },
    { key: "announcement_text", value: byId("announcementTextSetting").value.trim() },
    { key: "announcement_link", value: byId("announcementLinkSetting").value.trim() },
    { key: "announcement_expires", value: byId("announcementExpiresSetting").value ? new Date(byId("announcementExpiresSetting").value).toISOString() : "" },
    { key: "announcement_visible", value: String(byId("announcementVisibleSetting").checked) },
    { key: "announcement_important", value: String(byId("announcementImportantSetting").checked) },
  ];
  if (!updates[0].value) {
    message.textContent = "Site name is required.";
    return;
  }
  const results = await Promise.all(updates.map((setting) =>
    supabase.from("site_settings").update({ value: setting.value }).eq("key", setting.key),
  ));
  const error = results.find((result) => result.error)?.error;
  if (error) {
    message.textContent = `Settings could not be saved: ${error.message}`;
    console.error("Site settings could not be saved.", error);
    return;
  }
  message.textContent = "Settings saved.";
}

const orderedSections = [
  ["laundry.html", "Laundry"], ["mess-menu.html", "Mess"], ["bus-timings.html", "Bus"],
  ["curriculum.html", "Academics"], ["campus-map.html", "Map"], ["placements.html", "Placements"],
  ["clubs.html", "Clubs"], ["surveys.html", "Opinions"], ["chatbot.html", "AI Chat"], ["eateries.html", "Eateries"],
];

function createChatbotPanel() {
  const panel = document.createElement("section");
  panel.id = "chatbotAdminPanel";
  panel.className = "chatbot-admin-panel is-admin-section-hidden";
  panel.innerHTML = `<h2>AI Chat controls</h2><p>Manage the chatbot separately from general site settings.</p><form id="chatbotSettingsForm"><label class="admin-toggle-card"><input id="chatbotEnabledSetting" type="checkbox"><span><strong>AI Chat visible</strong><small>Show the chatbot card, navigation link, and floating button.</small></span></label><label for="chatbotNameSetting">Assistant name<input id="chatbotNameSetting" maxlength="80"></label><label for="chatbotWelcomeSetting">Welcome message<input id="chatbotWelcomeSetting" maxlength="240"></label><label for="chatbotModelSetting">Pollinations model<select id="chatbotModelSetting"><option value="openai">OpenAI-compatible default</option><option value="mistral">Mistral</option><option value="openai-fast">OpenAI fast</option></select></label><label for="chatbotInstructionsSetting">Additional instructions<textarea id="chatbotInstructionsSetting" maxlength="1000"></textarea></label><div class="chatbot-admin-stats"><div class="chatbot-admin-stat"><small>TODAY</small><strong id="chatbotTodayRequests">-</strong></div><div class="chatbot-admin-stat"><small>LAST 7 DAYS</small><strong id="chatbotWeekRequests">-</strong></div><div class="chatbot-admin-stat"><small>ALL TIME</small><strong id="chatbotAllRequests">-</strong></div></div><div class="settings-admin-actions"><button type="submit">Save AI Chat</button><p id="chatbotSettingsMessage" class="chatbot-admin-message" role="status"></p></div></form>`;
  byId("analyticsPanel").append(panel);
  byId("chatbotSettingsForm").addEventListener("submit", saveChatbotSettings);
  return panel;
}

async function loadChatbotSettings() {
  const { data, error } = await supabase.from("site_settings").select("key,value").in("key", ["chatbot_enabled", "chatbot_name", "chatbot_welcome", "chatbot_model", "chatbot_instructions"]);
  if (error) {
    byId("chatbotSettingsMessage").textContent = `AI Chat settings could not be loaded: ${error.message}`;
    return;
  }
  const values = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  byId("chatbotEnabledSetting").checked = values.chatbot_enabled !== "false";
  byId("chatbotNameSetting").value = values.chatbot_name || "TheDayBoard AI";
  byId("chatbotWelcomeSetting").value = values.chatbot_welcome || "Hi! I’m your campus assistant. What would you like to know?";
  byId("chatbotModelSetting").value = values.chatbot_model || "openai-fast";
  byId("chatbotInstructionsSetting").value = values.chatbot_instructions || "";
  loadChatbotAnalytics();
}

async function saveChatbotSettings(event) {
  event.preventDefault();
  const enabled = byId("chatbotEnabledSetting").checked;
  const updates = [
    { key: "chatbot_enabled", value: String(enabled) },
    { key: "chatbot_name", value: byId("chatbotNameSetting").value.trim() || "TheDayBoard AI" },
    { key: "chatbot_welcome", value: byId("chatbotWelcomeSetting").value.trim() || "Hi! I’m your campus assistant. What would you like to know?" },
    { key: "chatbot_model", value: byId("chatbotModelSetting").value },
    { key: "chatbot_instructions", value: byId("chatbotInstructionsSetting").value.trim() },
  ];
  const results = await Promise.all(updates.map((setting) => supabase.from("site_settings").update({ value: setting.value }).eq("key", setting.key)));
  const error = results.find((result) => result.error)?.error;
  const message = byId("chatbotSettingsMessage");
  if (error) {
    message.textContent = `AI Chat settings could not be saved: ${error.message}`;
    return;
  }
  const visibility = await supabase.from("site_section_visibility").update({ is_public: enabled }).eq("section_key", "ai-chat");
  if (visibility.error) {
    message.textContent = `AI Chat saved, but visibility could not be updated: ${visibility.error.message}`;
    return;
  }
  message.textContent = enabled ? "AI Chat is visible." : "AI Chat is hidden everywhere.";
}

function createOrderPanel() {
  const panel = document.createElement("section");
  panel.id = "orderAdminPanel";
  panel.className = "order-admin is-admin-section-hidden";
  panel.innerHTML = `<h2>Section order</h2><p>Drag the handles to set the order used on desktop navigation, mobile navigation, and the home page.</p><div id="sectionOrderList" class="section-order-list"></div><button id="saveSectionOrder" type="button">Save section order</button><p id="sectionOrderMessage" class="settings-admin-message" role="status"></p>`;
  byId("analyticsPanel").append(panel);
  byId("saveSectionOrder").addEventListener("click", saveOrder);
  return panel;
}

async function loadOrder() {
  const { data } = await supabase.from("site_settings").select("value").eq("key", "nav_order").maybeSingle();
  const saved = data?.value?.split(",").map((item) => item.trim()).filter(Boolean) || [];
  const order = [...saved, ...orderedSections.map(([path]) => path).filter((path) => !saved.includes(path))];
  const list = byId("sectionOrderList");
  list.replaceChildren(...order.map((path) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "section-order-item";
    item.draggable = true;
    item.dataset.path = path;
    item.innerHTML = `<span class="order-grip" aria-hidden="true">☷</span><strong>${orderedSections.find(([entry]) => entry === path)?.[1] || path}</strong><span>Drag</span>`;
    item.addEventListener("dragstart", () => item.classList.add("is-dragging"));
    item.addEventListener("dragend", () => item.classList.remove("is-dragging"));
    item.addEventListener("dragover", (event) => {
      event.preventDefault();
      const dragging = list.querySelector(".is-dragging");
      if (dragging && dragging !== item) list.insertBefore(dragging, item);
    });
    return item;
  }));
}

async function saveOrder() {
  const value = [...document.querySelectorAll(".section-order-item")].map((item) => item.dataset.path).join(",");
  const { error } = await supabase.from("site_settings").update({ value }).eq("key", "nav_order");
  byId("sectionOrderMessage").textContent = error ? `Order could not be saved: ${error.message}` : "Order saved. Refresh the site to apply it.";
}

function createUsersPanel() {
  const panel = document.createElement("section");
  panel.id = "usersAdminPanel";
  panel.className = "users-admin is-admin-section-hidden";
  panel.innerHTML = `<h2>Registered users</h2><p>Google accounts that have signed in to TheDayBoard.</p><strong class="users-admin-total"><small>TOTAL USERS</small><span id="usersAdminTotal">-</span></strong><div class="admin-data-actions"><button type="button" id="refreshUsers">Refresh users</button><button type="button" id="exportUsers">Export CSV</button></div><input id="usersAdminFilter" class="users-admin-filter" type="search" placeholder="Search by name or email" aria-label="Search users"><div id="usersAdminList" class="users-admin-list"><p>Loading users...</p></div>`;
  byId("analyticsPanel").append(panel);
  byId("refreshUsers").addEventListener("click", () => loadUsers(true));
  byId("exportUsers").addEventListener("click", exportUsers);
  byId("usersAdminFilter").addEventListener("input", renderUsers);
  return panel;
}

let adminUsers = [];

function renderUsers() {
  const list = byId("usersAdminList");
  const filter = byId("usersAdminFilter")?.value.trim().toLowerCase() || "";
  if (!list) return;
  const users = adminUsers.filter((user) => `${user.display_name || ""} ${user.email || ""}`.toLowerCase().includes(filter));
  list.innerHTML = users.length ? users.map((user) => `<div class="users-admin-row"><span><strong>${escapeHtml(user.display_name || "Unnamed user")}</strong><small>${escapeHtml(user.email || "No email")}</small></span><time class="users-admin-date">${new Date(user.created_at).toLocaleDateString()}</time></div>`).join("") : "<p>No matching users.</p>";
}

async function loadUsers(refresh = false) {
  const list = byId("usersAdminList");
  const total = byId("usersAdminTotal");
  if (!list || !total || (list.dataset.loaded === "true" && !refresh)) return;
  list.innerHTML = "<p>Loading users...</p>";
  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) {
    list.innerHTML = `<p>Users could not be loaded: ${escapeHtml(error.message || "Unknown database error")}</p>`;
    console.error("Admin users could not be loaded.", error);
    return;
  }
  const users = data ?? [];
  adminUsers = users;
  total.textContent = String(users.length);
  list.dataset.loaded = "true";
  renderUsers();
}

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function downloadCsv(filename, headers, rows) {
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportUsers() {
  if (!adminUsers.length) return;
  downloadCsv("thedayboard-users.csv", ["Name", "Email", "Signed up"], adminUsers.map((user) => [user.display_name || "Unnamed user", user.email || "", new Date(user.created_at).toISOString()]));
}

async function exportTraffic() {
  try {
    const { data } = await supabase.rpc("get_site_traffic_analytics");
    const breakdown = data?.breakdown || {};
    downloadCsv("thedayboard-traffic.csv", ["Page", "Views (last 7 days)"], Object.entries(pageNames).map(([path, name]) => [name, breakdown[path] ?? 0]));
  } catch (error) {
    console.error("Traffic export failed.", error);
  }
}

function withRequestTimeout(request, timeoutMs = 20000) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error("The request timed out. Check your connection and try again.")), timeoutMs);
  });
  return Promise.race([request, timeout]).finally(() => window.clearTimeout(timeoutId));
}

function questionEditor(number) {
  const question = document.createElement("fieldset");
  question.className = "survey-question-editor";
  question.innerHTML = `<div class="survey-question-editor-header"><strong>Question ${number}</strong><button type="button" class="remove-survey-question">Remove</button></div><label>Question<input class="survey-question-prompt" type="text" maxlength="500" required></label><label>Answer type<select class="survey-question-type"><option value="mcq">Multiple choice</option><option value="written">Written answer</option></select></label><div class="survey-options"><input type="text" maxlength="200" placeholder="Option 1" required><input type="text" maxlength="200" placeholder="Option 2" required><input type="text" maxlength="200" placeholder="Option 3"><input type="text" maxlength="200" placeholder="Option 4"></div>`;
  question.querySelector(".survey-question-type").addEventListener("change", (event) => {
    const options = question.querySelector(".survey-options");
    const isMcq = event.target.value === "mcq";
    options.hidden = !isMcq;
    options.querySelectorAll("input").forEach((input, index) => { input.required = isMcq && index < 2; });
  });
  question.querySelector(".remove-survey-question").addEventListener("click", () => { question.remove(); renumberQuestions(); });
  return question;
}

function renumberQuestions() { document.querySelectorAll(".survey-question-editor").forEach((question, index) => { question.querySelector("strong").textContent = `Question ${index + 1}`; }); }

function createSurveyPanel() {
  if (byId("surveyAdminPanel")) return byId("surveyAdminPanel");
  const panel = document.createElement("section");
  panel.id = "surveyAdminPanel";
  panel.className = "survey-admin is-admin-section-hidden";
  panel.innerHTML = `<h2>Publish an opinion</h2><p>Create one or more multiple-choice or written questions. Publishing a new opinion closes any currently published one.</p><form id="surveyEditor"><label>Title<input id="surveyTitle" type="text" maxlength="140" required></label><label>Description <textarea id="surveyDescription" maxlength="1000"></textarea></label><label><input id="surveyCollectName" type="checkbox">Collect respondent names (leave unchecked for anonymous opinions)</label><div id="surveyQuestionEditors"></div><button class="survey-admin-action" id="addSurveyQuestion" type="button">Add question</button><button class="survey-admin-action survey-publish" type="submit">Publish opinion</button><p class="survey-admin-message" role="status"></p></form><div class="survey-results"><h2>Opinion results</h2><div id="surveyResults"><p>Loading results?</p></div></div>`;
  panel.querySelector("p").textContent = "Publish as many open opinions as needed. Each can contain multiple-choice and written questions.";
  byId("analyticsPanel").append(panel);
  const editors = panel.querySelector("#surveyQuestionEditors");
  const password = document.createElement("label");
  password.innerHTML = `Survey password (optional)<input id="surveyPassword" type="password" maxlength="200" autocomplete="new-password" placeholder="Leave blank for public access">`;
  editors.before(password);
  editors.append(questionEditor(1));
  panel.querySelector("#addSurveyQuestion").addEventListener("click", () => editors.append(questionEditor(editors.children.length + 1)));
  panel.querySelector("#surveyEditor").addEventListener("submit", publishSurvey);
  return panel;
}

async function publishSurvey(event) {
  event.preventDefault();
  const form = event.currentTarget, message = form.querySelector(".survey-admin-message"), button = event.submitter || form.querySelector(".survey-publish");
  if (button.disabled) return;
  const questionNodes = [...form.querySelectorAll(".survey-question-editor")];
  const questions = questionNodes.map((node, index) => {
    const type = node.querySelector(".survey-question-type").value;
    const options = type === "mcq" ? [...node.querySelectorAll(".survey-options input")].map((input) => input.value.trim()).filter(Boolean) : [];
    return { position: index + 1, prompt: node.querySelector(".survey-question-prompt").value.trim(), question_type: type, options };
  });
  if (!questions.length || questions.some((question) => !question.prompt || (question.question_type === "mcq" && question.options.length < 2))) { message.textContent = "Every question needs a prompt, and multiple-choice questions need at least two options."; return; }
  button.disabled = true; message.textContent = "Publishing?"; message.classList.remove("is-error");
  try {
    const { data: surveyId, error } = await withRequestTimeout(supabase.rpc("publish_survey", {
      p_title: byId("surveyTitle").value.trim(),
      p_description: byId("surveyDescription").value.trim(),
      p_collect_name: byId("surveyCollectName").checked,
      p_password: byId("surveyPassword").value,
      p_questions: questions,
    }));
    if (error) throw error;
    form.reset(); form.querySelector("#surveyQuestionEditors").replaceChildren(questionEditor(1)); message.textContent = "Opinion published."; selectedAdminSurveyId = surveyId; surveyResultsLoaded = true; loadSurveyResults(true);
  } catch (error) {
    console.error("Survey publication failed.", error);
    message.classList.add("is-error");
    message.textContent = error?.code === "PGRST202" ? "The Opinions database migration has not been run yet." : (error?.message || "The opinion could not be published. Please try again.");
  } finally {
    button.disabled = false;
  }
}

async function loadSurveyResults(refresh = false) {
  const target = byId("surveyResults"); if (!target) return;
  let surveys = adminSurveys, error = null;
  if (refresh || !surveys.length) ({ data: surveys, error } = await supabase.from("surveys").select("id,title,description,collect_name,is_published,created_at").order("created_at", { ascending: false }));
  if (error || !surveys?.length) { target.innerHTML = "<p>No opinions have been published yet.</p>"; return; }
  adminSurveys = surveys;
  if (!selectedAdminSurveyId || !surveys.some((item) => item.id === selectedAdminSurveyId)) selectedAdminSurveyId = surveys[0].id;
  const survey = surveys.find((item) => item.id === selectedAdminSurveyId);
  const [{ data: questions }, { data: responses }] = await Promise.all([supabase.from("survey_questions").select("id,prompt,question_type,options,position").eq("survey_id", survey.id).order("position"), supabase.from("survey_responses").select("id,respondent_name,submitted_at").eq("survey_id", survey.id)]);
  const responseIds = (responses ?? []).map((response) => response.id);
  const { data: answers } = responseIds.length ? await supabase.from("survey_answers").select("response_id,question_id,answer_text").in("response_id", responseIds) : { data: [] };
  const responseById = new Map((responses ?? []).map((response) => [response.id, response]));
  target.innerHTML = `<p><strong>${escapeHtml(survey.title)}</strong> \u00b7 ${responses?.length ?? 0} response${responses?.length === 1 ? "" : "s"}${survey.is_published ? " \u00b7 currently open" : ""}</p>${(questions ?? []).map((question) => {
    const questionAnswers = (answers ?? []).filter((answer) => answer.question_id === question.id);
    if (question.question_type === "mcq") { const counts = new Map(question.options.map((option) => [option, 0])); questionAnswers.forEach((answer) => counts.set(answer.answer_text, (counts.get(answer.answer_text) ?? 0) + 1)); const max = Math.max(1, ...counts.values()); return `<article class="survey-result-card"><h3>${escapeHtml(question.prompt)}</h3>${[...counts].map(([option, count]) => `<div class="survey-bar-row"><span>${escapeHtml(option)}</span><div class="survey-bar"><i style="width:${Math.round(count / max * 100)}%"></i></div><strong>${count}</strong></div>`).join("")}</article>`; }
    return `<article class="survey-result-card"><h3>${escapeHtml(question.prompt)}</h3>${questionAnswers.length ? questionAnswers.map((answer) => `<p class="survey-written-answer">${survey.collect_name ? `<small>${escapeHtml(responseById.get(answer.response_id)?.respondent_name || "Unnamed")}</small>` : ""}${escapeHtml(answer.answer_text)}</p>`).join("") : "<p>No written responses yet.</p>"}</article>`;
  }).join("")}`;
  target.insertAdjacentHTML("afterbegin", `<label class="survey-result-picker">View or manage opinion<select id="surveyResultPicker">${surveys.map((item) => `<option value="${item.id}"${item.id === survey.id ? " selected" : ""}>${escapeHtml(item.title)}${item.is_published ? " (open)" : ""}</option>`).join("")}</select></label><div class="survey-result-actions"><button type="button" id="editSurvey">Edit details</button><button type="button" id="deleteSurvey">Delete survey</button></div>`);
  byId("surveyResultPicker").addEventListener("change", (event) => { selectedAdminSurveyId = event.target.value; loadSurveyResults(); });
  byId("editSurvey").addEventListener("click", editSelectedSurvey);
  byId("deleteSurvey").addEventListener("click", deleteSelectedSurvey);
}

async function editSelectedSurvey() {
  const survey = adminSurveys.find((item) => item.id === selectedAdminSurveyId); if (!survey) return;
  const title = prompt("Opinion title", survey.title); if (title === null || !title.trim()) return;
  const description = prompt("Opinion description", survey.description || ""); if (description === null) return;
  const collectName = confirm("Select OK to collect respondent names. Select Cancel to keep responses anonymous.");
  const password = prompt("Enter a new password. Leave it blank to remove password protection."); if (password === null) return;
  const { error } = await supabase.from("surveys").update({ title: title.trim(), description: description.trim(), collect_name: collectName }).eq("id", survey.id);
  if (error) { alert("The opinion could not be updated."); return; }
  const { error: passwordError } = await supabase.rpc("set_survey_password", { p_survey_id: survey.id, p_password: password });
  if (passwordError) { alert("The survey details changed, but its password could not be saved."); }
  loadSurveyResults(true);
}

async function deleteSelectedSurvey() {
  const survey = adminSurveys.find((item) => item.id === selectedAdminSurveyId);
  if (!survey || !confirm(`Delete "${survey.title}" and all of its responses? This cannot be undone.`)) return;
  const { error } = await supabase.from("surveys").delete().eq("id", survey.id);
  if (error) { alert("The opinion could not be deleted."); return; }
  selectedAdminSurveyId = null; loadSurveyResults(true);
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
    const button = event.target.closest(".visibility-toggle, .theme-visibility-toggle");
    if (!button) return;
    if (button.classList.contains("theme-visibility-toggle")) updateThemeAvailability(panel, button);
    else updateVisibility(panel, button);
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
    button.textContent = key === "auth" ? (isPublic ? "Optional" : "Required") : (isPublic ? "Public" : "Hidden");
    button.setAttribute("aria-pressed", String(isPublic));
    row.append(name, button);
    return row;
  }), createThemeVisibilityRow(panel));
}

function createThemeVisibilityRow(panel) {
  const row = document.createElement("div");
  row.className = "section-visibility-row";
  const name = document.createElement("strong");
  name.textContent = "Light/Dark mode";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "visibility-toggle theme-visibility-toggle";
  button.dataset.themeEnabled = "true";
  button.textContent = "Loading";
  button.disabled = true;
  button.setAttribute("aria-label", "Change Light/Dark mode availability");
  row.append(name, button);
  return row;
}

async function loadVisibility(panel) {
  const { data, error } = await supabase.from("site_section_visibility").select("section_key, is_public").order("section_key");
  if (error) throw error;
  renderVisibility(panel, data ?? []);
  const { data: themeSetting, error: themeError } = await supabase.from("site_settings").select("value").eq("key", "theme_enabled").maybeSingle();
  if (themeError) throw themeError;
  const themeButton = panel.querySelector(".theme-visibility-toggle");
  if (themeButton) {
    const enabled = themeSetting?.value !== "false";
    themeButton.dataset.themeEnabled = String(enabled);
    themeButton.textContent = enabled ? "Enabled" : "Disabled";
    themeButton.dataset.isPublic = String(enabled);
    themeButton.disabled = false;
  }
}

async function updateThemeAvailability(panel, button) {
  const previous = button.dataset.themeEnabled === "true";
  const enabled = !previous;
  const message = panel.querySelector(".section-visibility-message");
  button.disabled = true;
  const { data, error } = await supabase.from("site_settings").update({ value: String(enabled) }).eq("key", "theme_enabled").select("key,value").maybeSingle();
  button.disabled = false;
  if (error || !data) {
    message.textContent = error ? `Could not save theme setting: ${error.message}` : "Theme setting is missing. Run the site identity migration in Supabase first.";
    console.error("Theme availability could not be saved.", error || new Error("theme_enabled setting is missing"));
    return;
  }
  button.dataset.themeEnabled = String(enabled);
  button.dataset.isPublic = String(enabled);
  button.textContent = enabled ? "Enabled" : "Disabled";
  if (!enabled) {
    document.documentElement.removeAttribute("data-theme");
    themeToggle.hidden = true;
    try { localStorage.setItem("lnmiit-theme", "light"); } catch (storageError) { console.error("Light theme preference could not be saved.", storageError); }
  } else {
    themeToggle.hidden = false;
  }
  message.textContent = enabled ? "Light/Dark mode is enabled." : "Light/Dark mode is disabled. Everyone will use Light mode.";
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
  button.textContent = button.dataset.sectionKey === "auth"
    ? (data.is_public ? "Optional" : "Required")
    : (data.is_public ? "Public" : "Hidden");
  button.setAttribute("aria-pressed", String(data.is_public));
}

async function initializeAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return showLogin();
  const { data: profile, error } = await supabase.from("user_profiles").select("is_active").eq("id", session.user.id).maybeSingle();
  const isAdmin = session.user.app_metadata?.role === "admin";
  if (error || !isAdmin || (profile && profile.is_active !== true)) {
    await supabase.auth.signOut();
    return showLogin("This account is not authorized for the admin dashboard.");
  }
  showAdmin();
  createSectionNav();
  createUsersPanel();
  createSettingsPanel();
  createChatbotPanel();
  createOrderPanel();
  const visibilityPanel = byId("sectionVisibilityPanel") || createVisibilityPanel();
  createSurveyPanel();
  let savedSection = "traffic";
  try {
    const storedSection = localStorage.getItem("dayboard-admin-section");
    if (storedSection) savedSection = storedSection;
  } catch (error) {
    console.error("Admin section preference could not be read.", error);
  }
  setSection(savedSection);
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
  const redirectTo = new URL("admin.html", window.location.href).href;
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  if (error) {
    event.currentTarget.disabled = false;
    byId("adminMessage").textContent = error.message || "Google sign-in could not be started. Check that Google OAuth is enabled in Supabase.";
  }
});
byId("adminSignOut").addEventListener("click", () => supabase.auth.signOut());

initializeTheme();
initializeAdmin();
