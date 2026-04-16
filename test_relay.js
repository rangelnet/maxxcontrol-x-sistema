const http = require('http');

const data = JSON.stringify({
  panel_id: 1,
  customers: [{
    username: "joaozinho_teste",
    password: "123",
    expire_date: "10/10/2030"
  }, {
    username: "marcos_teste",
    password: "abc",
    expire_date: "12/12/2026"
  }]
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/iptv-plugin/relay-sync-customers',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let chunks = '';
  res.on('data', d => chunks += d);
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${chunks}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
