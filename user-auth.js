import { supabase } from "./supabase.js";

const style = document.createElement("style");
style.textContent = `
  .user-auth-button { display: inline-grid; place-items: center; width: 34px; height: 34px; margin-left: 10px; padding: 0; border: 2px solid var(--ink); border-radius: 50%; background: var(--surface); color: var(--ink); cursor: pointer; transition: background-color .18s,color .18s,border-color .18s; }
  .user-auth-button:hover, .user-auth-button:focus-visible { border-color: var(--lime); background: var(--lime); }
  .user-auth-button:focus-visible { outline: 2px solid var(--lime); outline-offset: 3px; }
  .user-auth-button svg { width: 21px; height: 21px; }
  .user-auth-menu { position: relative; margin-left: 10px; }
  .user-auth-dropdown { position: absolute; top: calc(100% + 10px); right: 0; z-index: 40; min-width: 190px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: var(--paper); box-shadow: 5px 6px 0 var(--lime); }
  .user-auth-dropdown p { margin: 0; color: var(--ink); font-size: 13px; white-space: nowrap; }
  .user-auth-signout { margin-top: 12px; padding: 0; border: 0; background: none; color: var(--muted); font: 600 11px Manrope; text-decoration: underline; cursor: pointer; }
  .user-auth-dialog { border: 0; border-radius: 12px; padding: 0; color: var(--ink); background: transparent; }
  .user-auth-dialog::backdrop { background: rgba(20, 40, 31, .58); }
  .user-auth-card { position: relative; width: min(420px, calc(100vw - 42px)); padding: 30px; border-radius: 12px; background: var(--paper); box-shadow: 8px 9px 0 var(--lime); }
  .user-auth-card h2 { margin: 0 0 24px; font-size: 28px; letter-spacing: -1.3px; }
  .user-auth-greeting { margin: -10px 0 20px; color: var(--muted); font-size: 14px; }
  .user-auth-close { position: absolute; top: 14px; right: 16px; border: 0; background: none; color: var(--muted); font-size: 24px; cursor: pointer; }
  .user-auth-card label { display: block; margin-top: 14px; font-size: 12px; font-weight: 800; }
  .user-auth-card input { display: block; width: 100%; margin-top: 7px; padding: 12px; border: 1px solid var(--line); border-radius: 5px; font: 14px Manrope; }
  .user-auth-tabs { display: flex; gap: 18px; border-bottom: 1px solid var(--line); }
  .user-auth-tab { padding: 0 0 9px; border: 0; border-bottom: 2px solid transparent; background: none; color: var(--muted); font: 700 12px Manrope; cursor: pointer; }
  .user-auth-tab.is-active { border-color: var(--ink); color: var(--ink); }
  .user-auth-submit { width: 100%; margin-top: 18px; padding: 13px; border: 0; border-radius: 5px; background: var(--ink); color: #fff; font: 800 14px Manrope; cursor: pointer; }
  .user-auth-message { min-height: 18px; margin: 10px 0 0; color: var(--red); font-size: 12px; line-height: 1.4; }
  .is-hidden { display: none !important; }
  @media (max-width: 600px) { .user-auth-menu { margin-left: 7px; } .user-auth-button { width: 32px; height: 32px; margin-left: 0; } }
`;
document.head.append(style);

const authButton = document.createElement("button");
authButton.className = "user-auth-button";
authButton.type = "button";
authButton.setAttribute("aria-label", "Open account login");
authButton.innerHTML = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="12" cy="8" r="3.5"></circle>
    <path d="M5 20c.8-3.7 3.1-5.7 7-5.7s6.2 2 7 5.7"></path>
  </svg>
`;
const authMenu = document.createElement("div");
authMenu.className = "user-auth-menu";
authMenu.innerHTML = `
  <div class="user-auth-dropdown" hidden>
    <p class="user-auth-dropdown-greeting"></p>
    <button type="button" class="user-auth-signout">Sign out</button>
  </div>
