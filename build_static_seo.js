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

const baseOrigin = "https://www.drugs.systems";
const currentDate = new Date().toISOString().split('T')[0];

stores.forEach((store) => {
  const storeUrl = `${baseOrigin}/pharmacy/${store.slug}`;
  const ownerLabel = store.ownerName ? ` (${store.ownerName})` : "";
  const pageTitle = `${store.name}${ownerLabel} - Licensed Retail Pharmacy | ${store.address.split(',')[0]}, ${store.district}, UP`;
  const pageDesc = `${store.name} located at ${store.address}. Licensed under Form 20/21 (${store.license20}). UPPC registered pharmacist ${store.ownerName || 'Qualified Pharmacist'} on duty. Phone ${store.phone}. Browse live stock, verified retail MRP & statutory medicine catalog.`;

  // Use Universal Generator from ACSApp
  const alternateNames = app.generateStoreAliases(store);
  const storeSchema = app.generateStoreSchemaGraph(store, baseOrigin);

  const pageKeywords = [
    store.name,
    store.ownerName,
    ...alternateNames,
    `chemist in ${store.district}`,
    `medical store in ${store.city}`,
    `pharmacy in ${store.district}`,
    `${store.name} online stock`,
    `UPPC registered pharmacist ${store.ownerName}`,
    `Form 20 ${store.license20}`,
    "medicine stock availability",
    "drugs.systems"
  ].filter(Boolean).join(", ");

  // Render the full customer-facing hosted website HTML
  app.currentStoreId = store.id;
  app.hostedSubTab = 'storefront';
  const preRenderedBodyHtml = app.getHostedWebsiteViewHtml(store);

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
    /<div id="main-view-container">[\s\S]*?<\/div>(?=\s*<\/main>)/,
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
    host: "www.drugs.systems",
    key: "acsakhil2026indexnow",
    keyLocation: "https://www.drugs.systems/acsakhil2026indexnow.txt",
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

  // Generate live RSS Feed (feed.xml) for rapid Google/Bing feed indexing
  let rssXml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
  rssXml += `  <title>ACS Uttar Pradesh Pharmacy Network - Live Stores</title>\n`;
  rssXml += `  <link>${baseOrigin}</link>\n`;
  rssXml += `  <description>Live directory of licensed retail pharmacies and digital medicine stocks across Uttar Pradesh</description>\n`;
  rssXml += `  <language>en-in</language>\n`;
  rssXml += `  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
  rssXml += `  <atom:link href="${baseOrigin}/feed.xml" rel="self" type="application/rss+xml" />\n`;

  stores.forEach(store => {
    const sUrl = `${baseOrigin}/pharmacy/${store.slug}`;
    rssXml += `  <item>\n`;
    rssXml += `    <title>${store.name} (${store.district || 'UP'})</title>\n`;
    rssXml += `    <link>${sUrl}</link>\n`;
    rssXml += `    <guid isPermaLink="true">${sUrl}</guid>\n`;
    rssXml += `    <pubDate>${new Date().toUTCString()}</pubDate>\n`;
    rssXml += `    <description>${store.name} located at ${store.address}. Licensed retail pharmacy with live stock and Form 20/21 compliance.</description>\n`;
    rssXml += `  </item>\n`;
  });
  rssXml += `</channel>\n</rss>\n`;
  fs.writeFileSync(path.join(baseDir, 'feed.xml'), rssXml, 'utf8');
  // Pre-render root index.html with live directory for immediate Googlebot crawlability
  app.activeTab = 'landing';
  app.landingSubTab = 'gateway';
  const preRenderedLandingHtml = app.getLandingPageViewHtml();
  let preRenderedIndex = indexTemplate.replace(
    /<div id="main-view-container">[\s\S]*?<\/div>(?=\s*<\/main>)/,
    `<div id="main-view-container">\n${preRenderedLandingHtml}\n</div>`
  );
  fs.writeFileSync(path.join(baseDir, 'index.html'), preRenderedIndex, 'utf8');
  console.log(`Pre-rendered root index.html with ${stores.length} pharmacies (${preRenderedIndex.length} bytes)!`);

  // Generate public HTML Sitemap & Directory Hub (/sitemap.html and /pharmacy/index.html)
  const sitemapHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Uttar Pradesh Licensed Retail Pharmacy Directory & Drug Verification Portal | All Stores</title>
  <meta name="description" content="Official public registry of Uttar Pradesh retail pharmacies, UPPC registered pharmacists on duty, Form 20/21 drug licenses, and live verified medicine stocks across UP." />
  <link rel="canonical" href="${baseOrigin}/sitemap.html" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#f4f7fa] text-slate-800 p-6 md:p-12 antialiased">
  <div class="max-w-5xl mx-auto">
    <div class="mb-8 border-b border-slate-200 pb-5">
      <span class="text-xs font-bold text-[#135c7e] uppercase tracking-wider block mb-1">Official State Registry</span>
      <h1 class="text-3xl font-black text-slate-900">Uttar Pradesh Licensed Retail Pharmacy Directory</h1>
      <p class="text-slate-600 text-sm mt-1">Search, verify Form 20/21 drug licenses, and check registered UPPC pharmacists on duty across ${stores.length} verified chemist stores.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      ${stores.map(s => `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                UPPC Licensed Pharmacy
              </span>
              <span class="text-xs font-mono font-bold text-slate-500">${s.district}, UP</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 mb-1">
              <a href="/pharmacy/${s.slug}" class="text-[#135c7e] hover:underline">${s.name}</a>
            </h2>
            <p class="text-xs text-slate-500 mb-4">${s.address}</p>
            <div class="text-xs space-y-1.5 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div><strong class="text-slate-900">Form 20 Drug License:</strong> <span class="font-mono">${s.license20}</span></div>
              <div><strong class="text-slate-900">Form 21 Drug License:</strong> <span class="font-mono">${s.license21}</span></div>
              <div><strong class="text-slate-900">Chief Pharmacist:</strong> ${s.ownerName} (${(s.staff && s.staff[0] && s.staff[0].uppcRegNo) || 'UPPC-PH'})</div>
              <div><strong class="text-slate-900">Helpline / Order:</strong> ${s.phone}</div>
              <div><strong class="text-slate-900">Live Medicine Catalog:</strong> ${s.stocks.length} Verified In-Stock Medicines</div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <a href="/pharmacy/${s.slug}" class="font-bold text-[#135c7e] hover:underline flex items-center gap-1">
              Verify Store &amp; Medicine Stock &rarr;
            </a>
            <a href="/pharmacy/${s.slug}/audit" class="text-slate-500 hover:text-slate-800 underline">
              License Dossier
            </a>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="mt-12 text-center text-xs text-slate-500 border-t border-slate-200 pt-6">
      <a href="/" class="text-[#135c7e] font-bold hover:underline">&larr; Return to Central Portal Gateway</a>
    </div>
  </div>
</body>
</html>`;
  fs.writeFileSync(path.join(baseDir, 'sitemap.html'), sitemapHtml, 'utf8');
  fs.writeFileSync(path.join(baseDir, 'pharmacy', 'index.html'), sitemapHtml, 'utf8');
  console.log(`Generated public HTML sitemap & pharmacy index hub (/sitemap.html & /pharmacy/index.html)!`);

  // Call Google Indexing API automation
  try {
    const { notifyGoogleIndexing } = require('./google_indexing.js');
    notifyGoogleIndexing(allIndexedUrls).catch(e => {
      console.log('[Google Indexing API Notice]:', e.message);
    });
  } catch (e) {
    console.log('[Google Indexing API Skipped]:', e.message);
  }

  console.log('Static SEO Pre-rendering & Automated Indexing build completed successfully!');

