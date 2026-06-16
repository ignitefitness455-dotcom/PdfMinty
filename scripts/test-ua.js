import https from 'https';

function checkWithHeaders(name, headers) {
  const options = {
    hostname: 'pdfminty.com',
    port: 443,
    path: '/',
    method: 'GET',
    headers: headers
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`\n--- ${name} ---`);
      console.log('Status Code:', res.statusCode);
      console.log('Headers:', res.headers);
      console.log('Body (first 100 chars):', JSON.stringify(data.substring(0, 100)));
    });
  });

  req.on('error', (err) => {
    console.error(`Error for ${name}:`, err.message);
  });

  req.end();
}

// 1. Fetch with Chrome User agent
checkWithHeaders('CHROME USER-AGENT', {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5'
});

// 2. Fetch with Mobile User agent
checkWithHeaders('MOBILE CHROME USER-AGENT', {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
});

// 3. Fetch without User agent (similar to our previous check)
checkWithHeaders('NO USER-AGENT', {});
