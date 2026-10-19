import { supabase } from "./supabase.js";

const byId = (id) => document.getElementById(id);
const readyNumber = byId("readyNumber");
const rangeText = byId("rangeText");
let updatedAt;

function padToken(token) {
  return String(token).padStart(3, "0");
}

function relativeTime(value) {
  const minutes = Math.floor((Date.now() - new Date(value)) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function renderLaundryStatus(row) {
  const token = Number(row?.ready_token);
  if (!Number.isInteger(token) || token < 0) throw new Error("The laundry token is unavailable.");
  const label = padToken(token);
  updatedAt = row.updated_at;
  readyNumber.textContent = label;
  rangeText.textContent = `${label} or lower`;
  byId("updatedTime").textContent = relativeTime(updatedAt);
  byId("dashboardToken").textContent = label;
  byId("tokenCard").setAttribute("aria-busy", "false");
}

async function loadLaundryStatus() {
  const { data, error } = await supabase.from("laundry_status").select("ready_token,updated_at").eq("id", 1).single();
  if (error) throw error;
  renderLaundryStatus(data);
}

function showAlertMessage(message) {
  const target = byId("laundryAlertMessage");
  if (target) target.textContent = message;
}

function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

async function enablePushAlert(token) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    throw new Error("Push notifications are not supported by this browser.");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not allowed.");

  const registration = await navigator.serviceWorker.ready;
  const keyResponse = await fetch("/api/push-public-key");
  const { publicKey } = await keyResponse.json();
  if (!keyResponse.ok || !publicKey) throw new Error("Push notifications are not configured yet.");

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
  const response = await fetch("/api/push-subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription, targetToken: token }),
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Your alert could not be saved.");
}

function addPushAlert() {
  const note = document.querySelector(".pickup-note");
  if (!note) return;
  const panel = document.createElement("section");
  panel.className = "laundry-alert";
  panel.innerHTML = `<div><p class="laundry-alert-kicker">COLLECTION ALERT</p><strong>Get a push notification when your token is ready.</strong><p>You can close DayBoard after enabling the alert.</p></div><form id="laundryAlertForm"><label for="laundryAlertTarget">My token</label><div><input id="laundryAlertTarget" type="number" min="0" inputmode="numeric" required placeholder="000"><button type="submit">Enable alert</button></div><p id="laundryAlertMessage" role="status"></p></form>`;
  note.after(panel);
  panel.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.submitter;
    const token = Number(byId("laundryAlertTarget").value);
    if (!Number.isInteger(token) || token < 0) return showAlertMessage("Enter a valid token number.");
    button.disabled = true;
    showAlertMessage("Enabling push alert…");
    try {
      await enablePushAlert(token);
      showAlertMessage(`You will be notified when token ${padToken(token)} is ready.`);
    } catch (error) {
      console.error("Push alert could not be enabled.", error);
      showAlertMessage(error.message || "Your alert could not be enabled.");
    } finally {
      button.disabled = false;
    }
  });
}

function addAlertStyles() {
  const style = document.createElement("style");
  style.textContent = `.laundry-alert{display:flex;justify-content:space-between;gap:30px;align-items:center;width:min(100%,760px);margin:30px auto 0;padding:20px;border:1px solid var(--line);border-radius:9px;background:var(--surface-muted)}.laundry-alert-kicker{margin:0 0 7px;color:var(--muted);font:800 9px "DM Mono",monospace;letter-spacing:1px}.laundry-alert strong{font-size:15px}.laundry-alert p:not(.laundry-alert-kicker):not(#laundryAlertMessage){margin:6px 0 0;color:var(--muted);font-size:12px}.laundry-alert form{min-width:240px}.laundry-alert label{display:block;margin-bottom:6px;font-size:11px;font-weight:800}.laundry-alert form>div{display:flex;gap:7px}.laundry-alert input{width:86px;padding:10px;border:1px solid var(--line);border-radius:5px;background:var(--surface);color:var(--ink);font:700 14px "DM Mono",monospace}.laundry-alert button{padding:10px 12px;border:0;border-radius:5px;background:var(--ink);color:#fff;font:800 12px Manrope;cursor:pointer}.laundry-alert button:disabled{opacity:.65;cursor:wait}.laundry-alert #laundryAlertMessage{min-height:16px;margin:7px 0 0;color:var(--muted);font-size:11px}@media(max-width:700px){.laundry-alert{align-items:stretch;flex-direction:column;gap:17px}.laundry-alert form{min-width:0}}`;
  document.head.append(style);
}

addAlertStyles();
addPushAlert();
loadLaundryStatus().catch((error) => {
  console.error("Laundry status could not be loaded.", error);
  rangeText.textContent = "temporarily unavailable";
  byId("updatedTime").textContent = "unavailable";
  byId("tokenCard").setAttribute("aria-busy", "false");
});

supabase.channel("laundry-status").on("postgres_changes", { event: "UPDATE", schema: "public", table: "laundry_status", filter: "id=eq.1" }, (payload) => renderLaundryStatus(payload.new)).subscribe();
window.setInterval(() => { if (updatedAt) byId("updatedTime").textContent = relativeTime(updatedAt); }, 60_000);