`;
authMenu.prepend(authButton);
document.querySelector(".nav-actions")?.append(authMenu);

const dialog = document.createElement("dialog");
dialog.className = "user-auth-dialog";
dialog.id = "account";
dialog.innerHTML = `
  <form method="dialog" class="user-auth-card">
    <button class="user-auth-close" value="cancel" aria-label="Close account dialog">×</button>
    <p class="section-kicker">CAMPUS ACCOUNT</p>
    <h2>Welcome to LNMIIT Campus</h2>
    <p class="user-auth-greeting is-hidden"></p>
    <div class="user-auth-tabs">
      <button type="button" class="user-auth-tab is-active" data-auth-mode="login">Log in</button>
      <button type="button" class="user-auth-tab" data-auth-mode="signup">Create account</button>
    </div>
    <label class="user-auth-name is-hidden">Name<input type="text" name="name" autocomplete="name"></label>
    <label>Email<input type="email" name="email" autocomplete="email" required></label>
    <label>Password<input type="password" name="password" autocomplete="current-password" minlength="6" required></label>
    <p class="user-auth-message" role="status"></p>
    <button type="submit" class="user-auth-submit">Log in</button>
  </form>
`;
document.body.append(dialog);

const form = dialog.querySelector(".user-auth-card");
const nameField = dialog.querySelector(".user-auth-name");
const message = dialog.querySelector(".user-auth-message");
let mode = "login";

function setMode(nextMode) {
  mode = nextMode;
  nameField.classList.toggle("is-hidden", mode !== "signup");
  nameField.querySelector("input").required = mode === "signup";
  dialog.querySelector(".user-auth-submit").textContent =
    mode === "signup" ? "Create account" : "Log in";
  dialog.querySelectorAll("[data-auth-mode]").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.authMode === mode);
  });
  message.textContent = "";
}

function greeting(name) {
  const hour = new Date().getHours();
  const salutation = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${salutation}, ${name}`;
}

function showLoggedIn(user) {
  const name = user.user_metadata?.full_name || "there";
  authButton.setAttribute("aria-label", `Open account for ${name}`);
  authMenu.dataset.loggedIn = "true";
  authMenu.querySelector(".user-auth-dropdown-greeting").textContent = greeting(name);
  const greetingElement = dialog.querySelector(".user-auth-greeting");
  greetingElement.textContent = greeting(name);
  greetingElement.classList.remove("is-hidden");
}

async function loadSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (data.session) {
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("is_active")
      .eq("id", data.session.user.id)
      .maybeSingle();
    if (profileError) {
      console.error("User profile could not be loaded.", profileError);
    }
    if (profile?.is_active === false) {
      await supabase.auth.signOut();
      return;
    }
    showLoggedIn(data.session.user);
  }
}

authButton.addEventListener("click", () => {
  const dropdown = authMenu.querySelector(".user-auth-dropdown");
  if (authMenu.dataset.loggedIn !== "true") {
    if (typeof dialog.showModal === "function") dialog.showModal();
    return;
  }
  dropdown.hidden = !dropdown.hidden;
});

document.addEventListener("click", (event) => {
  if (!authMenu.contains(event.target)) {
    authMenu.querySelector(".user-auth-dropdown").hidden = true;
  }
});

authMenu.querySelector(".user-auth-signout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  authMenu.querySelector(".user-auth-dropdown").hidden = true;
});

dialog.querySelectorAll("[data-auth-mode]").forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.authMode));
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = dialog.querySelector(".user-auth-submit");
  submit.disabled = true;
  message.textContent = "";
  const email = form.elements.email.value.trim().toLowerCase();
  const password = form.elements.password.value;
  const result =
    mode === "signup"
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: form.elements.name.value.trim() } },
        })
      : await supabase.auth.signInWithPassword({ email, password });
  submit.disabled = false;
  if (result.error) {
    message.textContent = result.error.message;
    return;
  }
  if (mode === "login" && result.data.user) {
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("is_active")
      .eq("id", result.data.user.id)
      .maybeSingle();
    if (profileError) {
      console.error("User profile could not be loaded.", profileError);
    }
    if (profile?.is_active === false) {
      await supabase.auth.signOut();
      message.textContent = "This account has been disabled.";
      return;
    }
  }
  if (mode === "signup" && !result.data.session) {
    message.textContent = "Check your email to confirm your account.";
    return;
  }
  if (result.data.user) showLoggedIn(result.data.user);
  dialog.close();
});

supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    showLoggedIn(session.user);
  } else if (event === "SIGNED_OUT") {
    authButton.setAttribute("aria-label", "Open account login");
    delete authMenu.dataset.loggedIn;
    authMenu.querySelector(".user-auth-dropdown").hidden = true;
    dialog.querySelector(".user-auth-greeting").classList.add("is-hidden");
  }
});

loadSession().catch((error) => {
  console.error("User account session could not be loaded.", error);
});
