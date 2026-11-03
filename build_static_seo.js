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
  const aliasesMap = {
    "store-up-001": [
      "Deoria Drug House",
      "देवरिया ड्रग हाउस",
      "Deoria Drug House Akhil",
      "Akhileshwar Tripathi",
      "अखिलेश्वर त्रिपाठी देवरिया",
      "Akhil Chemist Deoria",
      "Station Road Chemist Deoria",
      "Subhash Chowk Medical Store",
      "Deoria Medical Store",
      "Deoria Drug House UPPC",
      "Akhileshwar Tripathi Medical Store"
    ],
    "store-up-002": [
      "Maa Vindhyavasini Medicos & Healthcare",
      "मां विंध्यवासिनी मेडिकोज",
      "Maa Vindhyavasini Medical Store",
      "Dr S K Mishra Chemist Deoria",
      "Raghav Nagar Chemist Deoria",
      "CC Road Medical Store Deoria"
    ],
    "store-up-003": [
      "Kushwaha Medical Store & Surgical",
      "कुशवाहा मेडिकल स्टोर",
      "M P Kushwaha Chemist",
      "Civil Lines Medical Store Deoria",
      "Sadar Hospital Chemist Deoria",
      "Devraha Baba Medical College Chemist"
    ],
    "store-up-004": [
      "Raghav Chemist & Druggists",
      "राघव केमिस्ट देवरिया",
      "Ramesh Chandra Verma Chemist",
      "Malviya Road Chemist Deoria",
      "Ram Gulam Tola Medical Store"
    ],
    "store-up-005": [
      "Ganga Medical Hall & Healthcare",
      "गंगा मेडिकल हॉल कानपुर",
      "Alok Kumar Gupta Chemist",
      "Mall Road Chemist Kanpur",
      "Phoolbagh Medical Store Kanpur"
    ],
    "store-up-006": [
      "Awadh Care Chemist & Surgical",
      "अवध केयर केमिस्ट लखनऊ",
      "Syed Mohammad Rizvi Chemist",
      "Hazratganj Chemist Lucknow",
      "Civil Hospital Medical Store Lucknow"
    ]
  };

  const alternateNames = aliasesMap[store.id] || [
    store.name,
    `${store.name} ${store.district}`,
    store.ownerName ? `${store.ownerName} Medical Store` : ""
  ];

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

  // Generate Store Schema.org JSON-LD with Rich Results Graph (Pharmacy + Breadcrumbs + FAQs + Medicine Catalog)
  const storeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Pharmacy", "LocalBusiness", "MedicalBusiness"],
        "@id": `${storeUrl}#pharmacy`,
        "name": store.name,
        "alternateName": alternateNames,
        "legalName": `${store.name} (Prop. ${store.ownerName})`,
        "url": storeUrl,
        "telephone": store.phone,
        "email": store.email,
        "image": [
          store.photoUrl,
          ...(store.galleryPhotos ? store.galleryPhotos.map(p => p.url) : [])
        ].filter(Boolean),
        "priceRange": "₹₹",
        "currenciesAccepted": "INR",
        "paymentAccepted": "Cash, UPI, Credit Card, Debit Card, Net Banking",
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
          "latitude": store.city === 'Kanpur Nagar' ? 26.4670 : store.city === 'Lucknow' ? 26.8467 : 26.5024,
          "longitude": store.city === 'Kanpur Nagar' ? 80.3500 : store.city === 'Lucknow' ? 80.9462 : 83.7791
        },
        "founder": {
          "@type": "Person",
          "name": store.ownerName,
          "jobTitle": "Chief Pharmacist & Store Owner"
        },
        "employee": {
          "@type": "Person",
          "name": store.ownerName,
          "jobTitle": "Registered Dispensing Pharmacist",
          "identifier": (store.staff && store.staff[0] && store.staff[0].uppcRegNo) ? store.staff[0].uppcRegNo : "UPPC Verified"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": `${store.name} Verified Medicine Catalog`,
          "itemListElement": (store.stocks || []).map(med => ({
            "@type": "Offer",
            "itemOffered": {
              "@type": "Drug",
              "name": med.name,
              "activeIngredient": med.saltName,
              "dosageForm": med.unit,
              "manufacturer": {
                "@type": "Organization",
                "name": med.manufacturer
              }
            },
            "price": med.mrp,
            "priceCurrency": "INR",
            "availability": med.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }))
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${storeUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "ACS Network",
            "item": "https://www.drugs.systems/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Uttar Pradesh",
            "item": "https://www.drugs.systems/"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": store.district,
            "item": "https://www.drugs.systems/"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": store.name,
            "item": storeUrl
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${storeUrl}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Is ${store.name} a government-licensed pharmacy in ${store.district}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Yes. ${store.name} is licensed by the Food Safety and Drug Administration (FSDA) Uttar Pradesh under Form 20 (${store.license20}) and Form 21 (${store.license21}) for retail dispensation of genuine ethical medicines.`
            }
          },
          {
            "@type": "Question",
            "name": `Who is the registered pharmacist at ${store.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${store.ownerName} is the registered pharmacist on duty, verified under Section 42 of the Pharmacy Act 1948 with the Uttar Pradesh Pharmacy Council (UPPC).`
            }
          },
          {
            "@type": "Question",
            "name": `What is the address and contact number of ${store.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${store.name} is located at ${store.address}. Phone: ${store.phone}. Open daily ${store.operatingHours}.`
            }
          },
          {
            "@type": "Question",
            "name": `Can I check live medicine stock at ${store.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Yes. You can verify available medicine stocks, verified retail MRPs, active generic salts, and batch details live on the official portal at ${storeUrl}.`
            }
          }
        ]
      }
    ]
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
  console.log(`Generated live RSS Feed: feed.xml with ${stores.length} items!`);

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

