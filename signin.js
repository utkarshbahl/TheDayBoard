import { supabase } from "./supabase.js";

const button = document.querySelector("#googleSignIn");
const message = document.querySelector("#signinMessage");

const themeKey = "lnmiit-theme";
const root = document.documentElement;
const savedTheme = localStorage.getItem(themeKey);
if (savedTheme === "dusk") root.dataset.theme = "dusk";

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
