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
const adminStyle = document.createElement("style");
adminStyle.textContent = `
  .user-management { margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--line); }
  .user-management h2 { margin: 0 0 8px; font-size: 18px; }
  .user-management > p { color: var(--muted); font-size: 13px; line-height: 1.6; }
  .user-management-toolbar { display: flex; gap: 8px; margin: 16px 0; }
  .user-management-toolbar input, .user-management-toolbar select { min-width: 0; flex: 1; padding: 10px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); color: var(--ink); font: 12px Manrope; }
  .user-management-toolbar select { flex: 0 1 150px; }
  .user-management-summary { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; color: var(--muted); font: 11px "DM Mono", monospace; }
  .account-badge { display: inline-block; margin-left: 6px; padding: 3px 6px; border-radius: 999px; background: var(--lime); color: var(--ink); font: 700 9px Manrope; }
  .account-badge.is-disabled { background: var(--red); color: #fff; }
  .user-management-row { display: flex; justify-content: space-between; align-items: center; gap: 15px; padding: 14px 0; border-top: 1px solid var(--line); font-size: 13px; }
  .user-management-row strong, .user-management-row span { display: block; }
  .user-management-row span { margin-top: 4px; color: var(--muted); font-size: 11px; }
  .user-management-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
  .user-management-actions button { padding: 8px 9px; border: 0; border-radius: 5px; background: var(--ink); color: #fff; font: 700 10px Manrope; cursor: pointer; }
  .user-management-actions button[data-user-action="delete"] { background: var(--red); }
  .user-management-message { min-height: 18px; margin-bottom: 0; color: var(--muted); }
  .admin-list { margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--line); }
  .admin-list h2 { margin: 0 0 8px; font-size: 18px; }
  .admin-list > p { color: var(--muted); font-size: 13px; line-height: 1.6; }
  .admin-list-row { display: flex; justify-content: space-between; gap: 15px; padding: 14px 0; border-top: 1px solid var(--line); font-size: 13px; }
  .admin-list-row span { display: block; margin-top: 4px; color: var(--muted); font-size: 11px; }
  .admin-list-message { min-height: 18px; margin-bottom: 0; color: var(--muted); }
  .audit-log { margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--line); }
  .audit-log h2 { margin: 0 0 8px; font-size: 18px; }
  .audit-log-items { max-height: 300px; overflow: auto; }
  .audit-log-row { padding: 11px 0; border-top: 1px solid var(--line); color: var(--muted); font-size: 11px; }
  .audit-log-row strong { color: var(--ink); }
  .audit-log-message { min-height: 18px; color: var(--muted); }
  .admin-section-nav { display: flex; gap: 8px; max-width: 760px; margin: 0 auto 18px; }
  .admin-section-nav button, .admin-section-select { padding: 10px 13px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); color: var(--ink); font: 700 12px Manrope; cursor: pointer; }
  .admin-section-nav button.is-active { background: var(--ink); color: #fff; border-color: var(--ink); }
  .admin-section-select { display: none; width: 100%; }
  .is-admin-section-hidden { display: none; }
  @media (max-width: 700px) { .user-management-row { align-items: flex-start; flex-direction: column; } .user-management-actions { justify-content: flex-start; } }
  @media (max-width: 700px) { .admin-section-nav { display: block; } .admin-section-nav button { display: none; } .admin-section-select { display: block; } }
`;
document.head.append(adminStyle);

function initializeTheme() {
  if (!themeToggle || !themeLabel) return;

  let theme = "lime";
  try {
    theme = localStorage.getItem("lnmiit-theme") || "lime";
  } catch (error) {
    console.error("Theme preference could not be read.", error);
  }

  const applyTheme = (nextTheme) => {
    if (nextTheme === "dusk") {
      themeRoot.setAttribute("data-theme", "dusk");
    } else {
      themeRoot.removeAttribute("data-theme");
    }
    themeToggle.setAttribute("aria-pressed", String(nextTheme === "dusk"));
    themeToggle.setAttribute(
      "aria-label",
      `Switch to ${nextTheme === "dusk" ? "lime" : "dusk"} colour scheme`,
    );
    themeLabel.textContent = nextTheme === "dusk" ? "Dusk" : "Lime";
  };

  applyTheme(theme === "dusk" ? "dusk" : "lime");
  themeToggle.addEventListener("click", () => {
    const nextTheme =
      themeRoot.getAttribute("data-theme") === "dusk" ? "lime" : "dusk";
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
  byId("adminSectionNav")?.classList.add("hidden");
  byId("adminMessage").textContent = message;
}

function showAdmin() {
  byId("adminLogin").classList.add("hidden");
  byId("analyticsPanel").classList.remove("hidden");
  byId("adminSectionNav")?.classList.remove("hidden");
}

function createAdminSectionNav() {
  const existing = byId("adminSectionNav");
  if (existing) return existing;
  const nav = document.createElement("nav");
  nav.className = "admin-section-nav";
  nav.id = "adminSectionNav";
  nav.setAttribute("aria-label", "Admin sections");
  nav.innerHTML = `
    <button type="button" data-admin-section-target="traffic" class="is-active">Traffic</button>
    <button type="button" data-admin-section-target="visibility">Hide tabs</button>
    <button type="button" data-admin-section-target="users">Users</button>
    <select class="admin-section-select" aria-label="Admin section">
      <option value="traffic">Traffic</option>
      <option value="visibility">Hide tabs</option>
      <option value="users">Users</option>
    </select>
  `;
  byId("analyticsPanel").before(nav);
  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-admin-section-target]");
    if (button) setAdminSection(button.dataset.adminSectionTarget);
  });
  nav.querySelector("select").addEventListener("change", (event) => {
    setAdminSection(event.target.value);
  });
  return nav;
}

