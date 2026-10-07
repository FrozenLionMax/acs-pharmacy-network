const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoDir = 'c:\\Users\\Acer\\Desktop\\medical data';
const dataCode = fs.readFileSync(path.join(repoDir, 'data.js'), 'utf8');
const appCode = fs.readFileSync(path.join(repoDir, 'app.js'), 'utf8');

// Create mock environment
const storage = {};
const mockLocalStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
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
  querySelector: (sel) => ({ innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
  querySelectorAll: (sel) => [],
  addEventListener: () => {},
  createElement: (tag) => ({ innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, remove: () => {} }),
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
  setTimeout: (fn) => setTimeout(fn, 0),
  setInterval: () => {},
  clearInterval: () => {},
  clearTimeout: () => {},
  URLSearchParams: class {
    constructor() {}
    get() { return null; }
  }
};

vm.createContext(sandbox);

try {
  vm.runInContext(dataCode.replace("const INITIAL_STORES_DATA", "var INITIAL_STORES_DATA"), sandbox);
  console.log('data.js executed successfully! Stores loaded:', sandbox.INITIAL_STORES_DATA.length);

  vm.runInContext(appCode, sandbox);
  console.log('app.js loaded successfully!');

  const ACSAppClass = vm.runInContext("ACSApp", sandbox);
  const app = new ACSAppClass();
  sandbox.window.acsApp = app;
  console.log('ACSApp instantiated successfully! Store count:', app.stores.length);

  // Test rendering all views
  const landingHtml = app.getLandingPageViewHtml();
  console.log('getLandingPageViewHtml() rendered successfully! Length:', landingHtml.length);

  app.setLandingSubTab('showcase');
  const showcaseHtml = app.getLandingPageViewHtml();
  console.log('Showcase subtab rendered successfully! Length:', showcaseHtml.length);

  const currentStore = app.getCurrentStore();
  console.log('Testing with store:', currentStore.name, 'slug:', currentStore.slug);

  const storeDetailHtml = app.getStoreDetailViewHtml(currentStore);
  console.log('getStoreDetailViewHtml() rendered successfully! Length:', storeDetailHtml.length);

  const hostedHtml = app.getHostedWebsiteViewHtml(currentStore);
  console.log('getHostedWebsiteViewHtml() rendered successfully! Length:', hostedHtml.length);

  app.hostedSubTab = 'audit-dossier';
  const hostedAuditHtml = app.getHostedWebsiteViewHtml(currentStore);
  console.log('Hosted audit dossier rendered successfully! Length:', hostedAuditHtml.length);

  const stocksHtml = app.getStocksViewHtml(currentStore);
  console.log('getStocksViewHtml() rendered successfully! Length:', stocksHtml.length);

  // Test stock horizon filter
  app.setStockHorizonFilter('EXPIRING');
  const expiringStocksHtml = app.getStocksViewHtml(currentStore);
  console.log('Stock horizon EXPIRING filter rendered successfully! Length:', expiringStocksHtml.length);

  app.setStockHorizonFilter('LOW_STOCK');
  const lowStocksHtml = app.getStocksViewHtml(currentStore);
  console.log('Stock horizon LOW_STOCK filter rendered successfully! Length:', lowStocksHtml.length);

  const staffHtml = app.getStaffViewHtml(currentStore);
  console.log('getStaffViewHtml() rendered successfully! Length:', staffHtml.length);

  // Test toggle staff duty
  if (currentStore.staff.length > 0) {
    const sId = currentStore.staff[0].id;
    const initialDuty = currentStore.staff[0].isOnDuty;
    app.toggleStaffDuty(sId);
    console.log(`Toggled staff duty for ${currentStore.staff[0].name}: was ${initialDuty}, now ${currentStore.staff[0].isOnDuty}`);
  }

  const revenueHtml = app.getRevenueViewHtml(currentStore);
  console.log('getRevenueViewHtml() rendered successfully! Length:', revenueHtml.length);

  const directoryHtml = app.getDirectoryViewHtml();
  console.log('getDirectoryViewHtml() rendered successfully! Length:', directoryHtml.length);

  const verifyHtml = app.getVerifyViewHtml();
  console.log('getVerifyViewHtml() rendered successfully! Length:', verifyHtml.length);

  // Test QR generator
  const qrSvg = app.generateQrSvg('https://acs.up.gov.in/pharmacy/anand-chemist', 140);
  console.log('generateQrSvg() generated valid SVG! Length:', qrSvg.length, 'Contains <svg>:', qrSvg.includes('<svg'));

  // Test Bulk Margin
  const initialMrp = currentStore.stocks[0].mrp;
  app.applyBulkMargin(30, 'ALL');
  console.log(`Bulk margin applied! First item MRP changed from ${initialMrp} to ${currentStore.stocks[0].mrp}`);

  // Test PO Restock
  const initialQty = currentStore.stocks[0].quantity;
  app.handlePoRestock(currentStore.id);
  console.log(`PO Restock simulated! First item Qty updated from ${initialQty} to ${currentStore.stocks[0].quantity}`);

  console.log('ALL TESTS PASSED COMPLETELY WITHOUT ANY ERRORS!');
} catch (err) {
  console.error('ERROR during testing:', err);
  process.exit(1);
}
