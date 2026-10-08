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

  // Test Connection Logic Fixes
  console.log('--- Testing Connection Logic & Data Integrity ---');
  console.log(`Prescriptions queue: ${currentStore.prescriptions.length} items`);
  console.log(`Schedule H1 register: ${currentStore.scheduleH1Register.length} records`);
  console.log(`Staff duty logs: ${currentStore.staffDutyLog.length} biometric entries`);
  console.log(`Purchase expenses: ${currentStore.purchaseExpenses.length} PO records`);
  console.log(`Cash memo transactions: ${currentStore.revenueData.transactions.length} receipts`);

  if (!currentStore.prescriptions || currentStore.prescriptions.length === 0) throw new Error('Prescriptions queue empty');
  if (!currentStore.scheduleH1Register || currentStore.scheduleH1Register.length === 0) throw new Error('Schedule H1 register empty');
  if (!currentStore.staffDutyLog || currentStore.staffDutyLog.length === 0) throw new Error('Duty log empty');
  if (!currentStore.purchaseExpenses || currentStore.purchaseExpenses.length === 0) throw new Error('Purchase expenses empty');
  if (!currentStore.revenueData.transactions || currentStore.revenueData.transactions.length === 0) throw new Error('Transactions empty');

  // Test Smart Excel / CSV Importer & Scanner Suite
  console.log('--- Testing Smart Excel/CSV Importer & Quick Scanner Suite ---');
  
  // 1. Test Delimited Text Parser
  const sampleCsvText = `Medicine Name,Salt,Batch No,Qty,Cost Price,MRP\n"Azithral 500mg, IP",Azithromycin,BAT-991,50,72.50,119.50\n"Pan-D",Pantoprazole,BAT-661,100,115.00,199.00`;
  const parsedTokens = app.parseDelimitedText(sampleCsvText);
  if (parsedTokens.length !== 3) throw new Error('parseDelimitedText failed: expected 3 rows, got ' + parsedTokens.length);
  if (parsedTokens[1][0] !== "Azithral 500mg, IP") throw new Error('parseDelimitedText quote preservation failed');
  console.log('parseDelimitedText successfully parsed CSV text with quoted commas!');

  // 2. Test Column Auto-Detection Synonyms
  const distributorHeaders = ["Item Description", "Composition", "Mfg Co", "Batch #", "Exp Date", "Closing Qty", "Pack", "Net PTR", "Max Retail Price", "Schedule Cat", "Shelf Location"];
  const detectedCols = app.detectColumnMapping(distributorHeaders);
  if (detectedCols.name !== 0) throw new Error('Failed to auto-detect name column');
  if (detectedCols.saltName !== 1) throw new Error('Failed to auto-detect salt column');
  if (detectedCols.manufacturer !== 2) throw new Error('Failed to auto-detect mfg column');
  if (detectedCols.batchNo !== 3) throw new Error('Failed to auto-detect batch column');
  if (detectedCols.expiryDate !== 4) throw new Error('Failed to auto-detect expiry column');
  if (detectedCols.quantity !== 5) throw new Error('Failed to auto-detect quantity column');
  if (detectedCols.purchaseRate !== 7) throw new Error('Failed to auto-detect purchaseRate column');
  if (detectedCols.mrp !== 8) throw new Error('Failed to auto-detect mrp column');
  if (detectedCols.schedule !== 9) throw new Error('Failed to auto-detect schedule column');
  if (detectedCols.rackLocation !== 10) throw new Error('Failed to auto-detect rack column');
  console.log('detectColumnMapping successfully recognized 100% of distributor headers!');

  // 3. Test Expiry Date Normalizer
  if (app.normalizeExpiryDate("2028-11-20") !== "2028-11-20") throw new Error('Date normalizer failed on YYYY-MM-DD');
  if (app.normalizeExpiryDate("20/11/2028") !== "2028-11-20") throw new Error('Date normalizer failed on DD/MM/YYYY');
  if (app.normalizeExpiryDate("11/28") !== "2028-11-28") throw new Error('Date normalizer failed on MM/YY');
  console.log('normalizeExpiryDate successfully normalized various date formats!');

  // 4. Test Smart Merge vs Append Import
  const existingMed = currentStore.stocks[0];
  const preImportQty = existingMed.quantity;
  const preStockLength = currentStore.stocks.length;

  const importRows = [
    [existingMed.name, existingMed.saltName, existingMed.manufacturer, existingMed.batchNo, "2028-12-31", "30", "Strips", "100", "150", "Schedule H", "Rack A-01"],
    ["Novamox 500 Capsule", "Amoxicillin 500mg", "Cipla", "BAT-NOV-7711", "2028-10-31", "40", "Strips", "65.00", "98.00", "Schedule H", "Rack B-03"]
  ];
  const colMap = {
    name: 0,
    saltName: 1,
    manufacturer: 2,
    batchNo: 3,
    expiryDate: 4,
    quantity: 5,
    unit: 6,
    purchaseRate: 7,
    mrp: 8,
    schedule: 9,
    rackLocation: 10
  };

  app.executeSmartStockImport(importRows, colMap, "MERGE");
  if (existingMed.quantity !== preImportQty + 30) throw new Error('Smart merge failed to increment matching batch stock');
  if (currentStore.stocks.length !== preStockLength + 1) throw new Error('Smart merge failed to append new SKU without duplicating existing');
  console.log('executeSmartStockImport ("MERGE" mode) successfully incremented existing stock & added new SKU!');

  // 5. Test Barcode Lookup
  app.lookupBarcodeInStock(existingMed.batchNo);
  console.log(`lookupBarcodeInStock("${existingMed.batchNo}") ran successfully!`);

  // 6. Test Racks & Bays Tools
  app.openRackManagerModal();
  console.log('openRackManagerModal() rendered successfully!');

  // 7. Test Column Customizer Modal
  app.openColumnCustomizerModal();
  console.log('openColumnCustomizerModal() rendered successfully!');

  console.log('ALL CONNECTION TESTS VERIFIED AND PASSED 100%!');
  console.log('ALL TESTS PASSED COMPLETELY WITHOUT ANY ERRORS!');
} catch (err) {
  console.error('ERROR during testing:', err);
  process.exit(1);
}
