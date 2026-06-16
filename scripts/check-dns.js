import dns from 'dns';

dns.resolve4('pdfminty.com', (err, addresses) => {
  if (err) console.error('A record error:', err);
  else console.log('A Records:', addresses);
});

dns.resolveMx('pdfminty.com', (err, addresses) => {
  if (err) console.error('MX record error:', err);
  else console.log('MX Records:', addresses);
});

dns.resolveNs('pdfminty.com', (err, addresses) => {
  if (err) console.error('NS record error:', err);
  else console.log('NS Records:', addresses);
});
