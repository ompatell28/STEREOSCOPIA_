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

    // Decap CMS standard postMessage execution structure
    const content = `
      <!DOCTYPE html>
      <html>
      <head><title>Authorization Success</title></head>
      <body>
        <p>Signing in... please wait.</p>
        <script>
          (function() {
            function recieveMessage(e) {
              console.log("Recieved message:", e);
            }
            window.addEventListener("message", recieveMessage, false);
            
            const messageConfig = {
              authorizing: false,
              provider: 'github',
              token: '${data.access_token}'
            };
            
            // Handshake protocols dono broad aur target origins par bhej rahe hain
            window.opener.postMessage('authorization:github:success:' + JSON.stringify(messageConfig), window.location.origin);
            window.opener.postMessage('authorization:github:success:' + JSON.stringify(messageConfig), '*');
            
            window.close();
          })();
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