export default function handler(req, res) {
  const clientId = process.env.DECAP_CMS_OAUTH_CLIENT_ID;
  const redirectUri = `https://${req.headers.host}/api/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(url);
}