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
  byId("noticeAdminPanel").classList.add("hidden");
  byId("adminMessage").textContent = message;
}

function showAdmin() {
  byId("adminLogin").classList.add("hidden");
  byId("analyticsPanel").classList.remove("hidden");
  byId("noticeAdminPanel").classList.remove("hidden");
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

async function loadAdminNotices() {
  const { data, error } = await supabase
    .from("campus_notices")
    .select("id,title,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const list = byId("adminNoticeList");
  list.replaceChildren(
    ...(data ?? []).map((notice) => {
      const row = document.createElement("div");
      row.className = "admin-notice-row";
      const title = document.createElement("span");
      title.textContent = notice.title;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Delete";
      button.addEventListener("click", () => deleteNotice(notice.id));
      row.append(title, button);
      return row;
    }),
  );
}

async function deleteNotice(id) {
  if (!window.confirm("Delete this notice?")) return;
  const { error } = await supabase.from("campus_notices").delete().eq("id", id);
  if (error) {
    byId("noticeMessage").textContent = "This notice could not be deleted.";
    return;
  }
  loadAdminNotices();
}

async function publishNotice(event) {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  byId("noticeMessage").textContent = "";
  try {
    const image = byId("noticeImage").files[0];
    let imageUrl = null;
    if (image) {
      const extension = image.name.split(".").pop().toLowerCase();
      const path = `${crypto.randomUUID()}.${extension}`;
      const upload = await supabase.storage.from("notice-images").upload(path, image, {
        contentType: image.type,
        upsert: false,
      });
      if (upload.error) throw upload.error;
      imageUrl = supabase.storage.from("notice-images").getPublicUrl(path).data.publicUrl;
    }

    const toIso = (id) => (byId(id).value ? new Date(byId(id).value).toISOString() : null);
    const { error } = await supabase.from("campus_notices").insert({
      title: byId("noticeTitle").value.trim(),
      body: byId("noticeBody").value.trim(),
      image_url: imageUrl,
      event_at: toIso("noticeEvent"),
      expires_at: toIso("noticeExpiry"),
    });
    if (error) throw error;
    event.target.reset();
    byId("noticeMessage").textContent = "Notice published.";
    loadAdminNotices();
  } catch (error) {
    console.error("Notice could not be published.", error);
    byId("noticeMessage").textContent = "The notice could not be published.";
  } finally {
    button.disabled = false;
  }
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
    await Promise.all([loadAnalytics(), loadAdminNotices()]);
  } catch {
    byId("noticeMessage").textContent = "Admin data could not be loaded.";
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

byId("noticeForm").addEventListener("submit", publishNotice);
byId("adminSignOut").addEventListener("click", async () => {
  await supabase.auth.signOut();
  showLogin();
});
initialize();
