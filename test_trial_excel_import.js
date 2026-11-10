const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = __dirname;
const dataCode = fs.readFileSync(path.join(baseDir, 'data.js'), 'utf8');
const appCode = fs.readFileSync(path.join(baseDir, 'app.js'), 'utf8');
const csvContent = fs.readFileSync(path.join(baseDir, 'trial_stock_10_medicines.csv'), 'utf8');

// Mock DOM & app environment
const storage = {};
const mockLocalStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

const mockElements = {
  'toast-container': { appendChild: () => {}, remove: () => {} },
  'modal-generic': { classList: { add: () => {}, remove: () => {} }, innerHTML: '', style: {}, addEventListener: () => {} },
  'main-view-container': { innerHTML: '' },
  'header-auth-controls': { innerHTML: '' },
  'portal-nav-bar': { classList: { add: () => {}, remove: () => {} } }
};

const mockDocument = {
  getElementById: (id) => mockElements[id] || { innerHTML: '', value: '', classList: { add: () => {}, remove: () => {} }, style: {}, addEventListener: () => {} },
  querySelector: () => ({ innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: () => ({ innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, remove: () => {} }),
  body: { classList: { add: () => {}, remove: () => {} } }
};

const mockWindow = {
  localStorage: mockLocalStorage,
  location: { pathname: '/', search: '', hash: '', origin: 'https://www.drugs.systems' },
  addEventListener: () => {},
  scrollTo: () => {},
  history: { pushState: () => {} },
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
vm.runInContext(dataCode, sandbox);
vm.runInContext(appCode, sandbox);
vm.runInContext('window.acsApp = new ACSApp();', sandbox);

const app = sandbox.window.acsApp;
const store = app.getCurrentStore();
console.log(`Initial stock count for ${store.name}: ${store.stocks.length}`);

// Step 1: Parse the CSV content using app's parseDelimitedText
const rawRows = app.parseDelimitedText(csvContent);
console.log(`Parsed rows: ${rawRows.length} (1 header + ${rawRows.length - 1} data rows)`);
if (rawRows.length !== 11) {
  throw new Error(`Expected 11 rows (1 header + 10 data), got ${rawRows.length}`);
}

// Step 2: Auto-detect column mapping
const headers = rawRows[0];
const colMap = app.detectColumnMapping(headers);
console.log('Auto-detected Column Mapping:');
console.log(colMap);

// Verify required columns are detected
const expectedMappings = ['name', 'saltName', 'manufacturer', 'batchNo', 'expiryDate', 'quantity', 'unit', 'purchaseRate', 'mrp', 'schedule', 'rackLocation', 'freeScheme'];
for (const col of expectedMappings) {
  if (colMap[col] === -1 || colMap[col] === undefined) {
    throw new Error(`Column '${col}' was not auto-detected!`);
  }
}
console.log('ALL 12 columns detected 100% automatically!');

// Step 3: Execute Smart Stock Import
const initialCount = store.stocks.length;
const dataRows = rawRows.slice(1);
app.executeSmartStockImport(dataRows, colMap, 'ADD');

const newCount = store.stocks.length;
console.log(`Updated stock count: ${newCount} (Added: ${newCount - initialCount})`);

if (newCount !== initialCount + 10) {
  throw new Error(`Expected ${initialCount + 10} medicines, but found ${newCount}`);
}

// Step 4: Verify each of the 10 trial medicines is in the database
const trialNames = [
  "Dolo 650 Tablet",
  "Pan 40 Tablet",
  "Azithral 500 Tablet",
  "Montek LC Tablet",
  "Glycomet GP 1 Tablet",
  "Telma 40 Tablet",
  "Shelcal 500 Tablet",
  "Cefix 200 Tablet",
  "Ascoril D Plus Syrup",
  "Becosules Z Capsule"
];

for (const medName of trialNames) {
  const found = store.stocks.find(m => m.name === medName);
  if (!found) {
    throw new Error(`Imported medicine '${medName}' not found in stock!`);
  }
  console.log(`  ✓ Verified: ${found.name} | Batch: ${found.batchNo} | Qty: ${found.quantity} | Buy: ₹${found.purchaseRate} | MRP: ₹${found.mrp} | Sched: ${found.schedule} | Rack: ${found.rackLocation} | Scheme: ${found.freeScheme || 'None'}`);
}

// Step 5: Verify rendering in hosted website view
app.activeTab = 'hosted-site';
const hostedHtml = app.getHostedWebsiteViewHtml(store);
for (const medName of trialNames) {
  if (!hostedHtml.includes(medName)) {
    throw new Error(`Medicine '${medName}' missing from public website storefront HTML!`);
  }
}
console.log('All 10 trial medicines verified and successfully rendered on the live website catalog!');
console.log('EXCEL & CSV TRIAL TEST COMPLETED WITH 100% SUCCESS!');
