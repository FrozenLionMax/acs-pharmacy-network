const https = require('https');

const MASTER_BLOB_ID = 'e7864462-7c2f-42f6-8ff1-297d7a98d912';
const MASTER_BLOB_URL = `https://superjsonblob.com/api/jsonBlob/${MASTER_BLOB_ID}`;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Client-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const data = await fetchFromBlob();
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json(data);
    } catch (err) {
      console.error('Error fetching stores:', err);
      return res.status(500).json({ error: 'Failed to fetch stores from cloud sync' });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (_) {}
      }
      if (!body) {
        return res.status(400).json({ error: 'No data provided' });
      }

      const storesList = Array.isArray(body.stores) ? body.stores : (Array.isArray(body) ? body : []);
      if (!storesList || storesList.length === 0) {
        return res.status(400).json({ error: 'Invalid stores payload' });
      }

      const payload = {
        version: '2.0.0',
        networkName: 'ACS Uttar Pradesh Pharmacy Network',
        lastModified: new Date().toISOString(),
        modifiedBy: body.modifiedBy || 'authorized_pharmacist',
        stores: storesList
      };

      await putToBlob(payload);
      return res.status(200).json({ success: true, lastModified: payload.lastModified, storeCount: payload.stores.length });
    } catch (err) {
      console.error('Error updating stores:', err);
      return res.status(500).json({ error: 'Failed to update stores in cloud sync' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};

function fetchFromBlob() {
  return new Promise((resolve, reject) => {
    https.get(MASTER_BLOB_URL, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function putToBlob(data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const parsed = new URL(MASTER_BLOB_URL);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`SuperJSONBlob returned HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}
