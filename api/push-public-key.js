module.exports = (request, response) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) return response.status(503).json({ error: "Push notifications are not configured." });
  response.status(200).json({ publicKey });
};
