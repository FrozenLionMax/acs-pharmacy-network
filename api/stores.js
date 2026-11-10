const https = require('https');

const MASTER_BLOB_ID = 'e7864462-7c2f-42f6-8ff1-297d7a98d912';
const MASTER_BLOB_URL = `https://superjsonblob.com/api/jsonBlob/${MASTER_BLOB_ID}`;
const SUPABASE_URL = process.env.ACS_SUPABASE_URL || 'https://zcvhhfqnhbwpseowfnbr.supabase.co';
const SUPABASE_KEY = process.env.ACS_SUPABASE_ANON_KEY || 'sb_publishable_ieFq5bk-rn8Z3rbCHC31Ng_0QMLW4U1';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Client-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // 1. Try Live Supabase PostgreSQL first
      try {
        const sbData = await fetchFromSupabase();
        if (sbData && Array.isArray(sbData.stores) && sbData.stores.length > 0) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('X-Data-Backend', 'Supabase-PostgreSQL');
          return res.status(200).json(sbData);
        }
      } catch (sbErr) {
        console.warn('Supabase fetch failed, falling back to SuperJSONBlob:', sbErr.message);
      }

      // 2. Fallback to SuperJSONBlob
      const data = await fetchFromBlob();
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('X-Data-Backend', 'SuperJSONBlob-Fallback');
      return res.status(200).json(data);
    } catch (err) {
      console.error('Error fetching stores:', err);
      return res.status(500).json({ error: 'Failed to fetch stores from cloud database' });
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

      // Always update SuperJSONBlob continuous backup
      await putToBlob(payload);
      return res.status(200).json({ success: true, lastModified: payload.lastModified, storeCount: payload.stores.length });
    } catch (err) {
      console.error('Error updating stores:', err);
      return res.status(500).json({ error: 'Failed to update stores in cloud sync' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};

function fetchFromSupabase() {
  return new Promise((resolve, reject) => {
    const fullUrl = `${SUPABASE_URL}/rest/v1/stores?select=*,medicine_stocks(*),staff_members(*)`;
    const parsed = new URL(fullUrl);
    const req = https.get({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      timeout: 4000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const rawStores = JSON.parse(body);
            if (Array.isArray(rawStores) && rawStores.length > 0) {
              const mapped = rawStores.map(s => ({
                id: s.id,
                slug: s.slug,
                slugAliases: s.slug_aliases || [],
                name: s.name,
                district: s.district,
                city: s.city,
                address: s.address,
                mapsUrl: s.maps_url,
                phone: s.phone,
                whatsapp: s.whatsapp,
                email: s.email,
                ownerName: s.owner_name,
                license20: s.license20,
                license21: s.license21,
                gstin: s.gstin,
                establishedYear: s.established_year,
                operatingHours: s.operating_hours,
                is24x7: s.is_24x7,
                photoUrl: s.photo_url,
                galleryPhotos: s.gallery_photos || [],
                pin: s.pin || '1998',
                status: s.status || 'Active',
                rating: parseFloat(s.rating || 4.9),
                stocks: (s.medicine_stocks || []).map(m => ({
                  id: m.id,
                  name: m.name,
                  saltName: m.salt_name,
                  manufacturer: m.manufacturer,
                  batchNo: m.batch_no,
                  expiryDate: m.expiry_date,
                  quantity: m.quantity,
                  unit: m.unit,
                  purchaseRate: parseFloat(m.purchase_rate || 0),
                  mrp: parseFloat(m.mrp || 0),
                  freeScheme: m.free_scheme || '',
                  schedule: m.schedule || 'Non-Schedule / OTC',
                  rackLocation: m.rack_location || 'Rack A-01',
                  minAlertThreshold: m.min_alert_threshold || 15
                })),
                staff: (s.staff_members || []).map(st => ({
                  id: st.id,
                  name: st.name,
                  role: st.role,
                  uppcRegNo: st.uppc_reg_no,
                  qualification: st.qualification,
                  regDate: st.reg_date,
                  validUpto: st.valid_upto,
                  phone: st.phone,
                  shift: st.shift,
                  isRegisteredPharmacist: st.is_registered_pharmacist,
                  isAadhaarVerified: st.is_aadhaar_verified,
                  isOnDuty: st.is_on_duty,
                  avatarUrl: st.avatar_url
                })),
                revenueData: { todaySales: 21500, monthlyGross: 520000, transactions: [] }
              }));
              resolve({
                version: '2.0.0',
                networkName: 'ACS Uttar Pradesh Pharmacy Network',
                source: 'supabase_postgresql',
                lastModified: new Date().toISOString(),
                stores: mapped
              });
              return;
            }
          } catch (e) {
            return reject(e);
          }
        }
        reject(new Error(`Supabase returned HTTP ${res.statusCode}: ${body}`));
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Supabase request timeout')); });
    req.on('error', reject);
  });
}

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
