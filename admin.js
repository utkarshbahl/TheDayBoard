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
  .user-management-row { display: flex; justify-content: space-between; align-items: center; gap: 15px; padding: 14px 0; border-top: 1px solid var(--line); font-size: 13px; }
  .user-management-row strong, .user-management-row span { display: block; }
  .user-management-row span { margin-top: 4px; color: var(--muted); font-size: 11px; }
  .user-management-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
  .user-management-actions button { padding: 8px 9px; border: 0; border-radius: 5px; background: var(--ink); color: #fff; font: 700 10px Manrope; cursor: pointer; }
  .user-management-actions button[data-user-action="delete"] { background: var(--red); }
  .user-management-message { min-height: 18px; margin-bottom: 0; color: var(--muted); }
  .admin-request-management { margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--line); }
  .admin-request-management h2 { margin: 0 0 8px; font-size: 18px; }
  .admin-request-management > p { color: var(--muted); font-size: 13px; line-height: 1.6; }
  .admin-request-row { display: flex; justify-content: space-between; align-items: center; gap: 15px; padding: 14px 0; border-top: 1px solid var(--line); font-size: 13px; }
  .admin-request-row strong, .admin-request-row span { display: block; }
  .admin-request-row span { margin-top: 4px; color: var(--muted); font-size: 11px; }
  .admin-request-actions { display: flex; gap: 6px; }
  .admin-request-actions button { padding: 8px 9px; border: 0; border-radius: 5px; background: var(--ink); color: #fff; font: 700 10px Manrope; cursor: pointer; }
  .admin-request-actions button[data-request-action="reject"] { background: var(--red); }
  .admin-request-message { min-height: 18px; margin-bottom: 0; color: var(--muted); }
  @media (max-width: 700px) { .user-management-row { align-items: flex-start; flex-direction: column; } .user-management-actions { justify-content: flex-start; } }
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
    <div class="user-management-list"></div>
    <p class="user-management-message" role="status"></p>
  `;
  byId("analyticsPanel").append(panel);
  return panel;
}

async function loadUsers(panel) {
  const { data, error } = await supabase.rpc("admin_list_user_profiles");
  if (error) throw error;
  const list = panel.querySelector(".user-management-list");
  list.replaceChildren(
    ...(data ?? []).map((user) => {
      const row = document.createElement("div");
      row.className = "user-management-row";
      row.innerHTML = `
        <div><strong></strong><span></span></div>
        <div class="user-management-actions">
          <button type="button" data-user-action="active"></button>
          <button type="button" data-user-action="reset">Reset password</button>
          <button type="button" data-user-action="delete">Delete</button>
        </div>
      `;
      row.querySelector("strong").textContent = user.full_name;
      row.querySelector("span").textContent = `${user.email} · ${new Date(user.created_at).toLocaleDateString()}`;
      const activeButton = row.querySelector('[data-user-action="active"]');
      activeButton.textContent = user.is_active ? "Disable" : "Enable";
      activeButton.dataset.userId = user.id;
      activeButton.dataset.active = String(user.is_active);
      row.querySelector('[data-user-action="reset"]').dataset.email = user.email;
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
    ({ error } = await supabase.rpc("admin_set_user_active", {
      target_user_id: button.dataset.userId,
      active: button.dataset.active !== "true",
    }));
  } else if (action === "delete") {
    if (!window.confirm("Delete this account permanently?")) {
      button.disabled = false;
      return;
    }
    ({ error } = await supabase.rpc("admin_delete_user", {
      target_user_id: button.dataset.userId,
    }));
  } else {
    ({ error } = await supabase.auth.resetPasswordForEmail(button.dataset.email, {
      redirectTo: `${location.origin}/admin.html`,
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
}

function createRequestsPanel() {
  const panel = document.createElement("section");
  panel.className = "admin-request-management";
  panel.id = "adminRequestPanel";
  panel.innerHTML = `
    <h2>Admin access requests</h2>
    <p>Approve or reject requests from registered users who want admin access.</p>
    <div class="admin-request-list"></div>
    <p class="admin-request-message" role="status"></p>
  `;
  byId("analyticsPanel").append(panel);
  return panel;
}

async function loadRequests(panel) {
  const { data, error } = await supabase.rpc("admin_list_access_requests");
  if (error) throw error;
  const list = panel.querySelector(".admin-request-list");
  list.replaceChildren(
    ...(data ?? []).map((request) => {
      const row = document.createElement("div");
      row.className = "admin-request-row";
      row.innerHTML = `
        <div><strong></strong><span></span></div>
        <div class="admin-request-actions">
          <button type="button" data-request-action="approve">Approve</button>
          <button type="button" data-request-action="reject">Reject</button>
        </div>
      `;
      row.querySelector("strong").textContent = request.full_name;
      row.querySelector("span").textContent =
        `${request.email} · ${request.status} · ${new Date(request.requested_at).toLocaleDateString()}`;
      row.querySelectorAll("[data-request-action]").forEach((button) => {
        button.dataset.requestId = request.id;
        button.disabled = request.status !== "pending";
      });
      return row;
    }),
  );
}

async function reviewRequest(panel, button) {
  button.disabled = true;
  const { error } = await supabase.rpc("admin_review_access_request", {
    request_id: button.dataset.requestId,
    approve: button.dataset.requestAction === "approve",
  });
  if (error) {
    button.disabled = false;
    panel.querySelector(".admin-request-message").textContent =
      "That access request could not be reviewed.";
    console.error("Admin access request review failed.", error);
    return;
  }
  panel.querySelector(".admin-request-message").textContent = "Access request updated.";
  await loadRequests(panel);
}

function bindRequestsPanel(panel) {
  if (panel.dataset.bound === "true") return;
  panel.dataset.bound = "true";
  panel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-request-action]");
    if (button) reviewRequest(panel, button);
  });
}

async function initializeAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return showLogin();
  if (session.user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return showLogin("This account is not an admin account.");
  }

  showAdmin();
  const panel = createVisibilityPanel();
  bindVisibilityPanel(panel);
  const usersPanel = byId("userManagementPanel") || createUsersPanel();
  bindUsersPanel(usersPanel);
  const requestsPanel = byId("adminRequestPanel") || createRequestsPanel();
  bindRequestsPanel(requestsPanel);
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
    await loadRequests(requestsPanel);
  } catch (error) {
    requestsPanel.querySelector(".admin-request-message").textContent =
      "Admin access requests could not be loaded. Run the admin access migration.";
    console.error("Admin access requests could not be loaded.", error);
  }
}

function initialize() {
  return initializeAdmin();
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
