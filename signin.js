import { supabase } from "./supabase.js";

const button = document.querySelector("#googleSignIn");
const message = document.querySelector("#signinMessage");
const sessionText = document.querySelector("#signinSession");
const signOut = document.querySelector("#signOut");

const themeKey = "lnmiit-theme";
const root = document.documentElement;
const savedTheme = localStorage.getItem(themeKey);
if (savedTheme === "dusk") root.dataset.theme = "dusk";

const updateSession = (session) => {
  if (!session) return;
  button.hidden = true;
  sessionText.hidden = false;
  signOut.hidden = false;
  sessionText.textContent = `Signed in as ${session.user.email || "your Google account"}.`;
};

const { data: { session } } = await supabase.auth.getSession();
updateSession(session);
supabase.auth.onAuthStateChange((_event, nextSession) => updateSession(nextSession));

button?.addEventListener("click", async () => {
  button.disabled = true;
  message.textContent = "";
  const redirectTo = new URL("index.html", window.location.href).href;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
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
