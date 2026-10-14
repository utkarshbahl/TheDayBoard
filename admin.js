import { supabase } from "./supabase.js";

const byId = (id) => document.getElementById(id);
const pageNames = {
  "/": "Laundry status",
  "/mess-menu": "Mess menu",
  "/bus-timings": "Bus timings",
  "/campus-map": "Campus map",
  "/curriculum": "B.Tech curriculum",
};

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

async function initialize() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return showLogin();
  if (session.user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return showLogin("This account is not an admin account.");
  }
  showAdmin();
  try {
    await loadAnalytics();
  } catch (error) {
    console.error("Admin data could not be loaded.", error);
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
  initialize();
});

byId("adminSignOut").addEventListener("click", async () => {
  await supabase.auth.signOut();
  showLogin();
});
initialize();
