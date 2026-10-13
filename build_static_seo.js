const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = __dirname;
const dataCode = fs.readFileSync(path.join(baseDir, 'data.js'), 'utf8');
const appCode = fs.readFileSync(path.join(baseDir, 'app.js'), 'utf8');
const indexTemplate = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');

// Mock DOM environment for rendering static views
const storage = {};
const mockLocalStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => {}
};

const mockElements = {
  'toast-container': { appendChild: () => {}, remove: () => {} },
  'modal-generic': { classList: { add: () => {}, remove: () => {} }, innerHTML: '', style: {}, addEventListener: () => {} },
  'modal-generic-title': { innerHTML: '' },
  'modal-generic-body': { innerHTML: '' },
  'main-view-container': { innerHTML: '' },
  'header-auth-controls': { innerHTML: '' },
  'header-store-selector-container': { classList: { add: () => {}, remove: () => {} } },
  'header-store-select': { innerHTML: '', addEventListener: () => {} },
  'portal-nav-bar': { classList: { add: () => {}, remove: () => {} } }
};

const mockDocument = {
  getElementById: (id) => mockElements[id] || { innerHTML: '', value: '', classList: { add: () => {}, remove: () => {} }, addEventListener: () => {}, style: {} },
  querySelector: () => ({ innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: () => ({ innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, remove: () => {} }),
  body: { classList: { add: () => {}, remove: () => {} } }
};

const mockWindow = {
  localStorage: mockLocalStorage,
  location: { pathname: '/', search: '', hash: '' },
  addEventListener: () => {},
  scrollTo: () => {},
  history: { pushState: () => {} },
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  document: mockDocument
};

const sandbox = {
  window: mockWindow,
  document: mockDocument,
  localStorage: mockLocalStorage,
  console: console,
  setTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {},
  clearTimeout: () => {},
  URLSearchParams: class { get() { return null; } }
};

vm.createContext(sandbox);
vm.runInContext(dataCode.replace("const INITIAL_STORES_DATA", "var INITIAL_STORES_DATA"), sandbox);
vm.runInContext(appCode, sandbox);

const ACSAppClass = vm.runInContext("ACSApp", sandbox);
const app = new ACSAppClass();
sandbox.window.acsApp = app;

const stores = sandbox.INITIAL_STORES_DATA;
console.log(`Building Static SEO pre-rendered pages for ${stores.length} pharmacies...`);

const baseOrigin = "https://acsakhil.com";
const currentDate = new Date().toISOString().split('T')[0];

stores.forEach((store) => {
  const storeUrl = `${baseOrigin}/pharmacy/${store.slug}`;
  const ownerLabel = store.ownerName ? ` (${store.ownerName})` : "";
  const pageTitle = `${store.name}${ownerLabel} - Licensed Retail Pharmacy | ${store.address.split(',')[0]}, ${store.district}, UP`;
  const pageDesc = `${store.name} located at ${store.address}. Licensed under Form 20/21 (${store.license20}). UPPC registered pharmacist ${store.ownerName || 'Qualified Pharmacist'} on duty. Phone ${store.phone}. Browse live stock, retail MRP & bulk free schemes.`;
  const pageKeywords = `${store.name}, ${store.name} deoria, ${store.name} akhil, ${store.ownerName || ''}, chemist in ${store.district}, medical store ${store.city}, station road deoria chemist, subhash chowk chemist, UPPC registered pharmacist, Form 20 ${store.license20}, medicine stock availability`;

  // Render the full customer-facing hosted website HTML
  app.currentStoreId = store.id;
  app.hostedSubTab = 'storefront';
  const preRenderedBodyHtml = app.getHostedWebsiteViewHtml(store);

  // Generate Store Schema.org JSON-LD
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Pharmacy",
    "name": store.name,
    "alternateName": [
      `${store.name} Akhil`,
      `${store.name} ${store.district}`,
      store.ownerName ? `${store.ownerName} Medical Store` : ""
    ].filter(Boolean),
    "image": store.photoUrl,
    "url": storeUrl,
    "telephone": store.phone,
    "priceRange": "₹₹",
    "openingHours": "Mo-Su 08:00-22:30",
    "hasMap": store.mapsUrl,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": store.address,
      "addressLocality": store.city,
      "addressRegion": "Uttar Pradesh",
      "postalCode": "274001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 26.5024,
      "longitude": 83.7791
    },
    "department": {
      "@type": "MedicalBusiness",
      "name": `${store.name} Dispensing Department`,
      "description": `Statutory drug dispensing under Form 20/21 license ${store.license20}`
    }
  };

  // Inject into indexTemplate
  let html = indexTemplate;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`);

  // Replace Description & Keywords
  html = html.replace(/<meta name="description" id="meta-description" content=".*?" \/>/, `<meta name="description" id="meta-description" content="${pageDesc}" />`);
  html = html.replace(/<meta name="keywords" id="meta-keywords" content=".*?" \/>/, `<meta name="keywords" id="meta-keywords" content="${pageKeywords}" />`);

  // Replace Canonical & OG
  html = html.replace(/<link rel="canonical" id="canonical-url" href=".*?" \/>/, `<link rel="canonical" id="canonical-url" href="${storeUrl}" />`);
  html = html.replace(/<meta property="og:title" id="og-title" content=".*?" \/>/, `<meta property="og:title" id="og-title" content="${pageTitle}" />`);
  html = html.replace(/<meta property="og:description" id="og-description" content=".*?" \/>/, `<meta property="og:description" id="og-description" content="${pageDesc}" />`);
  html = html.replace(/<meta property="og:url" id="og-url" content=".*?" \/>/, `<meta property="og:url" id="og-url" content="${storeUrl}" />`);
  html = html.replace(/<meta property="og:image" id="og-image" content=".*?" \/>/, `<meta property="og:image" id="og-image" content="${store.photoUrl}" />`);

  // Replace Twitter
  html = html.replace(/<meta name="twitter:title" id="twitter-title" content=".*?" \/>/, `<meta name="twitter:title" id="twitter-title" content="${pageTitle}" />`);
  html = html.replace(/<meta name="twitter:description" id="twitter-description" content=".*?" \/>/, `<meta name="twitter:description" id="twitter-description" content="${pageDesc}" />`);
  html = html.replace(/<meta name="twitter:image" id="twitter-image" content=".*?" \/>/, `<meta name="twitter:image" id="twitter-image" content="${store.photoUrl}" />`);

  // Replace JSON-LD Schema
  html = html.replace(/<script id="seo-schema" type="application\/ld\+json">[\s\S]*?<\/script>/, `<script id="seo-schema" type="application/ld+json">\n${JSON.stringify(storeSchema, null, 2)}\n</script>`);

  // Pre-render the full store body inside #main-view-container!
  html = html.replace(
    /<div id="main-view-container">\s*<!-- Dynamically filled by app\.js router -->\s*<\/div>/,
    `<div id="main-view-container">\n${preRenderedBodyHtml}\n</div>`
  );

  // Set hosted-mode and hide portal header/footer in pre-rendered static HTML
  html = html.replace('class="bg-[#f4f7fa] text-slate-800 antialiased min-h-screen flex flex-col justify-between"', 'class="bg-[#f4f7fa] text-slate-800 antialiased min-h-screen flex flex-col justify-between hosted-mode"');
  html = html.replace('<header class="w-full no-print">', '<header class="w-full no-print" style="display:none">');
  html = html.replace('<footer class="bg-[#0b3447] text-slate-300 pt-10 pb-6 border-t-4 border-amber-400 no-print mt-12">', '<footer class="bg-[#0b3447] text-slate-300 pt-10 pb-6 border-t-4 border-amber-400 no-print mt-12" style="display:none">');
  html = html.replace('<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">', '<main class="w-full p-0 m-0 max-w-none flex-1">');


  // Write static file in pharmacy/<slug>/index.html and pharmacy/<slug>.html
  const targetDir = path.join(baseDir, 'pharmacy', store.slug);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(baseDir, 'pharmacy', `${store.slug}.html`), html, 'utf8');
  console.log(`Generated: pharmacy/${store.slug}/index.html & pharmacy/${store.slug}.html (${html.length} bytes)`);

  // Also write top-level alias (e.g. /deoria-drug-house/index.html and /deoria-drug-house.html)
  const aliasDir = path.join(baseDir, store.slug);
  fs.mkdirSync(aliasDir, { recursive: true });
  fs.writeFileSync(path.join(aliasDir, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(baseDir, `${store.slug}.html`), html, 'utf8');
  console.log(`Generated Alias: ${store.slug}/index.html & ${store.slug}.html`);

  // Also write all slugAliases
  if (Array.isArray(store.slugAliases)) {
    store.slugAliases.forEach(alias => {
      if (alias && alias !== store.slug) {
        const pDir = path.join(baseDir, 'pharmacy', alias);
        fs.mkdirSync(pDir, { recursive: true });
        fs.writeFileSync(path.join(pDir, 'index.html'), html, 'utf8');
        fs.writeFileSync(path.join(baseDir, 'pharmacy', `${alias}.html`), html, 'utf8');

        const topDir = path.join(baseDir, alias);
        fs.mkdirSync(topDir, { recursive: true });
        fs.writeFileSync(path.join(topDir, 'index.html'), html, 'utf8');
        fs.writeFileSync(path.join(baseDir, `${alias}.html`), html, 'utf8');
      }
    });
  }
});

  const https = require('https');

  // Dynamically generate master sitemap.xml with all stores
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  sitemapXml += `  <!-- ACS Central Gateway -->\n  <url>\n    <loc>${baseOrigin}/</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  const allIndexedUrls = [`${baseOrigin}/`];

  stores.forEach(store => {
    const storeUrl = `${baseOrigin}/pharmacy/${store.slug}`;
    allIndexedUrls.push(storeUrl);
    allIndexedUrls.push(`${baseOrigin}/${store.slug}`);

    sitemapXml += `  <!-- ${store.name} -->\n  <url>\n    <loc>${storeUrl}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    sitemapXml += `  <url>\n    <loc>${baseOrigin}/${store.slug}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  });

  sitemapXml += `</urlset>\n`;
  fs.writeFileSync(path.join(baseDir, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log(`Generated dynamic sitemap.xml with ${stores.length} pharmacies and ${allIndexedUrls.length} indexed URLs!`);

  // Write indexnow.json
  const indexNowPayload = {
    host: "acsakhil.com",
    key: "acsakhil2026indexnow",
    keyLocation: "https://acsakhil.com/acsakhil2026indexnow.txt",
    urlList: allIndexedUrls
  };
  fs.writeFileSync(path.join(baseDir, 'indexnow.json'), JSON.stringify(indexNowPayload, null, 2), 'utf8');
  console.log(`Generated indexnow.json for automated search engine submission.`);

  // Auto-ping IndexNow API for instant search engine notification
  try {
    const reqData = JSON.stringify(indexNowPayload);
    const req = https.request({
      hostname: 'api.indexnow.org',
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(reqData)
      }
    }, (res) => {
      console.log(`Automated IndexNow Dispatch: Search engines notified with HTTP status ${res.statusCode}`);
    });
    req.on('error', (err) => {
      console.log(`IndexNow ping notice: ${err.message}`);
    });
    req.write(reqData);
    req.end();
  } catch (e) {
    console.log(`IndexNow notification skipped: ${e.message}`);
  }

  console.log('Static SEO Pre-rendering & Automated Indexing build completed successfully!');

