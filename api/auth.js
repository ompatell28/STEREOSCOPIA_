
export default function handler(req, res) {
  const clientId = process.env.DECAP_CMS_OAUTH_CLIENT_ID;
  const host = req.headers.host;
  
  // Dynamic redirect URI jo exact domain uthayega
  const redirectUri = `https://${host}/api/callback`;
  
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${encodeURIComponent(redirectUri)}&state=decap-cms`;
  
  res.redirect(url);
}