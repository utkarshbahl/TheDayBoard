import { supabase } from "./supabase.js";

const byId = (id) => document.getElementById(id);
const pageNames = { "/": "Laundry status", "/mess-menu": "Mess menu", "/bus-timings": "Bus timings", "/campus-map": "Campus map", "/curriculum": "B.Tech curriculum" };
const sections = [["laundry", "Laundry status"], ["mess", "Mess menu"], ["bus", "Bus timings"], ["curriculum", "B.Tech curriculum"], ["campus-map", "Campus map"]];

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

function renderVisibilityRows(rows) {
  const visibility = new Map(rows.map((row) => [row.section_key, row.is_public]));
  byId("sectionVisibilityList").replaceChildren(...sections.map(([key, label]) => {
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
  }));
}

async function loadVisibility() {
  const { data, error } = await supabase.from("site_section_visibility").select("section_key, is_public").order("section_key");
  if (error) throw error;
  renderVisibilityRows(data ?? []);
}

async function updateVisibility(button) {
  const isPublic = button.dataset.isPublic !== "true";
  button.disabled = true;
  const { data, error } = await supabase.from("site_section_visibility").update({ is_public: isPublic }).eq("section_key", button.dataset.sectionKey).select("section_key, is_public").maybeSingle();
  button.disabled = false;
  if (error || !data) {
    byId("sectionVisibilityMessage").textContent = "Could not save that visibility change. Run the simplified Supabase migration.";
    console.error("Section visibility could not be updated.", error ?? "No row was updated.");
    return;
  }
  button.dataset.isPublic = String(data.is_public);
  button.textContent = data.is_public ? "Public" : "Hidden";
  button.setAttribute("aria-pressed", String(data.is_public));
  byId("sectionVisibilityMessage").textContent = `${button.closest(".section-visibility-row").querySelector("strong").textContent} is now ${data.is_public ? "public" : "hidden"}.`;
}

byId("sectionVisibilityList").addEventListener("click", (event) => {
  const button = event.target.closest(".visibility-toggle");
  if (button) updateVisibility(button);
});

Promise.all([loadAnalytics(), loadVisibility()]).catch((error) => {
  byId("adminMessage").textContent = "Some dashboard data could not be loaded. Run the simplified Supabase migration.";
  console.error("Dashboard data could not be loaded.", error);
});
