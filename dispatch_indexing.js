const https = require('https');

const payload = {
  host: "acsakhil.com",
  key: "acsakhil2026indexnow",
  keyLocation: "https://acsakhil.com/acsakhil2026indexnow.txt",
  urlList: [
    "https://acsakhil.com/",
    "https://acsakhil.com/pharmacy/deoria-drug-house",
    "https://acsakhil.com/deoria-drug-house",
    "https://acsakhil.com/pharmacy/maa-vindhyavasini-medicos-deoria",
    "https://acsakhil.com/maa-vindhyavasini-medicos-deoria",
    "https://acsakhil.com/pharmacy/kushwaha-medical-store-deoria",
    "https://acsakhil.com/kushwaha-medical-store-deoria",
    "https://acsakhil.com/pharmacy/raghav-chemist-deoria",
    "https://acsakhil.com/raghav-chemist-deoria",
    "https://acsakhil.com/pharmacy/ganga-medical-hall-kanpur",
    "https://acsakhil.com/ganga-medical-hall-kanpur",
    "https://acsakhil.com/pharmacy/awadh-care-chemist-lucknow",
    "https://acsakhil.com/awadh-care-chemist-lucknow"
  ]
};

const engines = [
  { name: 'IndexNow Central Hub', hostname: 'api.indexnow.org', path: '/indexnow' },
  { name: 'Microsoft Bing', hostname: 'www.bing.com', path: '/indexnow' },
  { name: 'Yandex Search', hostname: 'yandex.com', path: '/indexnow' }
];

const postData = JSON.stringify(payload);

console.log(`Starting Instant Multi-Engine Indexing for all ${payload.urlList.length} URLs across 6 deployed pharmacies...`);

engines.forEach(eng => {
  const req = https.request({
    hostname: eng.hostname,
    port: 443,
    path: eng.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, res => {
    let body = '';
    res.on('data', d => { body += d; });
    res.on('end', () => {
      console.log(`[${eng.name}] -> HTTP Status: ${res.statusCode} ${res.statusCode === 200 || res.statusCode === 202 ? '(SUCCESS: Accepted into crawler queue)' : ''}`);
    });
  });

  req.on('error', e => {
    console.error(`[${eng.name}] Error:`, e.message);
  });

  req.write(postData);
  req.end();
});
