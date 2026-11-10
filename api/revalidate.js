const https = require('https');

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'acs_seo_revalidate_2026';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'drugs-systems-indexnow-key-2026';
const HOST_DOMAIN = 'www.drugs.systems';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Revalidate-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const secret = req.query.secret || req.headers['x-revalidate-secret'] || (req.body && req.body.secret);
    // Enforce secret check only if REVALIDATE_SECRET is strictly configured in production env
    if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
      return res.status(401).json({ error: 'Invalid revalidation secret token' });
    }

    let slug = req.query.slug || (req.body && req.body.slug);

    // If payload is a Supabase Database Webhook (e.g. table 'stores' or 'medicine_stocks')
    if (!slug && req.body && req.body.record) {
      slug = req.body.record.slug || req.body.record.store_id || null;
    }

    const pathsToRevalidate = [];
    if (slug) {
      pathsToRevalidate.push(`/pharmacy/${slug}`);
      pathsToRevalidate.push(`/${slug}`);
    } else {
      pathsToRevalidate.push('/');
      pathsToRevalidate.push('/sitemap.xml');
    }

    // 1. Vercel On-Demand Revalidation if available
    const revalidationResults = [];
    if (typeof res.revalidate === 'function') {
      for (const p of pathsToRevalidate) {
        try {
          await res.revalidate(p);
          revalidationResults.push({ path: p, status: 'revalidated' });
        } catch (e) {
          revalidationResults.push({ path: p, status: 'skipped', error: e.message });
        }
      }
    }

    // 2. Automated Search Engine Ping via IndexNow
    const pingUrls = pathsToRevalidate.map(p => `https://${HOST_DOMAIN}${p}`);
    await dispatchIndexNow(pingUrls).catch(e => console.warn('IndexNow notice:', e.message));

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      revalidatedPaths: pathsToRevalidate,
      results: revalidationResults,
      searchEnginesNotified: true
    });
  } catch (err) {
    console.error('Revalidation error:', err);
    return res.status(500).json({ error: 'Internal Revalidation Error', message: err.message });
  }
};

function dispatchIndexNow(urls) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      host: HOST_DOMAIN,
      key: INDEXNOW_KEY,
      urlList: urls
    });

    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/IndexNow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 3000
    }, (res) => {
      resolve(res.statusCode);
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.write(payload);
    req.end();
  });
}
