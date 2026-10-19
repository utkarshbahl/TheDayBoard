const webpush = require("web-push");

const supabaseHeaders = (key) => ({ apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" });

async function getStaffUser(request, url, anonKey) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const user = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
  return user.ok ? user.json() : null;
}

module.exports = async (request, response) => {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });
  const readyToken = request.body?.readyToken;
  if (!Number.isInteger(readyToken) || readyToken < 0) return response.status(400).json({ error: "A valid ready token is required." });

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !serviceKey || !anonKey || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) {
    return response.status(503).json({ error: "Push notifications are not configured." });
  }
  const user = await getStaffUser(request, url, anonKey);
  if (user?.app_metadata?.role !== "laundry_staff") return response.status(403).json({ error: "Not authorized." });

  const subscriptions = await fetch(`${url}/rest/v1/laundry_push_subscriptions?target_token=lte.${readyToken}&notified_at=is.null&select=id,endpoint,subscription,target_token`, { headers: supabaseHeaders(serviceKey) });
  if (!subscriptions.ok) return response.status(500).json({ error: "Subscriptions could not be loaded." });
  const rows = await subscriptions.json();
  webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

  let sent = 0;
  await Promise.all(rows.map(async (row) => {
    try {
      await webpush.sendNotification(row.subscription, JSON.stringify({
        title: "Laundry is ready",
        body: `Your token ${String(row.target_token).padStart(3, "0")} is ready for collection.`,
        url: "/laundry",
      }));
      await fetch(`${url}/rest/v1/laundry_push_subscriptions?id=eq.${row.id}`, {
        method: "PATCH", headers: supabaseHeaders(serviceKey), body: JSON.stringify({ notified_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
      });
      sent += 1;
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await fetch(`${url}/rest/v1/laundry_push_subscriptions?id=eq.${row.id}`, { method: "DELETE", headers: supabaseHeaders(serviceKey) });
      } else console.error("Push delivery failed.", error);
    }
  }));
  response.status(200).json({ ok: true, sent });
};
