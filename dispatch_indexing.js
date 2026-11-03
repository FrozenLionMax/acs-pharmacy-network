const https = require('https');

const payload = {
  host: "www.drugs.systems",
  key: "acsakhil2026indexnow",
  keyLocation: "https://www.drugs.systems/acsakhil2026indexnow.txt",
  urlList: [
    "https://www.drugs.systems/pharmacy",
    "https://www.drugs.systems/pharmacy/deoria-drug-house",
    "https://www.drugs.systems/pharmacy/akhil-deoria",
    "https://www.drugs.systems/pharmacy/maa-vindhyavasini-medicos-deoria",
    "https://www.drugs.systems/pharmacy/kushwaha-medical-store-deoria",
    "https://www.drugs.systems/pharmacy/raghav-chemist-deoria",
    "https://www.drugs.systems/pharmacy/ganga-medical-hall-kanpur",
    "https://www.drugs.systems/pharmacy/awadh-care-chemist-lucknow"
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
