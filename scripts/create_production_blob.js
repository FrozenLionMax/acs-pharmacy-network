const https = require('https');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataCode = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(dataCode.replace('const INITIAL_STORES_DATA', 'var INITIAL_STORES_DATA'), sandbox);

const stores = sandbox.INITIAL_STORES_DATA;
console.log(`Found ${stores.length} pharmacies in data.js to initialize cloud database...`);

const payloadObj = {
  version: '2.0.0',
  networkName: 'ACS Uttar Pradesh Pharmacy Network',
  lastModified: new Date().toISOString(),
  modifiedBy: 'system_init',
  stores: stores
};

const payload = JSON.stringify(payloadObj);

const req = https.request({
  hostname: 'superjsonblob.com',
  path: '/api/jsonBlob',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const loc = res.headers['location'];
    console.log('Location:', loc);
    if (loc) {
      const blobId = loc.replace('/api/jsonBlob/', '');
      console.log('Blob ID:', blobId);
      const fullUrl = `https://superjsonblob.com/api/jsonBlob/${blobId}`;
      console.log('Full Master Sync URL:', fullUrl);

      // Verify reading back
      https.get(fullUrl, (getRes) => {
        let getData = '';
        getRes.on('data', c => getData += c);
        getRes.on('end', () => {
          const parsed = JSON.parse(getData);
          console.log(`Successfully verified cloud master blob! Store count: ${parsed.stores.length}`);
          console.log('Primary store:', parsed.stores[0].name, 'Stocks count:', parsed.stores[0].stocks.length);
        });
      });
    }
  });
});

req.on('error', (err) => console.error('Error creating cloud blob:', err));
req.write(payload);
req.end();