function setAdminSection(section) {
  const trafficElements = [
    ".analytics-topline",
    ".analytics-subtitle",
    ".traffic-stats",
    ".traffic-breakdown",
  ];
  trafficElements.forEach((selector) => {
    document.querySelector(selector)?.classList.toggle(
      "is-admin-section-hidden",
      section !== "traffic",
    );
  });
  document.querySelector("#sectionVisibilityPanel")?.classList.toggle(
    "is-admin-section-hidden",
    section !== "visibility",
  );
  document.querySelector("#userManagementPanel")?.classList.toggle(
    "is-admin-section-hidden",
    section !== "users",
  );
  document.querySelector("#adminListPanel")?.classList.toggle(
    "is-admin-section-hidden",
    section !== "users",
  );
  document.querySelectorAll("[data-admin-section-target]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.adminSectionTarget === section);
  });
  const select = document.querySelector(".admin-section-select");
  if (select) select.value = section;
  if (section === "users") {
    const adminsPanel = byId("adminListPanel");
    if (adminsPanel) {
      loadAdmins(adminsPanel).catch((error) => {
        adminsPanel.querySelector(".admin-list-message").textContent =
          "Current admins could not be refreshed.";
        console.error("Current admins could not be refreshed.", error);
      });
    }
  }
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
  const existingPanel = byId("sectionVisibilityPanel");
  if (existingPanel) return existingPanel;

  const panel = document.createElement("section");
  panel.className = "section-visibility";
  panel.id = "sectionVisibilityPanel";
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
  const { data, error } = await supabase
    .from("site_section_visibility")
    .update({ is_public: isPublic })
    .eq("section_key", button.dataset.sectionKey)
    .select("section_key, is_public")
    .maybeSingle();
  button.disabled = false;
  if (error || !data) {
    panel.querySelector(".section-visibility-message").textContent =
      error?.code === "42P01"
        ? "Visibility settings are not set up yet. Run the section visibility migration in Supabase."
        : "Could not save that visibility change. Check the Supabase migration and admin permissions.";
    console.error("Section visibility could not be updated.", error ?? "No row was updated.");
    return;
  }
  button.dataset.isPublic = String(data.is_public);
  button.textContent = data.is_public ? "Public" : "Hidden";
  button.setAttribute("aria-pressed", String(data.is_public));
  panel.querySelector(".section-visibility-message").textContent =
    `${button.closest(".section-visibility-row").querySelector("strong").textContent} is now ${
      data.is_public ? "public" : "hidden"
    }.`;
}

function bindVisibilityPanel(panel) {
  if (panel.dataset.bound === "true") return;
  panel.dataset.bound = "true";
  panel.addEventListener("click", (event) => {
    const button = event.target.closest(".visibility-toggle");
    if (button) updateVisibility(panel, button);
  });
}

function createUsersPanel() {
  const panel = document.createElement("section");
  panel.className = "user-management";
  panel.id = "userManagementPanel";
  panel.innerHTML = `
    <h2>User accounts</h2>
    <p>View and manage registered campus accounts.</p>
    <div class="user-management-toolbar">
      <input type="search" class="user-search" placeholder="Search name or email" aria-label="Search user accounts">
      <select class="user-filter" aria-label="Filter user accounts">
        <option value="all">All accounts</option><option value="active">Active</option>
        <option value="disabled">Disabled</option><option value="admins">Admins</option>
      </select>
    </div>
    <div class="user-management-summary" aria-live="polite"></div>
    <div class="user-management-list"></div>
    <p class="user-management-message" role="status"></p>
  `;
  byId("analyticsPanel").append(panel);
  return panel;
}

