import { supabase } from "./supabase.js";

const FALLBACK_NAME = "TheDayBoard";
const FALLBACK_CREDIT = "by Ethers Club";

const applyText = (selector, value, fallback) => {
  if (!value || value === fallback) return;
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
};

export const applySiteIdentity = ({ site_name, site_credit } = {}) => {
  applyText("[data-site-name]", site_name, FALLBACK_NAME);
  applyText("[data-site-credit]", site_credit, FALLBACK_CREDIT);
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

loadSiteIdentity();
