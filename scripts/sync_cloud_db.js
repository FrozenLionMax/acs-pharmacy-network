const https = require('https');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataCode = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(dataCode.replace('const INITIAL_STORES_DATA', 'var INITIAL_STORES_DATA'), sandbox);

const stores = sandbox.INITIAL_STORES_DATA;
console.log(`Loaded ${stores.length} pharmacies from data.js.`);
stores.forEach((s, idx) => {
  console.log(`Store [${idx + 1}] ${s.name} (${s.slug}): ${s.stocks.length} meds, ${(s.staffDutyLog || []).length} duty logs, ${(s.scheduleH1Register || []).length} H1 logs, ${(s.prescriptions || []).length} rx, ${(s.purchaseExpenses || []).length} POs`);
});

const payloadObj = {
  version: '2.0.0',
  networkName: 'ACS Uttar Pradesh Pharmacy Network',
  lastModified: new Date().toISOString(),
  modifiedBy: 'master_sync_agent',
  stores: stores
};

const payload = JSON.stringify(payloadObj);

// 1. Sync to SuperJSONBlob master ID
const blobId = 'e7864462-7c2f-42f6-8ff1-297d7a98d912';
console.log(`Updating SuperJSONBlob: https://superjsonblob.com/api/jsonBlob/${blobId} ...`);

const blobReq = https.request({
  hostname: 'superjsonblob.com',
  path: `/api/jsonBlob/${blobId}`,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log(`SuperJSONBlob update status: ${res.statusCode}`);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Successfully updated master SuperJSONBlob database!');
    } else {
      console.warn('SuperJSONBlob response body:', body);
    }

    // 2. Sync to deployed Vercel endpoint: https://www.drugs.systems/api/stores
    console.log('Updating https://www.drugs.systems/api/stores ...');
    const apiReq = https.request({
      hostname: 'www.drugs.systems',
      path: '/api/stores',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (apiRes) => {
      let apiBody = '';
      apiRes.on('data', c => apiBody += c);
      apiRes.on('end', () => {
        console.log(`drugs.systems /api/stores status: ${apiRes.statusCode}`);
        console.log('Sync complete!');
      });
    });

    apiReq.on('error', (err) => console.error('Error updating drugs.systems /api/stores:', err.message));
    apiReq.write(payload);
    apiReq.end();
  });
});

blobReq.on('error', (err) => console.error('Error updating SuperJSONBlob:', err.message));
blobReq.write(payload);
blobReq.end();