async function loadUsers(panel) {
  const { data, error } = await supabase.rpc("admin_list_user_profiles");
  if (error) throw error;
  panel.userData = data ?? [];
  renderUsers(panel);
}

function renderUsers(panel) {
  const search = panel.querySelector(".user-search").value.trim().toLowerCase();
  const filter = panel.querySelector(".user-filter").value;
  const users = panel.userData.filter((user) => {
    const matchesSearch = !search || `${user.full_name} ${user.email}`.toLowerCase().includes(search);
    const matchesFilter =
      filter === "all" || (filter === "active" && user.is_active) ||
      (filter === "disabled" && !user.is_active) || (filter === "admins" && user.is_admin);
    return matchesSearch && matchesFilter;
  });
  const total = panel.userData.length;
  panel.querySelector(".user-management-summary").textContent =
    `${total} total · ${panel.userData.filter((user) => user.is_active).length} active · ` +
    `${panel.userData.filter((user) => !user.is_active).length} disabled · ` +
    `${panel.userData.filter((user) => user.is_admin).length} admins`;
  const list = panel.querySelector(".user-management-list");
  list.replaceChildren(
    ...users.map((user) => {
      const row = document.createElement("div");
      row.className = "user-management-row";
      row.innerHTML = `
        <div><strong></strong><span></span></div>
        <div class="user-management-actions">
          <button type="button" data-user-action="active"></button>
          <button type="button" data-user-action="reset">Reset password</button>
          <button type="button" data-user-action="signin">Open sign-in</button>
          <button type="button" data-user-action="delete">Delete</button>
        </div>
      `;
      row.querySelector("strong").textContent = user.full_name;
      if (user.is_admin || !user.is_active) {
        const badge = document.createElement("span");
        badge.className = `account-badge${user.is_active ? "" : " is-disabled"}`;
        badge.textContent = user.is_active ? "Admin" : "Disabled";
        row.querySelector("strong").append(badge);
      }
      row.querySelector("span").textContent =
        `${user.email} · Created ${new Date(user.created_at).toLocaleDateString()} · ` +
        `Last sign-in ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "never"}`;
      const activeButton = row.querySelector('[data-user-action="active"]');
      activeButton.textContent = user.is_active ? "Hide login" : "Show login";
      activeButton.dataset.userId = user.id;
      activeButton.dataset.active = String(user.is_active);
      row.querySelector('[data-user-action="reset"]').dataset.email = user.email;
      row.querySelector('[data-user-action="signin"]').dataset.email = user.email;
      row.querySelector('[data-user-action="delete"]').dataset.userId = user.id;
      return row;
    }),
  );
}

async function manageUser(panel, button) {
  const action = button.dataset.userAction;
  button.disabled = true;
  let error;
  if (action === "active") {
    if (!window.confirm(`${button.dataset.active === "true" ? "Hide" : "Show"} this login?`)) {
      button.disabled = false;
      return;
    }
    ({ error } = await supabase.rpc("admin_set_user_active", {
      target_user_id: button.dataset.userId,
      active: button.dataset.active !== "true",
    }));
  } else if (action === "reset") {
    if (!window.confirm(`Send a password reset email to ${button.dataset.email}?`)) {
      button.disabled = false;
      return;
    }
    ({ error } = await supabase.auth.resetPasswordForEmail(button.dataset.email, {
      redirectTo: `${location.origin}/admin.html`,
    }));
  } else if (action === "signin") {
    window.open(
      `${location.origin}/index.html?email=${encodeURIComponent(button.dataset.email)}#account`,
      "_blank",
      "noopener,noreferrer",
    );
    button.disabled = false;
    return;
  } else if (action === "delete") {
    if (!window.confirm(`Delete ${button.closest(".user-management-row").querySelector("strong").firstChild.textContent} permanently?`)) {
      button.disabled = false;
      return;
    }
    ({ error } = await supabase.rpc("admin_delete_user", {
      target_user_id: button.dataset.userId,
    }));
  }
  button.disabled = false;
  if (error) {
    panel.querySelector(".user-management-message").textContent =
      "That account action could not be completed.";
    console.error("User account action failed.", error);
    return;
  }
  panel.querySelector(".user-management-message").textContent =
    action === "reset" ? "Password reset email sent." : "Account updated.";
  await loadUsers(panel);
}

function bindUsersPanel(panel) {
  if (panel.dataset.bound === "true") return;
  panel.dataset.bound = "true";
  panel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-user-action]");
    if (button) manageUser(panel, button);
  });
  panel.querySelector(".user-search").addEventListener("input", () => renderUsers(panel));
  panel.querySelector(".user-filter").addEventListener("change", () => renderUsers(panel));
}

