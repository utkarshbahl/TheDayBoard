const API = "https://placement27.vercel.app/api";
const byId = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value ?? "â€”").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
let placements = [];

function formatLpa(value) { return value == null ? "â€”" : `â‚¹${Number(value).toLocaleString("en-IN")} LPA`; }
function formatStipend(value) { return value == null ? "â€”" : `â‚¹${Number(value).toLocaleString("en-IN")}/mo`; }

function renderStats(stats) {
  byId("placementStats").innerHTML = [
    ["STUDENTS PLACED", stats.studentsPlaced], ["PLACEMENT RATE", `${stats.placementPercentage}%`],
    ["UNIQUE COMPANIES", stats.totalUniqueCompanies], ["AVG. CTC SECURED", formatLpa(stats.averageCTCSecured)],
  ].map(([label, value]) => `<article class="placement-stat"><span>${label}</span><strong>${value ?? "â€”"}</strong></article>`).join("");
}

function renderPlacements() {
  const search = byId("placementSearch").value.trim().toLowerCase();
  const status = byId("placementStatus").value;
  const branch = byId("placementBranch").value;
  const visible = placements.filter((item) => (!search || `${item.companyName} ${item.role}`.toLowerCase().includes(search)) && (!status || item.status === status) && (!branch || item.eligibleBranches?.includes(branch)));
  const list = byId("placementList");
  if (!visible.length) { list.innerHTML = '<p class="placement-empty">No company records match those filters.</p>'; return; }
  list.innerHTML = visible.map((item) => `<article class="placement-record"><div class="placement-company"><strong>${escapeHtml(item.companyName)}</strong><span>${escapeHtml(item.role)}</span></div><div class="placement-field"><span>TYPE / BRANCHES</span><b>${escapeHtml(item.type)} Â· ${escapeHtml((item.eligibleBranches || []).join(", ") || "All")}</b></div><div class="placement-field"><span>CTC</span><b>${formatLpa(item.ctc)}</b></div><div class="placement-field"><span>STIPEND</span><b>${formatStipend(item.stipend)}</b></div><div><span class="placement-status ${item.status === "Completed" ? "is-completed" : ""}">${escapeHtml(item.status)}</span></div></article>`).join("");
}

async function loadPlacements() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const [statsResponse, placementsResponse] = await Promise.all([fetch(`${API}/statistics`, { signal: controller.signal }), fetch(`${API}/placements`, { signal: controller.signal })]);
    if (!statsResponse.ok || !placementsResponse.ok) throw new Error("The live tracker is unavailable.");
    const [statsPayload, placementsPayload] = await Promise.all([statsResponse.json(), placementsResponse.json()]);
    if (!statsPayload.success || !placementsPayload.success) throw new Error("The live tracker returned an invalid response.");
    placements = placementsPayload.data || [];
    renderStats(statsPayload.data);
    renderPlacements();
    byId("placementsUpdated").textContent = `Live data Â· ${placements.length} records Â· updated ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date())} IST`;
  } catch (error) {
    console.error("Placement data could not be loaded.", error);
    byId("placementStats").innerHTML = '<p class="placement-empty">Live placement statistics are temporarily unavailable.</p>';
    byId("placementList").innerHTML = '<p class="placement-empty">Could not load company records. Please try again shortly.</p>';
    byId("placementsUpdated").textContent = "Live tracker unavailable.";
  } finally { window.clearTimeout(timeout); }
}

["placementSearch", "placementStatus", "placementBranch"].forEach((id) => byId(id).addEventListener(id === "placementSearch" ? "input" : "change", renderPlacements));
loadPlacements();
