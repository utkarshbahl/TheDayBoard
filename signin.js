import { supabase } from "./supabase.js";

const button = document.querySelector("#googleSignIn");
const message = document.querySelector("#signinMessage");
const sessionText = document.querySelector("#signinSession");
const signOut = document.querySelector("#signOut");
const themeToggle = document.querySelector(".theme-toggle");
const themeLabel = themeToggle?.querySelector("[data-theme-toggle-label]");

const themeKey = "lnmiit-theme";
const root = document.documentElement;
const requestedReturn = new URLSearchParams(window.location.search).get("return");
const returnPath = requestedReturn && requestedReturn.startsWith("/") && !requestedReturn.startsWith("//") ? requestedReturn : "/";
const AUTH_REDIRECT_ORIGIN = "https://thedayboard.vercel.app";
let currentTheme = "light";
try {
  const savedTheme = localStorage.getItem(themeKey);
  currentTheme = savedTheme === "dusk" || savedTheme === "light" ? savedTheme : "light";
} catch (error) {
  console.error("Theme preference could not be read.", error);
}

const applyTheme = (theme) => {
  currentTheme = theme;
  root.dataset.theme = theme;
  themeToggle?.setAttribute("aria-pressed", String(theme === "dusk"));
  if (themeLabel) themeLabel.textContent = theme === "dusk" ? "Dark" : "Light";
};

applyTheme(currentTheme);
themeToggle?.addEventListener("click", () => {
  const nextTheme = currentTheme === "dusk" ? "light" : "dusk";
  try {
    localStorage.setItem(themeKey, nextTheme);
  } catch (error) {
    console.error("Theme preference could not be saved.", error);
  }
  applyTheme(nextTheme);
});

const updateSession = (session) => {
  if (!session) {
    button.hidden = false;
    signOut.hidden = true;
    sessionText.hidden = true;
    return;
  }
  button.hidden = true;
  sessionText.hidden = false;
  signOut.hidden = false;
  sessionText.textContent = `Signed in as ${session.user.email || "your Google account"}.`;
};

const { data: { session } } = await supabase.auth.getSession();
updateSession(session);
supabase.auth.onAuthStateChange((_event, nextSession) => updateSession(nextSession));

if (window.location.hash.includes("access_token") || window.location.search.includes("code=")) {
  history.replaceState(null, "", window.location.pathname);
}

button?.addEventListener("click", async () => {
  button.disabled = true;
  message.textContent = "";
  const options = {};
  if (["http:", "https:"].includes(window.location.protocol)) {
    options.redirectTo = `${AUTH_REDIRECT_ORIGIN}${returnPath}`;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options,
  });
  if (error) {
    button.disabled = false;
    message.textContent = error.message || "Google sign-in could not be started.";
  }
});

signOut?.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    message.textContent = error.message || "Sign out could not be completed.";
    return;
  }
  button.hidden = false;
  signOut.hidden = true;
  sessionText.hidden = true;
});