function createAdminsPanel() {
  const panel = document.createElement("section");
  panel.className = "admin-list";
  panel.id = "adminListPanel";
  panel.innerHTML = `
    <h2>Current admins</h2>
    <p>Accounts that currently have administrator access.</p>
    <div class="admin-list-items"></div>
    <p class="admin-list-message" role="status"></p>
  `;
  byId("analyticsPanel").append(panel);
  return panel;
}

async function loadAdmins(panel) {
  const { data, error } = await supabase.rpc("admin_list_admins");
  if (error) throw error;
  panel.querySelector(".admin-list-items").replaceChildren(
    ...(data ?? []).map((admin) => {
      const row = document.createElement("div");
      row.className = "admin-list-row";
      row.innerHTML = "<div><strong></strong><span></span></div>";
      row.querySelector("strong").textContent = admin.full_name;
      row.querySelector("span").textContent =
        `${admin.email} · Admin since ${new Date(admin.created_at).toLocaleDateString()}`;
      return row;
    }),
  );
}

function createAuditPanel() {
  const panel = document.createElement("section");
  panel.className = "audit-log";
  panel.id = "auditLogPanel";
  panel.innerHTML = `
    <h2>Account activity</h2>
    <p>Recent administrative account actions.</p>
    <div class="audit-log-items"></div>
    <p class="audit-log-message" role="status"></p>
  `;
  byId("analyticsPanel").append(panel);
  return panel;
}

async function loadAudit(panel) {
  const { data, error } = await supabase.rpc("admin_list_account_audit");
  if (error) throw error;
  panel.querySelector(".audit-log-items").replaceChildren(
    ...(data ?? []).map((entry) => {
      const row = document.createElement("div");
      row.className = "audit-log-row";
      const target = entry.target_email || "deleted account";
      row.innerHTML = "<strong></strong><span></span>";
      row.querySelector("strong").textContent = entry.action.replaceAll("_", " ");
      row.querySelector("span").textContent =
        ` · ${target} · ${new Date(entry.created_at).toLocaleString()}`;
      return row;
    }),
  );
}

async function initializeAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return showLogin();
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("is_active")
    .eq("id", session.user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Admin profile could not be checked.", profileError);
    return showLogin("Your account could not be verified.");
  }
  if (profile?.is_active !== true) {
    await supabase.auth.signOut();
    return showLogin("This account has been disabled.");
  }
  if (session.user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return showLogin("This account is not an admin account.");
  }

  showAdmin();
  createAdminSectionNav();
  const panel = createVisibilityPanel();
  bindVisibilityPanel(panel);
  const usersPanel = byId("userManagementPanel") || createUsersPanel();
  bindUsersPanel(usersPanel);
  const adminsPanel = byId("adminListPanel") || createAdminsPanel();
  const auditPanel = byId("auditLogPanel") || createAuditPanel();
  setAdminSection("traffic");
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
  try {
    await loadUsers(usersPanel);
  } catch (error) {
    usersPanel.querySelector(".user-management-message").textContent =
      "User accounts could not be loaded.";
    console.error("User accounts could not be loaded.", error);
  }
  try {
    await loadAdmins(adminsPanel);
  } catch (error) {
    adminsPanel.querySelector(".admin-list-message").textContent =
      "Current admins could not be loaded. Run the updated admin access migration.";
    console.error("Current admins could not be loaded.", error);
  }
  try {
    await loadAudit(auditPanel);
  } catch (error) {
    auditPanel.querySelector(".audit-log-message").textContent =
      "Account activity could not be loaded. Run the updated user accounts migration.";
    console.error("Account activity could not be loaded.", error);
  }
}

function initialize() {
  return initializeAdmin();
}

let adminInitialization;
function initializePersistedAdminSession() {
  if (!adminInitialization) {
    adminInitialization = initializeAdmin().finally(() => {
      adminInitialization = null;
    });
  }
  return adminInitialization;
}

supabase.auth.onAuthStateChange((event, session) => {
  if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
    initializePersistedAdminSession();
  } else if (!session && event === "SIGNED_OUT") {
    showLogin();
  }
});

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
  initializePersistedAdminSession();
});

byId("adminGoogleLogin").addEventListener("click", async (event) => {
  event.currentTarget.disabled = true;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${location.origin}/admin.html` },
  });
  if (error) {
    event.currentTarget.disabled = false;
    byId("adminMessage").textContent = "Google sign-in could not be started.";
    console.error("Admin Google sign-in failed.", error);
  }
});

byId("adminSignOut").addEventListener("click", async () => {
  await supabase.auth.signOut();
  showLogin();
});

initializePersistedAdminSession();
