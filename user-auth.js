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
  .user-auth-google { width: 100%; margin-top: 10px; padding: 12px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); color: var(--ink); font: 800 13px Manrope; cursor: pointer; }
  .user-auth-reset { display: block; margin: 12px auto 0; padding: 0; border: 0; background: none; color: var(--muted); font: 600 11px Manrope; text-decoration: underline; cursor: pointer; }
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
authMenu.hidden = true;
let loginVisible = true;
authMenu.innerHTML = `
  <div class="user-auth-dropdown" hidden>
    <p class="user-auth-dropdown-greeting"></p>
    <button type="button" class="user-auth-signout">Sign out</button>
  </div>
`;
authMenu.prepend(authButton);
document.querySelector(".nav-actions")?.append(authMenu);

async function applyLoginVisibility() {
  const { data, error } = await supabase
    .from("site_section_visibility")
    .select("is_public")
    .eq("section_key", "auth")
    .maybeSingle();
  if (error) {
    console.error("Login visibility could not be loaded.", error);
    authMenu.hidden = false;
    return;
  }
  if (data?.is_public === false) {
    loginVisible = false;
  }
  authMenu.hidden = !loginVisible;
}

const dialog = document.createElement("dialog");
dialog.className = "user-auth-dialog";
dialog.id = "account";
dialog.innerHTML = `
  <form method="dialog" class="user-auth-card">
    <button type="button" class="user-auth-close" aria-label="Close account dialog">×</button>
    <p class="section-kicker">CAMPUS ACCOUNT</p>
    <h2>Welcome to DayBoard</h2>
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
    <button type="button" class="user-auth-google">Continue with Google</button>
    <button type="button" class="user-auth-reset">Forgot password?</button>
  </form>
`;
document.body.append(dialog);
applyLoginVisibility().catch((error) => {
  console.error("Login visibility could not be applied.", error);
});

const form = dialog.querySelector(".user-auth-card");
const nameField = dialog.querySelector(".user-auth-name");
const message = dialog.querySelector(".user-auth-message");
let mode = "login";

dialog.querySelector(".user-auth-close").addEventListener("click", () => {
  dialog.close();
});

function setMode(nextMode) {
  mode = nextMode;
  nameField.classList.toggle("is-hidden", mode !== "signup");
  nameField.querySelector("input").required = mode === "signup";
  dialog.querySelector(".user-auth-tabs").classList.toggle("is-hidden", mode === "reset");
  const passwordLabel = dialog.querySelector('input[name="password"]').closest("label");
  passwordLabel.classList.toggle("is-hidden", mode === "reset");
  dialog.querySelector('input[name="password"]').required = mode !== "reset";
  dialog.querySelector(".user-auth-google").classList.toggle("is-hidden", mode === "reset");
  dialog.querySelector(".user-auth-submit").textContent =
    mode === "signup" ? "Create account" : mode === "reset" ? "Send reset email" : "Log in";
  dialog.querySelector(".user-auth-reset").textContent =
    mode === "reset" ? "Back to log in" : "Forgot password?";
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
    const { data: isActive, error: profileError } = await supabase.rpc("is_active_user");
    if (profileError) {
      console.error("User profile could not be loaded.", profileError);
    }

    if (isActive !== true) {
      await supabase.auth.signOut();
      return;
    }
    showLoggedIn(data.session.user);
  }
}

const loginEmail = new URLSearchParams(window.location.search).get("email");
if (loginEmail) {
  form.elements.email.value = loginEmail;
  setTimeout(() => {
    if (loginVisible && !authMenu.dataset.loggedIn && typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  }, 0);
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

dialog.querySelector(".user-auth-google").addEventListener("click", async () => {
  const button = dialog.querySelector(".user-auth-google");
  button.disabled = true;
  message.textContent = "";
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.href },
  });
  if (error) {
    button.disabled = false;
    message.textContent = "Google sign-in could not be started.";
    console.error("Google sign-in failed.", error);
  }
});

dialog.querySelector(".user-auth-reset").addEventListener("click", (event) => {
  event.preventDefault();
  setMode(mode === "reset" ? "login" : "reset");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = dialog.querySelector(".user-auth-submit");
  submit.disabled = true;
  message.textContent = "";
  const email = form.elements.email.value.trim().toLowerCase();
  const password = form.elements.password.value;
  if (mode === "reset") {
    const { data: isAllowed, error: eligibilityError } = await supabase.rpc(
      "is_email_login_allowed",
      { target_email: email },
    );
    if (eligibilityError || isAllowed !== true) {
      submit.disabled = false;
      message.textContent = "Password reset could not be requested right now. Please try again later.";
      if (eligibilityError) console.error("Password reset eligibility could not be checked.", eligibilityError);
      return;
    }
  }
  const result =
    mode === "reset"
      ? await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/index.html`,
        })
      : mode === "signup"
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: form.elements.name.value.trim() } },
        })
      : await supabase.auth.signInWithPassword({ email, password });
  submit.disabled = false;
  if (result.error) {
    message.textContent =
      mode === "reset"
        ? "Password reset could not be requested right now. Please try again later."
        : mode === "signup"
        ? "Account could not be created right now. Please try again later."
        : "Unable to complete sign in. Please check your details and try again later.";
    return;
  }
  if (mode === "login" && result.data.user) {
    const { data: isActive, error: profileError } = await supabase.rpc("is_active_user");
    if (profileError) {
      console.error("User profile could not be loaded.", profileError);
    }
    if (isActive !== true) {
      await supabase.auth.signOut();
      message.textContent = "This account has been disabled.";
      return;
    }
  }
  if (mode === "reset") {
    message.textContent = "If that account exists, a reset email has been sent.";
    return;
  }
  if (mode === "signup" && !result.data.session) {
    message.textContent = "Account created. Sign in to continue.";
    return;
  }
  if (result.data.user) showLoggedIn(result.data.user);
  dialog.close();
});

supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
      supabase.rpc("is_active_user").then(({ data: isActive, error }) => {
          if (error) {
            console.error("User profile could not be checked.", error);
          } else if (isActive !== true) {
            supabase.auth.signOut();
          } else {
            showLoggedIn(session.user);
          }
        });
    } else {
      showLoggedIn(session.user);
    }
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
