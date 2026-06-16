import https from 'https';

function checkUrl(url) {
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`\n--- RESPONSE FOR ${url} ---`);
      console.log('Status Code:', res.statusCode);
      console.log('Headers:', res.headers);
      console.log('Body (first 200 chars):', data.substring(0, 200));
    });
  }).on('error', (err) => {
    console.error(`Error for ${url}:`, err.message);
  });
}

checkUrl('https://pdfminty.com/sw.js');
checkUrl('https://pdfminty.com/service-worker.js');
