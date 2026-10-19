import { supabase } from "./supabase.js";

const byId = (id) => document.getElementById(id);

const navigationStyle = document.createElement("style");
navigationStyle.textContent = ".staff-page .nav{gap:18px}.staff-page .staff-link{margin-left:auto;white-space:nowrap}";
document.head.append(navigationStyle);

function showUpdatePanel() {
  byId("loginPanel").classList.add("hidden");
  byId("updatePanel").classList.remove("hidden");
  byId("newNumber").focus();
}

async function loadCurrentToken() {
  const { data } = await supabase.from("laundry_status").select("ready_token").eq("id", 1).single();
  if (data) byId("newNumber").value = data.ready_token;
}

byId("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  button.textContent = "Signing in…";
  const { error } = await supabase.auth.signInWithPassword({
    email: byId("staffEmail").value.trim(),
    password: byId("staffPassword").value,
  });
  button.disabled = false;
  button.textContent = "Sign in";
  if (error) {
    byId("loginMessage").textContent = "Check the email and password, then try again.";
    return;
  }
  showUpdatePanel();
  loadCurrentToken();
});

byId("updateForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  button.textContent = "Updating…";
  const { error } = await supabase.from("laundry_status").update({ ready_token: Number(byId("newNumber").value) }).eq("id", 1);
  button.disabled = false;
  button.textContent = "Update live board";
  byId("updateMessage").style.color = error ? "#b94331" : "#438022";
  if (error) {
    byId("updateMessage").textContent = `Could not update: ${error.message}`;
    return;
  }
  const { data: { session } } = await supabase.auth.getSession();
  const notification = await fetch("/api/push-notify", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || ""}` },
    body: JSON.stringify({ readyToken: Number(byId("newNumber").value) }),
  }).then(async (response) => response.ok ? response.json() : null).catch(() => null);
  byId("updateMessage").textContent = notification ? `Done! ${notification.sent} laundry alert${notification.sent === 1 ? "" : "s"} sent.` : "Done! Students can see the new number.";
});

byId("signOut").addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});

const { data: { session } } = await supabase.auth.getSession();
if (session) {
  showUpdatePanel();
  loadCurrentToken();
}
