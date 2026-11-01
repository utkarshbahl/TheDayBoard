import { supabase } from "./supabase.js";

const FALLBACK_NAME = "TheDayBoard";
const ANNOUNCEMENT_DISMISS_KEY = "dayboard-announcement-dismissed";

const applyText = (selector, value, fallback) => {
  if (!value || value === fallback) return;
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
};

export const applySiteIdentity = ({ site_name } = {}) => {
  applyText("[data-site-name]", site_name, FALLBACK_NAME);
};

const announcementStyle = document.createElement("style");
announcementStyle.textContent = `.site-announcement{display:flex;align-items:flex-start;gap:14px;max-width:1116px;margin:14px auto 0;padding:13px 16px;border:1px solid var(--accent);border-radius:8px;background:var(--surface);color:var(--ink);font-size:13px;line-height:1.5}.site-announcement.is-important{background:var(--accent)}.site-announcement strong{display:block;margin-bottom:2px;font-size:10px;letter-spacing:1px;text-transform:uppercase}.site-announcement p{margin:0;flex:1}.site-announcement button{border:0;background:transparent;color:inherit;font:800 18px/1 Manrope;cursor:pointer;padding:0 2px}@media(max-width:700px){.site-announcement{margin:10px 21px 0}}`;
document.head.append(announcementStyle);

const showAnnouncement = ({ announcement_text, announcement_visible, announcement_important } = {}) => {
  const text = String(announcement_text || "").trim();
  if (!text || announcement_visible !== "true") return;
  try {
    if (localStorage.getItem(ANNOUNCEMENT_DISMISS_KEY) === text) return;
  } catch (error) {
    console.error("Announcement preference could not be read.", error);
  }
  const banner = document.createElement("aside");
  banner.className = `site-announcement${announcement_important === "true" ? " is-important" : ""}`;
  banner.setAttribute("role", "status");
  banner.innerHTML = `<p><strong>${announcement_important === "true" ? "Important update" : "Campus update"}</strong>${text.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character])}</p><button type="button" aria-label="Dismiss announcement">&times;</button>`;
  banner.querySelector("button").addEventListener("click", () => {
    try { localStorage.setItem(ANNOUNCEMENT_DISMISS_KEY, text); } catch (error) { console.error("Announcement preference could not be saved.", error); }
    banner.remove();
  });
  document.querySelector("main")?.prepend(banner);
};

const removeClubCredits = () => {
  document.querySelectorAll("[data-site-credit]").forEach((element) => element.remove());
  document.querySelectorAll(".about-creator").forEach((element) => element.remove());
  document.querySelectorAll(".about-copy h1").forEach((element) => {
    element.textContent = "TheDayBoard for an easier campus day.";
  });
  document.title = document.title.replace(/\s*\|\s*Ethers Club/gi, "");
  document.querySelectorAll('meta[name="description"]').forEach((element) => {
    element.content = element.content
      .replace(/by Ethers Club/gi, "")
      .replace(/the Ethers Club team behind/gi, "the team behind");
  });
};

export async function loadSiteIdentity() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");
  if (error) {
    console.warn(
      "Site identity could not be loaded, showing the default name.",
      error.message,
    );
    return;
  }
  const identity = Object.fromEntries(
    (data ?? []).map((row) => [row.key, row.value]),
  );
  applySiteIdentity(identity);
  showAnnouncement(identity);
}

removeClubCredits();
loadSiteIdentity();
