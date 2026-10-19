module.exports = async (request, response) => {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });
  const { subscription, targetToken } = request.body || {};
  const endpoint = subscription?.endpoint;
  if (!endpoint || !Number.isInteger(targetToken) || targetToken < 0) {
    return response.status(400).json({ error: "A valid subscription and token are required." });
  }
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return response.status(503).json({ error: "Push notifications are not configured." });

  const save = await fetch(`${url}/rest/v1/laundry_push_subscriptions?on_conflict=endpoint`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify([{
      endpoint,
      subscription,
      target_token: targetToken,
      notified_at: null,
      updated_at: new Date().toISOString(),
    }]),
  });
  if (!save.ok) {
    console.error("Push subscription could not be saved.", await save.text());
    return response.status(500).json({ error: "Your alert could not be saved." });
  }
  response.status(201).json({ ok: true });
};
