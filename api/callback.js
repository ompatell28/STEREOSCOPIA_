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

    // Security check bypass karne ke liye generic targetOrigin postMessage
    const content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Authorization Success</title>
      </head>
      <body>
        <p>Authenticating... Please wait.</p>
        <script>
          const postMessageArgs = {
            authorizing: false,
            provider: 'github',
            token: '${data.access_token}'
          };
          
          // Dono tarike se data transmit karenge taaki browser block na kare
          window.opener.postMessage('authorization:github:success:' + JSON.stringify(postMessageArgs), '*');
          
          setTimeout(() => {
            window.close();
          }, 500);
        </script>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}