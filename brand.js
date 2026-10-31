import { supabase } from "./supabase.js";

const FALLBACK_NAME = "TheDayBoard";

const applyText = (selector, value, fallback) => {
  if (!value || value === fallback) return;
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
};

export const applySiteIdentity = ({ site_name } = {}) => {
  applyText("[data-site-name]", site_name, FALLBACK_NAME);
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
}

removeClubCredits();
loadSiteIdentity();
