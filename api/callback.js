export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.DECAP_CMS_OAUTH_CLIENT_ID;
  const clientSecret = process.env.DECAP_CMS_OAUTH_CLIENT_SECRET;

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).send(`OAuth Error: ${data.error_description}`);
    }

    // Decap CMS ko login complete karne ke liye script inject karna
    const content = `
      <script>
        const postMessageArgs = {
          authorizing: false,
          provider: 'github',
          token: '${data.access_token}'
        };
        window.opener.postMessage('authorization:github:success:' + JSON.stringify(postMessageArgs), window.location.origin);
        window.close();
      </script>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}