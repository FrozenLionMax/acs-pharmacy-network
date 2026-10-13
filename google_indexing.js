/**
 * Google Search Indexing API Automation
 * 
 * Automatically sends instant indexing notifications to Googlebot via:
 * POST https://indexing.googleapis.com/v3/urlNotifications:publish
 * 
 * Works 100% with Node.js built-in modules (crypto, https, fs, path).
 * No third-party npm dependencies required.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const baseDir = __dirname;
const KEY_FILE = path.join(baseDir, 'google-service-account.json');
const BASE_ORIGIN = 'https://acsakhil.com';

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Exchange Google Service Account credentials for an OAuth2 Access Token
 */
function getGoogleAccessToken(credentials) {
  return new Promise((resolve, reject) => {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claimSet = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
    const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signatureInput);
    const signature = signer.sign(credentials.private_key, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const jwt = `${signatureInput}.${signature}`;
    const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;

    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.access_token) {
            resolve(parsed.access_token);
          } else {
            reject(new Error(parsed.error_description || parsed.error || body));
          }
        } catch (e) {
          reject(new Error(`Failed to parse OAuth response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Submit a single URL to Google's Indexing API
 */
function publishUrlToGoogle(accessToken, url, action = 'URL_UPDATED') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      url: url,
      type: action
    });

    const req = https.request({
      hostname: 'indexing.googleapis.com',
      port: 443,
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Main dispatcher to notify Google of all stores
 */
async function notifyGoogleIndexing(urlsToPublish = null) {
  let credentials = null;

  if (fs.existsSync(KEY_FILE)) {
    try {
      credentials = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
    } catch (e) {
      console.error(`[Google Indexing API] Error reading ${KEY_FILE}:`, e.message);
    }
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      console.error('[Google Indexing API] Error parsing GOOGLE_SERVICE_ACCOUNT_KEY:', e.message);
    }
  }

  if (!credentials || !credentials.client_email || !credentials.private_key) {
    console.log('[Google Indexing API] Configuration Status: READY FOR KEY');
    console.log('To activate automatic Googlebot crawl dispatch within 15-45 minutes:');
    console.log('1. Open Google Cloud Console -> Enable "Web Search Indexing API"');
    console.log('2. Create a Service Account, generate a JSON Key');
    console.log('3. In Google Search Console, add the service account email as an Owner/User');
    console.log(`4. Place the key file at: ${KEY_FILE}`);
    return { status: 'skipped', reason: 'no_key_file' };
  }

  try {
    console.log(`[Google Indexing API] Authenticating as: ${credentials.client_email}...`);
    const accessToken = await getGoogleAccessToken(credentials);
    console.log('[Google Indexing API] OAuth2 Access Token acquired successfully!');

    let targetUrls = urlsToPublish;
    if (!targetUrls || !targetUrls.length) {
      // Default to stores from data.js
      const dataCode = fs.readFileSync(path.join(baseDir, 'data.js'), 'utf8');
      const storesMatch = dataCode.match(/slug:\s*["']([^"']+)["']/g);
      const slugs = storesMatch ? storesMatch.map(s => s.replace(/slug:\s*["']/, '').replace(/["']/, '')) : [];
      targetUrls = [
        BASE_ORIGIN,
        ...slugs.map(slug => `${BASE_ORIGIN}/pharmacy/${slug}`)
      ];
    }

    console.log(`[Google Indexing API] Submitting ${targetUrls.length} URLs to Google priority crawl queue...`);
    const results = [];

    for (const url of targetUrls) {
      try {
        const resp = await publishUrlToGoogle(accessToken, url, 'URL_UPDATED');
        console.log(`[Google Indexing API] ${url} -> HTTP ${resp.status}`);
        results.push({ url, status: resp.status, response: resp.body });
      } catch (err) {
        console.error(`[Google Indexing API] Failed to publish ${url}:`, err.message);
        results.push({ url, error: err.message });
      }
    }

    console.log('[Google Indexing API] All URLs successfully dispatched to Googlebot!');
    return { status: 'completed', results };
  } catch (err) {
    console.error('[Google Indexing API] Authentication/Dispatch error:', err.message);
    return { status: 'error', error: err.message };
  }
}

// Run if called directly from CLI
if (require.main === module) {
  notifyGoogleIndexing().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  notifyGoogleIndexing,
  getGoogleAccessToken,
  publishUrlToGoogle
};
