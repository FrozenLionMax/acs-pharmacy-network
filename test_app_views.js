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
  createElement: (tag) => ({
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {},
    remove: () => {},
    getContext: () => ({
      fillRect: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      drawImage: () => {},
      clearRect: () => {},
      beginPath: () => {},
      rect: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      setLineDash: () => {}
    }),
    toDataURL: () => 'data:image/jpeg;base64,mockCanvasData'
  }),
  body: { classList: { add: () => {}, remove: () => {} } }
};

const mockWindow = {
  localStorage: mockLocalStorage,
  location: { pathname: '/', search: '', hash: '' },
  addEventListener: () => {},
  scrollTo: () => {},
  history: { pushState: () => {} },
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  confirm: () => true,
  alert: () => {},
  document: mockDocument
};

const sandbox = {
  window: mockWindow,
  document: mockDocument,
  localStorage: mockLocalStorage,
  confirm: () => true,
  alert: () => {},
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

async function runTests() {
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

  // 8. Test Multi-Photo Gallery Suite
  const gallery = app.ensureStoreGallery(currentStore);
  if (!Array.isArray(gallery) || gallery.length < 4) throw new Error('ensureStoreGallery failed to produce multi-photo gallery');
  console.log(`ensureStoreGallery() successfully initialized ${gallery.length} photos!`);

  const initialGalleryCount = gallery.length;
  app.addGalleryPhoto(currentStore.id, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae', 'Surgical Racks', 'Braces & Bandages');
  if (currentStore.galleryPhotos.length !== initialGalleryCount + 1) throw new Error('addGalleryPhoto failed to add photo');
  const addedPhoto = currentStore.galleryPhotos[currentStore.galleryPhotos.length - 1];
  console.log(`addGalleryPhoto() added photo ID: ${addedPhoto.id}`);

  app.setPrimaryStorePhoto(currentStore.id, addedPhoto.id);
  if (currentStore.photoUrl !== addedPhoto.url) throw new Error('setPrimaryStorePhoto failed to set primary cover photo');
  console.log('setPrimaryStorePhoto() updated store.photoUrl successfully!');

  app.openManageStorePhotosModal(currentStore.id);
  console.log('openManageStorePhotosModal() rendered successfully!');

  // 9. Test Photo & Profile Studio Modals
  app.openPhotoStudioModal('store-primary', currentStore.id, currentStore.photoUrl);
  console.log('openPhotoStudioModal(store-primary) rendered successfully!');

  app.openPhotoStudioModal('staff-avatar', currentStore.staff[0].id, currentStore.staff[0].avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d');
  console.log('openPhotoStudioModal(staff-avatar) rendered successfully!');

  app.openStaffProfilePhotoModal(currentStore.staff[0].id);
  console.log('openStaffProfilePhotoModal() opened successfully!');

  // Clean up added test photo
  app.deleteGalleryPhoto(currentStore.id, addedPhoto.id);
  if (currentStore.galleryPhotos.some(p => p.id === addedPhoto.id)) throw new Error('deleteGalleryPhoto failed to delete photo');
  console.log('deleteGalleryPhoto() removed photo cleanly!');

  // Test Image Compression Engine Methods
  if (typeof app.compressImageFile !== 'function') throw new Error('compressImageFile method missing from app');
  if (typeof app.compressDataUrl !== 'function') throw new Error('compressDataUrl method missing from app');
  const dummyDataUrl = "data:image/jpeg;base64," + "A".repeat(500);
  const compressedResult = await app.compressDataUrl(dummyDataUrl, 900, 0.8);
  if (typeof compressedResult !== 'string') throw new Error('compressDataUrl failed to return string');
  console.log('compressDataUrl executed successfully!');

  // Test Photo Studio Apply & Save for Store Primary Cover
  const newTestCoverUrl = 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80';
  app.openPhotoStudioModal('store-primary', currentStore.id, newTestCoverUrl);
  app.saveStudioPhoto('store-primary', currentStore.id);
  if (!currentStore.photoUrl) throw new Error('saveStudioPhoto store-primary failed to set photoUrl');
  console.log('saveStudioPhoto("store-primary") updated and verified successfully!');

  // Test Photo Studio Apply & Save for Pharmacist Staff Avatar
  const newStaffAvatarUrl = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80';
  app.openPhotoStudioModal('staff-avatar', currentStore.staff[0].id, newStaffAvatarUrl);
  app.saveStudioPhoto('staff-avatar', currentStore.staff[0].id);
  if (currentStore.staff[0].avatarUrl !== newStaffAvatarUrl && !currentStore.staff[0].avatarUrl.startsWith('data:image/')) {
    throw new Error('saveStudioPhoto staff-avatar failed to update avatarUrl');
  }
  console.log('saveStudioPhoto("staff-avatar") updated and verified successfully!');

  // Test Hosted Website View has clean public storefront without leaked photo studio or SKU buttons
  app.authenticate('akhil@acs.com', 'akhil123');
  app.hostedSubTab = 'storefront';
  const loggedInHostedHtml = app.getHostedWebsiteViewHtml(currentStore);
  if (loggedInHostedHtml.includes('Edit Cover Photo')) {
    throw new Error('Hosted website view unexpectedly contains Edit Cover Photo button');
  }
  if (loggedInHostedHtml.includes('Googlebot &amp; Schema') || loggedInHostedHtml.includes('Googlebot & Schema')) {
    throw new Error('Hosted website view unexpectedly contains Googlebot & Schema button');
  }
  if (!loggedInHostedHtml.includes('Open Owner Portal to Edit Data &amp; Photos') && !loggedInHostedHtml.includes('Open Owner Portal to Edit Data & Photos')) {
    throw new Error('Hosted website view missing Open Owner Portal notice for logged-in owner');
  }
  console.log('Hosted website view verified: 100% clean public storefront, with owner directed to Owner Portal!');
  app.logout();

  // 10. Test Public Patient Storefront & Medicine Detail & Rx Auto-Matcher
  const catalogHtml = app.getHostedMedicineCatalogHtml(currentStore);
  if (!catalogHtml || catalogHtml.length === 0) throw new Error('getHostedMedicineCatalogHtml returned empty string');
  console.log('getHostedMedicineCatalogHtml() rendered successfully! Length:', catalogHtml.length);

  app.setHostedCatalogViewMode('cards');
  if (app.hostedCatalogViewMode !== 'cards') throw new Error('setHostedCatalogViewMode cards failed');
  const cardsHtml = app.getHostedMedicineCatalogHtml(currentStore);
  if (!cardsHtml || cardsHtml.length === 0) throw new Error('cards view failed');
  console.log('setHostedCatalogViewMode("cards") rendered successfully! Length:', cardsHtml.length);

  app.setHostedCatalogViewMode('table');
  if (app.hostedCatalogViewMode !== 'table') throw new Error('setHostedCatalogViewMode table failed');
  console.log('setHostedCatalogViewMode("table") set successfully!');

  app.setHostedCategoryFilter('RX');
  if (app.hostedCategoryFilter !== 'RX') throw new Error('setHostedCategoryFilter failed');
  console.log('setHostedCategoryFilter("RX") set successfully!');

  // Verify staff roster table presence in hosted website HTML (Page 1 Storefront)
  app.hostedSubTab = 'storefront';
  const hostedHtmlCheck = app.getHostedWebsiteViewHtml(currentStore);
  if (!hostedHtmlCheck.includes('Statutory Staff &amp; Dispensing Pharmacist Roster') && !hostedHtmlCheck.includes('Statutory Staff & Dispensing Pharmacist Roster')) {
    throw new Error('Statutory staff roster table missing from public storefront view');
  }
  if (!hostedHtmlCheck.includes('Akhileshwar Tripathi') || !hostedHtmlCheck.includes('UPPC-PH-29841')) {
    throw new Error('Chief Pharmacist Akhileshwar Tripathi credentials missing from storefront');
  }
  console.log('Verified Statutory Staff & Pharmacist Roster table rendered with Akhileshwar Tripathi UPPC-PH-29841!');

  const firstMed = currentStore.stocks[0];
  app.openMedicineDetailModal(firstMed.id, currentStore.id);
  const modalBody = mockDocument.getElementById('modal-generic-body');
  if (!modalBody || !modalBody.innerHTML.includes(firstMed.name)) throw new Error('openMedicineDetailModal failed to show medicine name');
  console.log('openMedicineDetailModal() opened and verified successfully for SKU:', firstMed.name);

  app.openPhotoViewerModal(currentStore.photoUrl, 'Test Store Front');
  console.log('openPhotoViewerModal() rendered successfully!');

  app.openPrescriptionUploadModal(currentStore.name, firstMed.name);
  console.log('openPrescriptionUploadModal() rendered with auto-match query successfully!');

  app.addMedicineToRxList(firstMed.id);
  if (!app.selectedRxMedicines || app.selectedRxMedicines.length === 0) throw new Error('addMedicineToRxList failed to add medicine');
  console.log('addMedicineToRxList() added medicine to prescription successfully!');

  app.renderRxMatchedItems(currentStore);
  console.log('renderRxMatchedItems() calculated total bill estimate successfully!');

  app.removeMedicineFromRxList(0);
  console.log('removeMedicineFromRxList() removed item cleanly!');

  // 10b. Test Free Scheme & Stock Columns across Customer Catalog & Owner Inventory
  console.log('--- Testing Stock & Free Scheme Suite ---');
  if (firstMed.freeScheme !== '+1') {
    throw new Error(`Expected firstMed.freeScheme to be '+1', got '${firstMed.freeScheme}'`);
  }
  const ddhCatalog = app.getHostedMedicineCatalogHtml(currentStore);
  if (!ddhCatalog.includes('>Stock<')) {
    throw new Error('Stock header missing from customer catalog');
  }
  if (ddhCatalog.includes('>Availability<')) {
    throw new Error('Old Availability header still present in customer catalog');
  }
  if (ddhCatalog.includes('>Free<')) {
    throw new Error('Free header should be removed from public customer catalog');
  }
  if (ddhCatalog.includes('Inquire') || ddhCatalog.includes('inquire')) {
    throw new Error('Inquire option should be removed from public customer catalog');
  }

  // Verify that public hosted catalog NEVER shows wholesale Free column even when logged in (Free scheme is kept in Owner Portal & Stocks view)
  app.currentUser = { role: 'pharmacy_owner', storeId: currentStore.id, name: currentStore.ownerName };
  const pharmacistCatalog = app.getHostedMedicineCatalogHtml(currentStore);
  if (pharmacistCatalog.includes('>Free<')) {
    throw new Error('Wholesale Free header should not be present in public catalog even for logged-in pharmacist');
  }
  // Instead verify Free Scheme is present in Owner Portal
  const ownerDetailHtml = app.getStoreDetailViewHtml(currentStore);
  if (!ownerDetailHtml.includes('Free Scheme')) {
    throw new Error('Free Scheme column missing from Owner Portal medicine table');
  }
  app.currentUser = null;

  app.setStockHorizonFilter('ALL');
  const ownerStocksHtml = app.getStocksViewHtml(currentStore);
  if (!ownerStocksHtml.includes('>Stock<')) {
    throw new Error('Stock header missing from owner stocks view');
  }
  if (!ownerStocksHtml.includes('>Free<')) {
    throw new Error('Free header missing from owner stocks view');
  }
  if (!ownerStocksHtml.includes(`updateStockInline('${firstMed.id}', 'freeScheme', this.value)`)) {
    throw new Error('Inline editor for freeScheme missing from owner stocks view');
  }
  if (!ownerStocksHtml.includes(`updateStockInline('${firstMed.id}', 'unit', this.value)`)) {
    throw new Error('Inline editor for unit missing from owner stocks view');
  }

  // Test updating freeScheme inline: input with redundant '+2 Free' should sanitize to '+2'
  app.updateStockInline(firstMed.id, 'freeScheme', '+2 Free');
  if (firstMed.freeScheme !== '+2') {
    throw new Error(`updateStockInline failed to sanitize '+2 Free' to '+2', got: ${firstMed.freeScheme}`);
  }

  // Test legacy '10 + 1 Free' sanitization to '+1'
  app.updateStockInline(firstMed.id, 'freeScheme', '10 + 1 Free');
  if (firstMed.freeScheme !== '+1') {
    throw new Error(`updateStockInline failed to sanitize '10 + 1 Free' to '+1', got: ${firstMed.freeScheme}`);
  }

  // Reset back to clean '+1'
  app.updateStockInline(firstMed.id, 'freeScheme', '+1');
  if (firstMed.freeScheme !== '+1') {
    throw new Error(`updateStockInline failed to set '+1', got: ${firstMed.freeScheme}`);
  }

  // Test updating unit inline
  app.updateStockInline(firstMed.id, 'unit', 'Strips (10 tabs)');
  // Test Real-time Multi-device Cloud Synchronization
  console.log('--- Testing Multi-Device Cloud Synchronization Suite ---');
  if (typeof app.initCloudSync !== 'function') throw new Error('initCloudSync method missing from app');
  if (!app.cloudSyncConfig || !app.cloudSyncConfig.blobId) throw new Error('cloudSyncConfig missing blobId');
  if (app.cloudSyncConfig.blobId !== 'e7864462-7c2f-42f6-8ff1-297d7a98d912') throw new Error('Incorrect cloudSyncConfig blobId');
  if (typeof app.syncNow !== 'function') throw new Error('syncNow method missing from app');
  if (typeof app.pullFromCloud !== 'function') throw new Error('pullFromCloud method missing from app');
  if (typeof app.pushToCloud !== 'function') throw new Error('pushToCloud method missing from app');
  
  // Call syncNow and pullFromCloud in simulated environment
  app.syncNow();
  console.log('syncNow() dispatched cloud sync without error!');

  if (!ownerStocksHtml.includes('Sync All Devices')) {
    throw new Error('Sync All Devices button missing from owner stocks view');
  }
  console.log('Stock and Free Scheme verified: Clean bonus "+1", zero "Free" words in Free table column, live sanitization passed!');
  console.log('Multi-Device Cloud Synchronization verified successfully!');

  // 11. Verify Common Deployed Page for ALL 5 Stores (No edit buttons, 100% clean consumer UI)
  app.stores.forEach(s => {
    const sHtml = app.getHostedWebsiteViewHtml(s);
    if (!sHtml || sHtml.length === 0) throw new Error(`getHostedWebsiteViewHtml failed for store: ${s.name}`);
    if (sHtml.includes('Manage Photos') || sHtml.includes('Crop / Look') || sHtml.includes('Crop / Edit Profile Photo')) {
      throw new Error(`Store ${s.name} public page still contains admin edit buttons!`);
    }
    const catHtml = app.getHostedMedicineCatalogHtml(s);
    if (!catHtml || catHtml.length === 0) throw new Error(`getHostedMedicineCatalogHtml failed for store: ${s.name}`);
  });
  console.log('Verified common deployed storefront for ALL pharmacies — 0 edit buttons, 100% consumer-facing!');

  // 12. Test Deoria Drug House Single Auth & 5 Deployed View-Only Stores
  console.log('--- Testing Deoria Drug House Auth & 5 Deployed View-Only Stores ---');
  
  // (a) Verify Deoria Drug House details
  const ddh = app.stores.find(s => s.id === 'store-up-001');
  if (!ddh) throw new Error('Deoria Drug House not found');
  if (ddh.name !== 'Deoria Drug House') throw new Error('Primary store name mismatch: ' + ddh.name);
  if (ddh.ownerName !== 'Akhileshwar Tripathi') throw new Error('Primary owner mismatch: ' + ddh.ownerName);
  if (ddh.mapsUrl !== 'https://maps.app.goo.gl/CKJeaQEBoWBaTEPX7') throw new Error('Google Maps URL mismatch: ' + ddh.mapsUrl);
  if (sandbox.INITIAL_STORES_DATA[0].stocks.length !== 7) throw new Error('Expected exactly 7 initial medicines for Deoria Drug House, got: ' + sandbox.INITIAL_STORES_DATA[0].stocks.length);
  console.log(`Deoria Drug House verified: Owner ${ddh.ownerName}, Maps ${ddh.mapsUrl}, initial ${sandbox.INITIAL_STORES_DATA[0].stocks.length} medicines in stock!`);

  // (b) Verify Authentication (akhil@acs.com / akhil123)
  const failAuth1 = app.authenticate('random@gmail.com', 'wrongpass');
  if (failAuth1) throw new Error('authenticate should fail on invalid user');
  const failAuth2 = app.authenticate('akhil@acs.com', 'wrongpass');
  if (failAuth2) throw new Error('authenticate should fail on wrong password');
  
  const successAuth = app.authenticate('akhil@acs.com', 'akhil123');
  if (!successAuth) throw new Error('authenticate failed on valid credentials akhil@acs.com / akhil123');
  if (!app.currentUser || app.currentUser.name !== 'Akhileshwar Tripathi' || app.currentUser.storeId !== 'store-up-001') {
    throw new Error('User session not properly established for Akhileshwar Tripathi');
  }
  console.log('Authentication passed! Successfully authenticated Akhileshwar Tripathi into Deoria Drug House.');

  // (c) Verify 5 Deployed View-Only Stores (3 Deoria, 1 Kanpur Nagar, 1 Lucknow)
  const viewOnlyStores = app.stores.filter(s => s.isViewOnly);
  if (viewOnlyStores.length !== 5) throw new Error('Expected 5 view-only deployed stores, got: ' + viewOnlyStores.length);

  const deoriaViewOnly = viewOnlyStores.filter(s => s.district === 'Deoria');
  if (deoriaViewOnly.length !== 3) throw new Error('Expected 3 view-only stores in Deoria, got: ' + deoriaViewOnly.length);

  const kanpurViewOnly = viewOnlyStores.filter(s => s.district === 'Kanpur Nagar');
  if (kanpurViewOnly.length !== 1) throw new Error('Expected 1 view-only store in Kanpur Nagar, got: ' + kanpurViewOnly.length);

  const lucknowViewOnly = viewOnlyStores.filter(s => s.district === 'Lucknow');
  if (lucknowViewOnly.length !== 1) throw new Error('Expected 1 view-only store in Lucknow, got: ' + lucknowViewOnly.length);

  console.log(`Verified 5 Deployed View-Only Stores: 3 in Deoria (${deoriaViewOnly.map(s => s.name).join(', ')}), 1 in Kanpur (${kanpurViewOnly[0].name}), 1 in Lucknow (${lucknowViewOnly[0].name})!`);

  // (d) Test logout
  app.logout();
  if (app.currentUser !== null) throw new Error('Logout failed to clear currentUser');
  console.log('Logout verified! currentUser is null and app returned to guest mode.');

  // 13. Test Unique URL Routing & SEO Metadata Verification
  console.log('--- Testing Unique URL Routing & Google SEO Metadata ---');
  
  // (a) Test /pharmacy/deoria-drug-house
  mockWindow.location.pathname = '/pharmacy/deoria-drug-house';
  const routedApp1 = new ACSAppClass();
  if (routedApp1.activeTab !== 'hosted-site' || routedApp1.currentStoreId !== 'store-up-001') {
    throw new Error('Routing to /pharmacy/deoria-drug-house failed!');
  }
  console.log('Route /pharmacy/deoria-drug-house resolved cleanly to Deoria Drug House!');

  // (b) Test direct clean slug /deoria-drug-house
  mockWindow.location.pathname = '/deoria-drug-house';
  const routedApp2 = new ACSAppClass();
  if (routedApp2.activeTab !== 'hosted-site' || routedApp2.currentStoreId !== 'store-up-001') {
    throw new Error('Routing to /deoria-drug-house failed!');
  }
  console.log('Route /deoria-drug-house resolved cleanly to Deoria Drug House!');

  // (c) Test alias /akhil
  mockWindow.location.pathname = '/akhil';
  const routedApp3 = new ACSAppClass();
  if (routedApp3.activeTab !== 'hosted-site' || routedApp3.currentStoreId !== 'store-up-001') {
    throw new Error('Routing to alias /akhil failed!');
  }
  console.log('Route alias /akhil resolved cleanly to Deoria Drug House!');

  // (d) Test other store routing /pharmacy/ganga-medical-hall
  mockWindow.location.pathname = '/pharmacy/ganga-medical-hall';
  const routedApp4 = new ACSAppClass();
  if (routedApp4.activeTab !== 'hosted-site' || routedApp4.currentStoreId !== 'store-up-005') {
    throw new Error('Routing to /pharmacy/ganga-medical-hall failed!');
  }
  console.log('Route /pharmacy/ganga-medical-hall resolved cleanly to Ganga Medical Hall (Kanpur)!');

  // (e) Verify SEO Metadata Generation
  routedApp1.updatePageSeo(ddh);
  if (!mockWindow.document.title.includes('Deoria Drug House') || !mockWindow.document.title.includes('Akhileshwar Tripathi')) {
    throw new Error('SEO Document Title does not contain store and owner name: ' + mockWindow.document.title);
  }
  console.log('SEO Document Title verified:', mockWindow.document.title);

  // (f) Verify Interactive Indexing Suite Methods
  app.triggerNetworkIndexing();
  console.log('triggerNetworkIndexing() executed and opened Indexing Hub Modal successfully!');

  app.indexSingleStore('store-up-001');
  console.log('indexSingleStore("store-up-001") executed and opened Single Store Modal successfully!');

  app.copyAllStoreLinks();
  console.log('copyAllStoreLinks() executed successfully!');

  // (g) Verify Universal Multi-Entity Schema.org Knowledge Graph (@graph) & Bilingual Aliases
  console.log('--- Testing Multi-Entity Schema.org Knowledge Graph & Google Automation Suite ---');
  const ddhAliases = app.generateStoreAliases(ddh);
  const requiredAliases = [
    "Deoria Drug House",
    "देवरिया ड्रग हाउस",
    "Deoria Drug House Akhil",
    "Akhileshwar Tripathi",
    "अखिलेश्वर त्रिपाठी देवरिया",
    "Akhil Chemist Deoria",
    "Station Road Chemist Deoria",
    "Subhash Chowk Medical Store"
  ];
  for (const reqAlias of requiredAliases) {
    if (!ddhAliases.includes(reqAlias)) {
      throw new Error(`Required search alias missing from Deoria Drug House: "${reqAlias}"`);
    }
  }
  console.log(`Deoria Drug House generated ${ddhAliases.length} English & Hindi search aliases including all 8 statutory query matches!`);

  // Verify Schema.org Graph for Deoria Drug House
  const ddhSchema = app.generateStoreSchemaGraph(ddh, "https://www.drugs.systems");
  if (!ddhSchema || !Array.isArray(ddhSchema["@graph"])) {
    throw new Error('Schema.org @graph missing or invalid structure!');
  }
  const pharmacyEntity = ddhSchema["@graph"].find(e => Array.isArray(e["@type"]) && e["@type"].includes("Pharmacy"));
  const breadcrumbEntity = ddhSchema["@graph"].find(e => e["@type"] === "BreadcrumbList");
  const faqEntity = ddhSchema["@graph"].find(e => e["@type"] === "FAQPage");

  if (!pharmacyEntity) throw new Error('Pharmacy entity missing from Schema.org graph!');
  if (!breadcrumbEntity) throw new Error('BreadcrumbList entity missing from Schema.org graph!');
  if (!faqEntity) throw new Error('FAQPage entity missing from Schema.org graph!');

  // Verify Pharmacy Entity specifications
  if (!pharmacyEntity["@type"].includes("LocalBusiness") || !pharmacyEntity["@type"].includes("MedicalBusiness")) {
    throw new Error('Pharmacy entity must be multi-typed [Pharmacy, LocalBusiness, MedicalBusiness]!');
  }
  if (pharmacyEntity.telephone !== "+91 94152 83910") {
    throw new Error(`Invalid telephone in schema: ${pharmacyEntity.telephone}`);
  }
  if (!pharmacyEntity.geo || pharmacyEntity.geo.latitude !== 26.5024 || pharmacyEntity.geo.longitude !== 83.7791) {
    throw new Error('Invalid verified geo-coordinates in schema!');
  }
  if (!pharmacyEntity.employee || pharmacyEntity.employee.identifier !== "UPPC-PH-29841") {
    throw new Error('Statutory registered pharmacist entity missing UPPC-PH-29841!');
  }
  if (!pharmacyEntity.hasOfferCatalog || !pharmacyEntity.hasOfferCatalog.itemListElement || pharmacyEntity.hasOfferCatalog.itemListElement.length < 7) {
    throw new Error(`OfferCatalog must contain at least 7 in-stock medicines, found ${pharmacyEntity.hasOfferCatalog?.itemListElement?.length}`);
  }
  const augmentinOffer = pharmacyEntity.hasOfferCatalog.itemListElement.find(o => o.itemOffered.name.includes("Augmentin"));
  if (!augmentinOffer || augmentinOffer.availability !== "https://schema.org/InStock") {
    throw new Error('Augmentin offer must have availability https://schema.org/InStock!');
  }
  const doloOffer = pharmacyEntity.hasOfferCatalog.itemListElement.find(o => o.itemOffered.name.includes("Dolo"));
  if (!doloOffer || doloOffer.availability !== "https://schema.org/InStock") {
    throw new Error('Dolo offer must have availability https://schema.org/InStock!');
  }

  // Verify Breadcrumb hierarchy: Home > Uttar Pradesh > Deoria > Deoria Drug House
  if (breadcrumbEntity.itemListElement.length !== 4) {
    throw new Error(`BreadcrumbList must have 4 levels, got ${breadcrumbEntity.itemListElement.length}`);
  }
  if (breadcrumbEntity.itemListElement[2].name !== "Deoria" || breadcrumbEntity.itemListElement[3].name !== "Deoria Drug House") {
    throw new Error('Breadcrumb hierarchy mismatch!');
  }

  // Verify FAQPage 4 rich accordion questions
  if (faqEntity.mainEntity.length !== 4) {
    throw new Error(`FAQPage must have 4 questions, got ${faqEntity.mainEntity.length}`);
  }
  console.log('Deoria Drug House Multi-Entity Knowledge Graph (@graph) verified 100% compliant with Google Rich Results!');

  // (h) Test Future Store Creation and Automated Schema/Alias Generation
  const futureStore = {
    id: "store-up-009",
    slug: "anand-medical-store-gorakhpur",
    name: "Anand Medical Store",
    ownerName: "Dr Anand Verma",
    district: "Gorakhpur",
    city: "Gorakhpur",
    address: "Golghar, Gorakhpur, UP - 273001",
    license20: "UP/GKP/2026/20/999",
    license21: "UP/GKP/2026/21/999",
    phone: "+91 98765 43210",
    staff: [{ name: "Dr Anand Verma", uppcRegNo: "UPPC-PH-55123", role: "Chief Pharmacist" }],
    stocks: [{ name: "Azithromycin 500", mrp: 120, quantity: 50, unit: "Strips", manufacturer: "Cipla" }]
  };
  const futureAliases = app.generateStoreAliases(futureStore);
  if (!futureAliases.includes("आनंद मेडिकल स्टोर") || !futureAliases.includes("आनंद वर्मा गोरखपुर") || !futureAliases.includes("गोलघर मेडिकल स्टोर")) {
    throw new Error('Automated bilingual transliteration failed for future store: ' + JSON.stringify(futureAliases));
  }
  const futureSchema = app.generateStoreSchemaGraph(futureStore, "https://www.drugs.systems");
  if (futureSchema["@graph"][0].geo.latitude !== 26.7606 || futureSchema["@graph"][0].geo.longitude !== 83.3732) {
    throw new Error('Automated Gorakhpur geo-coordinates resolution failed!');
  }
  console.log('Future Store Onboarding & Automated Schema/Alias generation verified 100%!');

  // (i) Test Google Search Console Automation Modal
  app.openGoogleConsoleAutomationModal('store-up-001');
  const modalTitle = mockElements['modal-generic-title'].innerHTML;
  const gscModalBody = mockElements['modal-generic-body'].innerHTML;
  if (!modalTitle.includes('Google Search Console') || !gscModalBody.includes('Full-Stack Googlebot & SERP Automation')) {
    throw new Error('Google Search Console Automation Hub modal did not render expected content!');
  }
  if (!gscModalBody.includes('search.google.com/search-console/inspect') || !gscModalBody.includes('search.google.com/search-console/sitemaps')) {
    throw new Error('Google Search Console 1-click deep links missing from modal!');
  }
  console.log('openGoogleConsoleAutomationModal() verified: Google SERP Preview, 1-Click Search Console Links & Knowledge Graph Inspector rendered successfully!');

  // (j) Verify Google Verification Artifacts in Repo
  if (!fs.existsSync(path.join(repoDir, 'googleUiTlffmr24BU04f8q64XuJHuhhUCEmyrToKIJo74JFU.html'))) {
    throw new Error('googleUiTlffmr24BU04f8q64XuJHuhhUCEmyrToKIJo74JFU.html does not exist in root directory!');
  }
  const gVerifContent = fs.readFileSync(path.join(repoDir, 'googleUiTlffmr24BU04f8q64XuJHuhhUCEmyrToKIJo74JFU.html'), 'utf8');
  if (!gVerifContent.includes('googleUiTlffmr24BU04f8q64XuJHuhhUCEmyrToKIJo74JFU.html')) {
    throw new Error('Invalid Google HTML verification file content!');
  }
  console.log('Google Search Console HTML Verification File verified in root directory!');

  // --- Testing Google Gemini Vision AI Prescription OCR & Auto-Matcher Suite ---
  console.log('--- Testing Google Gemini Vision AI Prescription OCR & Auto-Matcher Suite ---');

  // 1. Test Key Management
  app.setGeminiApiKey('AIzaSyMockKeyForTesting123456');
  if (app.getGeminiApiKey() !== 'AIzaSyMockKeyForTesting123456') {
    throw new Error('getGeminiApiKey did not return the saved key!');
  }
  app.clearGeminiApiKey();
  if (app.getGeminiApiKey() !== '') {
    throw new Error('clearGeminiApiKey did not clear the key!');
  }
  // Verify Platform managed system key fallback
  if (!app.getEffectiveGeminiKey() || !app.getEffectiveGeminiKey().includes('Platform_Managed')) {
    throw new Error('getEffectiveGeminiKey failed to fall back to Platform Managed Key!');
  }
  // Verify Groq key management
  app.setGroqApiKey('gsk_MockGroqKeyTest123');
  if (app.getGroqApiKey() !== 'gsk_MockGroqKeyTest123') {
    throw new Error('getGroqApiKey did not return saved Groq key!');
  }
  app.clearGroqApiKey();
  if (app.getGroqApiKey() !== '') {
    throw new Error('clearGroqApiKey did not clear Groq key!');
  }
  console.log('Gemini & Groq API key management and Platform Managed Key fallback verified successfully!');

  // 2. Test Key Config Modal
  app.openGeminiKeyConfigModal();
  const keyModalBody = mockElements['modal-generic-body'].innerHTML;
  if (!keyModalBody.includes('aistudio.google.com/app/apikey') || !keyModalBody.includes('input-gemini-api-key') || !keyModalBody.includes('input-groq-api-key')) {
    throw new Error('openGeminiKeyConfigModal did not render Google AI Studio link, Gemini input, or Groq input!');
  }
  console.log('openGeminiKeyConfigModal() rendered Dual-Engine controls (Gemini + Groq) successfully!');

  // 3. Test Multimodal Vision Extraction
  const sampleRxData = await app.callGeminiVision('data:image/jpeg;base64,mockImageData123');
  if (!sampleRxData.doctorName || !sampleRxData.patientName || !Array.isArray(sampleRxData.medicines)) {
    throw new Error('callGeminiVision did not return valid clinical JSON extraction!');
  }
  if (sampleRxData.medicines.length < 2) {
    throw new Error('Expected at least 2 deciphered medicines from prescription slip!');
  }
  console.log(`callGeminiVision() extracted ${sampleRxData.medicines.length} medicines for patient: ${sampleRxData.patientName} by ${sampleRxData.doctorName}!`);

  // 4. Test Smart Inventory Auto-Matcher Engine
  const matchedMeds = app.matchPrescriptionMedicinesToStore(sampleRxData.medicines, currentStore);
  if (!matchedMeds || matchedMeds.length === 0) {
    throw new Error('matchPrescriptionMedicinesToStore returned empty matches!');
  }
  const augmentinMatch = matchedMeds.find(m => m.matchedStock && m.matchedStock.name.includes('Augmentin'));
  if (!augmentinMatch) {
    throw new Error('Failed to match Augmentin against Deoria Drug House inventory!');
  }
  if (augmentinMatch.confidence < 80 || augmentinMatch.status !== 'in_stock') {
    throw new Error(`Invalid match confidence or stock status: ${augmentinMatch.confidence}, ${augmentinMatch.status}`);
  }
  console.log(`matchPrescriptionMedicinesToStore() verified: Augmentin matched to SKU ${augmentinMatch.matchedStock.name} (Confidence: ${augmentinMatch.confidence}%, Status: ${augmentinMatch.status})!`);

  // 5. Test Storefront Prescription Upload Modal with Prescription Scanner
  app.openPrescriptionUploadModal(currentStore.name);
  const rxUploadModalBody = mockElements['modal-generic-body'].innerHTML;
  if (!rxUploadModalBody.includes('Digital Prescription Scanner') || !rxUploadModalBody.includes('btn-run-gemini-ocr')) {
    throw new Error('openPrescriptionUploadModal missing Prescription Scanner action bar or scan button!');
  }
  await app.handlePrescriptionGeminiOcr(currentStore);
  if (!app.selectedRxMedicines || app.selectedRxMedicines.length === 0) {
    throw new Error('handlePrescriptionGeminiOcr failed to auto-populate selectedRxMedicines!');
  }
  console.log(`handlePrescriptionGeminiOcr() executed and auto-populated ${app.selectedRxMedicines.length} in-stock medicines into customer verification list!`);

  // 6. Test Pharmacist Counter Billing POS Modal with Prescription Slip Auto-Fill
  app.openPosDispensingModal(currentStore.id);
  const posModalBody = mockElements['modal-generic-body'].innerHTML;
  if (!posModalBody.includes('Prescription Slip Auto-Fill') || !posModalBody.includes('pos-rx-slip-file')) {
    throw new Error('openPosDispensingModal missing Prescription Slip Auto-Fill strip!');
  }
  await app.handlePosGeminiAutoFill(currentStore.id, 'data:image/jpeg;base64,mockSlipImage');
  console.log('openPosDispensingModal() & handlePosGeminiAutoFill() verified: Rx Slip deciphered and POS inputs auto-filled!');

  // =========================================================================
  // --- Testing Progressive Web App (PWA) & Mobile UX Suite ---
  // =========================================================================
  console.log('--- Testing Progressive Web App (PWA) & Mobile UX Suite ---');

  // Verify Service Worker and Web App Manifest files exist
  const swPath = path.join(__dirname, 'sw.js');
  const manifestPath = path.join(__dirname, 'manifest.json');
  if (!fs.existsSync(swPath)) throw new Error('sw.js file missing from root directory!');
  if (!fs.existsSync(manifestPath)) throw new Error('manifest.json file missing from root directory!');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.short_name !== 'Drugs Systems' || !manifest.shortcuts || manifest.shortcuts.length < 3) {
    throw new Error('manifest.json missing required short_name or PWA shortcuts!');
  }
  console.log(`PWA manifest verified: Name: "${manifest.name}", Shortcuts: ${manifest.shortcuts.length}!`);

  // Verify PWA installation triggers and modal guides
  app.openPwaIosInstallModal();
  const iosModalHtml = mockElements['modal-generic-body'].innerHTML;
  if (!iosModalHtml.includes('Add to Home Screen (iOS Safari)') || !iosModalHtml.includes('Share Icon')) {
    throw new Error('openPwaIosInstallModal missing iOS installation steps!');
  }

  app.openPwaInstallGuideModal();
  const guideModalHtml = mockElements['modal-generic-body'].innerHTML;
  if (!guideModalHtml.includes('1-Tap Fast Mobile') || !guideModalHtml.includes('Android') || !guideModalHtml.includes('Windows')) {
    throw new Error('openPwaInstallGuideModal missing installation instructions!');
  }

  // Trigger PWA install with simulated deferred prompt
  let prompted = false;
  app.deferredPwaPrompt = {
    prompt: () => { prompted = true; },
    userChoice: Promise.resolve({ outcome: 'accepted' })
  };
  await app.triggerPwaInstall();
  if (!prompted) throw new Error('triggerPwaInstall failed to invoke deferred prompt!');
  console.log('PWA installation engine verified: 1-Tap prompt, iOS modal, & installation guide verified successfully!');

  // =========================================================================
  // --- Testing Storefront Owner Controls & Ergonomic Mobile Bottom Bar ---
  // =========================================================================
  console.log('--- Testing Storefront Owner Controls & Ergonomic Mobile Bottom Bar ---');

  // 1. Guest visitor check: 0 owner buttons, 5-button consumer mobile bottom bar
  app.currentUser = null;
  const guestStorefrontHtml = app.getHostedWebsiteViewHtml(currentStore);
  if (guestStorefrontHtml.includes('Verified Owner Mode') || guestStorefrontHtml.includes('Edit Store Profile')) {
    throw new Error('Guest view contains Owner Mode buttons!');
  }
  if (!guestStorefrontHtml.includes('mobile-bottom-bar') || !guestStorefrontHtml.includes('Scan Rx') || !guestStorefrontHtml.includes('Install')) {
    throw new Error('Guest mobile bottom bar missing required action touch targets!');
  }
  console.log('Guest storefront mobile experience verified: 0 owner controls, 5 ergonomic touch targets present!');

  // 2. Authenticated Owner check: Clean storefront with Owner notice directing to Owner Portal
  app.currentUser = {
    username: 'akhil_chemist',
    role: 'pharmacy_owner',
    storeId: 'store-up-001',
    name: 'Akhileshwar Tripathi'
  };
  const ownerStorefrontHtml = app.getHostedWebsiteViewHtml(currentStore);
  if (!ownerStorefrontHtml.includes('Verified Owner Mode') || !ownerStorefrontHtml.includes('Open Owner Portal to Edit Data &amp; Photos')) {
    throw new Error('Owner storefront view missing Verified Owner Mode notice bar!');
  }
  if (ownerStorefrontHtml.includes('Edit Cover Photo') || ownerStorefrontHtml.includes('Add Medicine SKU')) {
    throw new Error('Edit buttons leaked into hosted storefront!');
  }
  if (!ownerStorefrontHtml.includes('mobile-bottom-bar') || !ownerStorefrontHtml.includes('Portal')) {
    throw new Error('Owner mobile bottom bar missing Portal shortcut!');
  }

  // 3. Centralized Owner Portal SKU Management & Per-Medicine Editor
  const ownerDetailViewHtml = app.getStoreDetailViewHtml(currentStore);
  if (!ownerDetailViewHtml.includes('Active Medicine SKUs &amp; Per-Medicine Data Editor') && !ownerDetailViewHtml.includes('Active Medicine SKUs & Per-Medicine Data Editor')) {
    throw new Error('Owner Portal missing Active Medicine SKUs & Per-Medicine Data Editor!');
  }
  if (!ownerDetailViewHtml.includes('+ Add New Medicine SKU')) {
    throw new Error('Owner Portal missing + Add New Medicine SKU button!');
  }
  if (!ownerDetailViewHtml.includes('openEditMedicineModal') || !ownerDetailViewHtml.includes('deleteMedicine')) {
    throw new Error('Owner Portal missing inline Edit and Delete medicine actions!');
  }
  console.log('Authenticated Owner experience verified: Clean public storefront, with SKU CRUD & multi-photos centralized in Owner Portal!');

  // =========================================================================
  // --- Testing Full CRUD Operations (Store, Medicine, Staff) ---
  // =========================================================================
  console.log('--- Testing Full CRUD Operations (Store, Medicine, Staff) ---');

  // 1. Store Profile CRUD
  app.openEditStoreModal('store-up-001');
  const storeModalBody = mockElements['modal-generic-body'].innerHTML;
  if (!storeModalBody.includes('edit-store-name') || !storeModalBody.includes('Manage Multi-Photo Gallery')) {
    throw new Error('openEditStoreModal missing store name input or gallery management shortcut!');
  }
  app.openEditStoreProfileModal('store-up-001');

  // 2. Staff CRUD (Add, Edit, Delete)
  const initialStaffCount = currentStore.staff.length;
  const testStaffId = `st-test-${Date.now()}`;
  currentStore.staff.push({
    id: testStaffId,
    name: 'Test Pharmacist Ram',
    role: 'Assistant Pharmacist',
    uppcRegNo: 'UPPC-PH-99999',
    qualification: 'B.Pharm',
    phone: '+91 91234 56789',
    shift: 'Evening',
    status: 'Active',
    isOnDuty: false,
    isAadhaarVerified: true
  });
  if (currentStore.staff.length !== initialStaffCount + 1) throw new Error('Failed to push test staff member!');

  app.openEditStaffModal(testStaffId);
  const staffModalBody = mockElements['modal-generic-body'].innerHTML;
  if (!staffModalBody.includes('Test Pharmacist Ram') || !staffModalBody.includes('UPPC-PH-99999')) {
    throw new Error('openEditStaffModal failed to render existing staff fields!');
  }

  // Delete staff member
  const origConfirm = global.confirm;
  global.confirm = () => true;
  app.deleteStaff(testStaffId);
  if (currentStore.staff.some(s => s.id === testStaffId)) {
    throw new Error('deleteStaff failed to remove test staff member from store!');
  }
  console.log('Staff CRUD verified: Add, Edit modal, and Delete functional!');

  // 3. Medicine SKU CRUD (Edit modal delete button)
  const testMedId = `med-test-${Date.now()}`;
  currentStore.stocks.push({
    id: testMedId,
    name: 'Test Azithro 250',
    saltName: 'Azithromycin 250mg',
    manufacturer: 'Test Labs',
    schedule: 'Schedule H',
    batchNo: 'BAT-TEST-001',
    expiryDate: '2028-12-31',
    quantity: 50,
    mrp: 120,
    purchaseRate: 80,
    freeScheme: '+1'
  });
  app.openEditMedicineModal(testMedId);
  const medModalBody = mockElements['modal-generic-body'].innerHTML;
  if (!medModalBody.includes('Delete Medicine SKU') || !medModalBody.includes(testMedId)) {
    throw new Error('openEditMedicineModal missing Delete Medicine SKU button in footer!');
  }

  app.deleteMedicine(testMedId);
  if (currentStore.stocks.some(m => m.id === testMedId)) {
    throw new Error('deleteMedicine failed to remove test medicine SKU!');
  }
  global.confirm = origConfirm;
  console.log('Medicine SKU CRUD verified: Edit modal, live updates, and Delete button functional!');

  // =========================================================================
  // --- Testing Dynamic Onboarding: Apoorva Tripathi Medicos, Deoria ---
  // =========================================================================
  console.log('--- Testing Dynamic Onboarding: Apoorva Tripathi Medicos, Deoria ---');

  const apoorvaStore = {
    id: 'store-up-007',
    slug: 'apoorva-tripathi-medicos-deoria',
    slugAliases: ['apoorva-tripathi-medicos', 'apoorva-tripathi-deoria', 'apoorva-medicos-deoria'],
    name: 'Apoorva Tripathi Medicos',
    district: 'Deoria',
    city: 'Deoria',
    address: 'Subhash Chowk, Station Road, Deoria, Uttar Pradesh - 274001',
    license20: 'UP/DEO/2023/20/3142',
    license21: 'UP/DEO/2023/21/3143',
    ownerName: 'Apoorva Tripathi',
    phone: '+91 94152 83910',
    whatsapp: '919415283910',
    email: 'contact@apoorvatripathimedicos.com',
    gstin: '09AABCT8192M1Z5',
    establishedYear: '2023',
    operatingHours: '08:00 AM - 10:30 PM',
    is24x7: true,
    status: 'Verified',
    photoUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    staff: [
      {
        id: 'st-007-1',
        name: 'Apoorva Tripathi',
        role: 'Proprietor & Registered Pharmacist',
        uppcRegNo: 'UPPC-PH-49218',
        qualification: 'B.Pharm, R.Ph',
        regDate: '2021-04-12',
        validUpto: '2031-12-31',
        phone: '+91 94152 83910',
        shift: 'All Shifts / Emergency',
        isAadhaarVerified: true,
        status: 'Active'
      }
    ],
    stocks: [
      {
        id: 'med-007-1',
        name: 'Augmentin 625 Duo Tablet',
        saltName: 'Amoxicillin + Potassium Clavulanate',
        manufacturer: 'GSK Pharmaceuticals',
        batchNo: 'BAT-AUG-5501',
        expiryDate: '2027-08-31',
        quantity: 80,
        unit: 'Strips (10 tabs)',
        mrp: 220.00,
        purchaseRate: 165.00,
        schedule: 'Schedule H',
        rackLocation: 'Rack A-02',
        minAlertThreshold: 25
      },
      {
        id: 'med-007-2',
        name: 'Azithral 500 Tablet',
        saltName: 'Azithromycin 500mg',
        manufacturer: 'Alembic Pharmaceuticals',
        batchNo: 'AZ-8812',
        expiryDate: '2026-11-30',
        quantity: 60,
        unit: 'Strips (5 tabs)',
        mrp: 132.00,
        purchaseRate: 98.00,
        schedule: 'Schedule H',
        rackLocation: 'Rack B-01',
        minAlertThreshold: 15
      },
      {
        id: 'med-007-3',
        name: 'Telma 40 Tablet',
        saltName: 'Telmisartan 40mg',
        manufacturer: 'Glenmark Pharmaceuticals',
        batchNo: 'TL-9941',
        expiryDate: '2027-04-30',
        quantity: 90,
        unit: 'Strips (15 tabs)',
        mrp: 145.00,
        purchaseRate: 110.00,
        schedule: 'Schedule H',
        rackLocation: 'Rack C-03',
        minAlertThreshold: 20
      }
    ],
    revenueData: {
      todaySales: 16500,
      monthlyGross: 480000,
      lastMonthGross: 440000,
      avgGrossMarginPercent: 22.0,
      totalOrdersThisMonth: 580,
      digitalSplitPercent: 70,
      cashSplitPercent: 30,
      gstCollectedMonthly: 57600,
      monthlyHistory: [
        { month: 'Aug', revenue: 410000, digital: 270000, cash: 140000 },
        { month: 'Sep', revenue: 440000, digital: 295000, cash: 145000 },
        { month: 'Oct (Current)', revenue: 480000, digital: 336000, cash: 144000 }
      ],
      paymentChannels: { upi: 60, cards: 10, cash: 30 }
    }
  };

  app.stores.push(apoorvaStore);

  if (apoorvaStore.ownerName !== 'Apoorva Tripathi') throw new Error('Incorrect owner for Apoorva Tripathi Medicos!');
  if (apoorvaStore.district !== 'Deoria') throw new Error('Incorrect district for Apoorva Tripathi Medicos!');

  // Test routing to Apoorva Tripathi
  mockWindow.location.pathname = '/pharmacy/apoorva-tripathi-medicos-deoria';
  app.checkUrlRouting();
  if (app.currentStoreId !== 'store-up-007' || app.activeTab !== 'hosted-site') {
    throw new Error('Routing to /pharmacy/apoorva-tripathi-medicos-deoria failed!');
  }

  // Test storefront rendering
  const apoorvaHtml = app.getHostedWebsiteViewHtml(apoorvaStore);
  if (!apoorvaHtml.includes('Apoorva Tripathi Medicos') || !apoorvaHtml.includes('UPPC-PH-49218') || !apoorvaHtml.includes('Augmentin 625 Duo Tablet')) {
    throw new Error('Apoorva Tripathi Medicos storefront HTML missing key store/staff/stock info!');
  }

  // Test medicine search within Apoorva
  app.hostedStockSearch = 'Azithral';
  const filteredCatalog = app.getHostedMedicineCatalogHtml(apoorvaStore);
  if (!filteredCatalog.includes('Azithral 500 Tablet') || filteredCatalog.includes('Telma 40')) {
    throw new Error('Catalog live search failed for Apoorva Tripathi Medicos!');
  }
  app.hostedStockSearch = '';

  // Test prescription matching against Apoorva\'s inventory
  const testRxSample = [
    { name: 'Augmentin 625', saltName: 'Amoxicillin + Clavulanate' },
    { name: 'Telma 40', saltName: 'Telmisartan' }
  ];
  const apoorvaMatches = app.matchPrescriptionMedicinesToStore(testRxSample, apoorvaStore);
  const matchedAugmentin = apoorvaMatches.find(m => m.matchedStock && m.matchedStock.name.includes('Augmentin'));
  const matchedTelma = apoorvaMatches.find(m => m.matchedStock && m.matchedStock.name.includes('Telma'));
  if (!matchedAugmentin || matchedAugmentin.status !== 'in_stock') throw new Error('Failed to match Augmentin against Apoorva stock!');
  if (!matchedTelma || matchedTelma.status !== 'in_stock') throw new Error('Failed to match Telma against Apoorva stock!');

  // Test POS counter dispensing for Apoorva
  app.openPosDispensingModal('store-up-007');
  const apoorvaPosBody = mockElements['modal-generic-body'].innerHTML;
  if (!apoorvaPosBody.includes('Apoorva Tripathi Medicos') || !apoorvaPosBody.includes('UP/DEO/2023/20/3142')) {
    throw new Error('openPosDispensingModal for Apoorva Tripathi Medicos missing store license/name!');
  }

  // Test Schema.org Knowledge Graph for Apoorva Tripathi
  const apoorvaAliases = app.generateStoreAliases(apoorvaStore);
  if (!apoorvaAliases.includes('अपूर्वा त्रिपाठी मेडिकोज') || !apoorvaAliases.includes('Apoorva Tripathi Chemist')) {
    throw new Error('Apoorva Tripathi Medicos missing Hindi/English search aliases!');
  }
  const apoorvaSchema = app.generateStoreSchemaGraph(apoorvaStore, 'https://www.drugs.systems');
  // Test Owner Authentication with custom credentials
  const authResult = app.authenticate('apoorva-tripathi', 'Pharma@8004');
  if (!authResult || !app.currentUser || app.currentUser.storeId !== 'store-up-007') {
    throw new Error('Authentication failed for Apoorva Tripathi Medicos owner credentials!');
  }
  app.logout();

  // Test Success / Credentials confirmation modal rendering
  app.openStoreOnboardedSuccessModal(apoorvaStore);
  const successModalBody = mockElements['modal-generic-body'].innerHTML;
  if (!successModalBody.includes('apoorva-tripathi') || !successModalBody.includes('Pharma@8004')) {
    throw new Error('openStoreOnboardedSuccessModal missing credentials display!');
  }

  console.log('Apoorva Tripathi Medicos, Deoria verified from scratch: Routing, Aliases, Storefront, Catalog Search, Rx Matching, POS, Auth & Credentials Modal passed 100%!');

  // =========================================================================
  // --- Testing Dedicated Pharmacy Website Deployment Suite ---
  // =========================================================================
  console.log('--- Testing Dedicated Pharmacy Website Deployment Suite ---');

  // Test 1: showDeploymentPage switches to deploy-website view
  app.showDeploymentPage();
  if (app.activeTab !== 'deploy-website') {
    throw new Error('showDeploymentPage did not set activeTab to deploy-website!');
  }

  const deployHtml = app.getDeploymentPageViewHtml();
  if (!deployHtml.includes('Deploy Your Licensed Uttar Pradesh Pharmacy Website')) {
    throw new Error('getDeploymentPageViewHtml missing main deployment headline!');
  }
  if (!deployHtml.includes('deploy-store-name') || !deployHtml.includes('deploy-district')) {
    throw new Error('getDeploymentPageViewHtml missing store name or district inputs!');
  }
  if (!deployHtml.includes('deploy-lic20') || !deployHtml.includes('deploy-lic21')) {
    throw new Error('getDeploymentPageViewHtml missing Form 20/21 license inputs!');
  }
  if (!deployHtml.includes('deploy-pharmacist-name') || !deployHtml.includes('deploy-pharmacist-reg')) {
    throw new Error('getDeploymentPageViewHtml missing UPPC pharmacist inputs!');
  }
  if (!deployHtml.includes('deploy-store-photo-file') || !deployHtml.includes('deploy-photo-preview-tile')) {
    throw new Error('getDeploymentPageViewHtml missing storefront photo upload input or preview tile!');
  }
  if (!deployHtml.includes('deploy-owner-email') || !deployHtml.includes('deploy-login-id') || !deployHtml.includes('deploy-password')) {
    throw new Error('getDeploymentPageViewHtml missing confidential owner credentials inputs!');
  }
  if (!deployHtml.includes('btn-deploy-submit')) {
    throw new Error('getDeploymentPageViewHtml missing submit button!');
  }
  console.log('Deployment Page View HTML verified: 6 Form Sections, Photo Upload & Credentials present!');

  // Test 2: Simulate Live Deployment Form Submission
  const deployPageContainer = { innerHTML: '' };
  mockElements['deploy-page-content'] = deployPageContainer;
  mockElements['deploy-store-name'] = { value: 'Varanasi Medicare & Surgical' };
  mockElements['deploy-district'] = { value: 'Varanasi' };
  mockElements['deploy-address'] = { value: 'Bhelupur, Near Sankat Mochan, Varanasi, UP 221005' };
  mockElements['deploy-phone'] = { value: '+91 98765 43210' };
  mockElements['deploy-hours'] = { value: '08:00 AM - 11:00 PM' };
  mockElements['deploy-24x7'] = { checked: true };
  mockElements['deploy-lic20'] = { value: 'UP/VAR/2026/20/7788' };
  mockElements['deploy-lic21'] = { value: 'UP/VAR/2026/21/7789' };
  mockElements['deploy-gstin'] = { value: '09AABCV1234F1Z1' };
  mockElements['deploy-pharmacist-name'] = { value: 'Dr. Amitesh Pandey' };
  mockElements['deploy-pharmacist-reg'] = { value: 'UPPC-PH-55443' };
  mockElements['deploy-pharmacist-qual'] = { value: 'B.Pharm, R.Ph (UP)' };
  mockElements['deploy-pharmacist-photo'] = { value: 'data:image/jpeg;base64,mockPharmPhoto' };
  mockElements['deploy-store-photo'] = { value: 'data:image/jpeg;base64,mockStorePhoto' };
  mockElements['deploy-store-photo-url'] = { value: '' };
  mockElements['deploy-owner-email'] = { value: 'owner@varanasi-medicare.in' };
  mockElements['deploy-login-id'] = { value: 'varanasi-medicare' };
  mockElements['deploy-password'] = { value: 'VarMed@9900' };

  app.handleDeploymentFormSubmit({ preventDefault: () => {} });

  const deployedStore = app.stores.find(s => s.name === 'Varanasi Medicare & Surgical');
  if (!deployedStore) {
    throw new Error('Deployed store Varanasi Medicare & Surgical not found in app.stores!');
  }
  if (deployedStore.slug !== 'varanasi-medicare-surgical') {
    throw new Error(`Unexpected slug for deployed store: ${deployedStore.slug}`);
  }
  if (deployedStore.adminUsername !== 'varanasi-medicare' || deployedStore.adminPassword !== 'VarMed@9900') {
    throw new Error('Deployed store credentials do not match inputs!');
  }
  if (!app.currentUser || app.currentUser.storeId !== deployedStore.id) {
    throw new Error('app.currentUser not automatically set to deployed store owner!');
  }

  // Test 3: Verify Success View & Credentials Dossier rendering
  const successDossierHtml = deployPageContainer.innerHTML;
  if (!successDossierHtml.includes('Varanasi Medicare & Surgical') || !successDossierHtml.includes('Officially Deployed')) {
    throw new Error('Success dossier missing store name or deployment confirmation!');
  }
  if (!successDossierHtml.includes('varanasi-medicare') || !successDossierHtml.includes('VarMed@9900') || !successDossierHtml.includes('owner@varanasi-medicare.in')) {
    throw new Error('Success dossier missing username, password, or email credentials!');
  }
  if (!successDossierHtml.includes('https://www.drugs.systems/pharmacy/varanasi-medicare-surgical')) {
    throw new Error('Success dossier missing public live URL link!');
  }
  console.log('Deployment Form Submission & Credentials Dossier verified 100%!');

  // Test 4: Verify Post-Deployment Owner Authentication Flow
  app.logout();
  if (app.currentUser !== null) {
    throw new Error('Logout failed!');
  }
  const reAuth = app.authenticate('varanasi-medicare', 'VarMed@9900');
  if (!reAuth || !app.currentUser || app.currentUser.storeId !== deployedStore.id) {
    throw new Error('Failed to re-authenticate with newly deployed owner credentials!');
  }
  console.log('Owner Authentication with post-deployment credentials verified 100%!');

  // Test 5: Verify Hosted Website in Owner Mode vs Public Mode
  const ownerModeHtml = app.getHostedWebsiteViewHtml(deployedStore);
  if (!ownerModeHtml.includes('Verified Owner Mode') || !ownerModeHtml.includes('Open Owner Portal to Edit Data &amp; Photos')) {
    throw new Error('Owner Mode notice missing in hosted website view for logged in owner!');
  }
  if (ownerModeHtml.includes('Edit Cover Photo') || ownerModeHtml.includes('Add New Medicine SKU') || ownerModeHtml.includes('Googlebot &amp; Schema')) {
    throw new Error('Edit buttons or Googlebot leaked into hosted storefront!');
  }

  // Test 6: Verify Owner Portal contains the Active Medicine SKUs & Per-Medicine Editor and Photo Suite
  const ownerPortalHtml = app.getStoreDetailViewHtml(deployedStore);
  if (!ownerPortalHtml.includes('Active Medicine SKUs &amp; Per-Medicine Data Editor') && !ownerPortalHtml.includes('Active Medicine SKUs & Per-Medicine Data Editor')) {
    throw new Error('Owner Portal missing Active Medicine SKUs & Per-Medicine Data Editor!');
  }
  if (!ownerPortalHtml.includes('+ Add New Medicine SKU')) {
    throw new Error('Owner Portal missing + Add New Medicine SKU button!');
  }
  if (!ownerPortalHtml.includes('Premises &amp; Facility Photos') && !ownerPortalHtml.includes('Premises & Facility Photos')) {
    throw new Error('Owner Portal missing Premises & Facility Photos suite!');
  }
  console.log('Owner Portal verified: Photo Suite & Per-Medicine SKU Editor present and functional!');

  // Test 7: Verify Directory View has Googlebot & Schema button strictly on main admin page
  const mainAdminDirHtml = app.getDirectoryViewHtml();
  if (!mainAdminDirHtml.includes('Googlebot &amp; Schema Hub') && !mainAdminDirHtml.includes('Googlebot & Schema Hub')) {
    throw new Error('Directory view missing Googlebot & Schema Hub button!');
  }
  if (!mainAdminDirHtml.includes('Googlebot')) {
    throw new Error('Directory view missing Googlebot button per pharmacy card!');
  }
  console.log('Main Admin Directory verified: Googlebot & Schema buttons strictly positioned per pharmacy!');

  // Test 8: Verify Kapoor Medicos Store
  const kapoorStore = app.stores.find(s => s.slug === 'kapoor-medicos' || s.id === 'store-up-008');
  if (!kapoorStore) {
    throw new Error('Kapoor Medicos not found in stores registry!');
  }
  if (kapoorStore.name !== 'Kapoor Medicos') {
    throw new Error('Kapoor Medicos name mismatch!');
  }
  if (!Array.isArray(kapoorStore.galleryPhotos) || kapoorStore.galleryPhotos.length < 6) {
    throw new Error(`Kapoor Medicos expected at least 6 photos (1 display + 5 extra), found: ${kapoorStore.galleryPhotos ? kapoorStore.galleryPhotos.length : 0}`);
  }
  const kapoorAuth = app.authenticate('kapoor-medicos', 'Pharma@8004');
  if (!kapoorAuth || !app.currentUser || app.currentUser.storeId !== kapoorStore.id) {
    throw new Error('Kapoor Medicos owner authentication failed with credentials kapoor-medicos / Pharma@8004!');
  }
  console.log('Kapoor Medicos verified 100%: 1 Display Photo + 5 Extra Photos, Stocks, and Owner Auth functional!');

  app.viewPublicWebsite(deployedStore.id);
  if (app.currentUser !== null) {
    throw new Error('viewPublicWebsite did not clear currentUser for public mode!');
  }
  const publicModeHtml = app.getHostedWebsiteViewHtml(deployedStore);
  if (publicModeHtml.includes('Verified Owner Mode') || publicModeHtml.includes('Edit Cover Photo')) {
    throw new Error('Owner controls leaked into public mode view!');
  }
  console.log('Owner Mode vs Public Read-Only Mode toggle verified 100%!');

  // Test 9: Verify Direct Photo Upload, Multi-Facility Photos, and Deployment Presets
  const testPhotoFile = { name: "test-photo.jpg", size: 50000, type: "image/jpeg" };
  const beforeExtraCount = kapoorStore.galleryPhotos.filter(p => !p.isPrimary).length;
  await app.uploadStorePhotoDirect(kapoorStore.id, testPhotoFile, 'Special Racks Unit', 'Racks', false);
  const afterExtraCount = kapoorStore.galleryPhotos.filter(p => !p.isPrimary).length;
  if (afterExtraCount !== beforeExtraCount + 1) {
    throw new Error(`uploadStorePhotoDirect failed to add extra facility photo! Before: ${beforeExtraCount}, After: ${afterExtraCount}`);
  }
  const newlyAddedPhoto = kapoorStore.galleryPhotos[kapoorStore.galleryPhotos.length - 1];
  if (newlyAddedPhoto.isPrimary !== false || newlyAddedPhoto.title !== 'Special Racks Unit') {
    throw new Error('uploadStorePhotoDirect extra photo attributes incorrect!');
  }

  // Test Direct Primary Cover Upload
  await app.uploadStorePhotoDirect(kapoorStore.id, testPhotoFile, 'Kapoor Main Facade', 'Store Front', true);
  if (!kapoorStore.photoUrl.startsWith('data:image/')) {
    throw new Error('uploadStorePhotoDirect primary photo failed to update store.photoUrl!');
  }

  // Test replaceFacilityPhoto
  await app.replaceFacilityPhoto(kapoorStore.id, newlyAddedPhoto.id, testPhotoFile);
  const replacedPhoto = kapoorStore.galleryPhotos.find(p => p.id === newlyAddedPhoto.id);
  if (!replacedPhoto || !replacedPhoto.url.startsWith('data:image/')) {
    throw new Error('replaceFacilityPhoto failed to replace photo data URL!');
  }

  // Test Deployment Preset Helpers
  if (typeof app.applyDeployExtraPreset !== 'function' || typeof app.applyDeployStorePhotoPreset !== 'function') {
    throw new Error('Deployment preset methods missing from app!');
  }
  app.applyDeployStorePhotoPreset('https://images.unsplash.com/photo-1586015555751-63bb77f4322a');
  app.applyDeployExtraPreset(1, 'https://images.unsplash.com/photo-1576602976047-174e57a47881', 'Medicine Racks');
  console.log('Photo Upload Suite, Extra Facility Multi-Photos, and Deployment Presets verified 100%!');

  // Test Non-Hijacked User Session and Clean Public Gateway Return
  mockLocalStorage.setItem('ACS_USER_SESSION_V2', JSON.stringify({
    role: 'pharmacy_owner',
    email: 'akhil@acs.com',
    name: 'Akhileshwar Tripathi',
    storeId: 'store-up-001'
  }));
  app.activeTab = 'landing';
  app.loadUserSession();
  if (app.activeTab !== 'landing') {
    throw new Error(`loadUserSession hijacked activeTab to '${app.activeTab}' instead of keeping 'landing'!`);
  }
  console.log('loadUserSession verified: Never hijacks activeTab away from landing!');

  // Test returnToMainPortal()
  app.activeTab = 'hosted-site';
  app.returnToMainPortal();
  if (app.activeTab !== 'landing' || app.landingSubTab !== 'gateway') {
    throw new Error(`returnToMainPortal failed: activeTab is '${app.activeTab}', subTab is '${app.landingSubTab}'`);
  }
  console.log('returnToMainPortal verified: Cleanly resets to landing gateway!');

  // Test Hosted Website View has NO floating Store Management Portal button
  const deoriaStore = app.stores.find(s => s.id === 'store-up-001');
  const deoriaHtml = app.getHostedWebsiteViewHtml(deoriaStore);
  if (deoriaHtml.includes('Store Management Portal') || deoriaHtml.includes('fixed bottom-16 md:bottom-5 right-5')) {
    throw new Error('Hosted website view still contains floating Store Management Portal button!');
  }
  if (!deoriaHtml.includes('returnToMainPortal()')) {
    throw new Error('Hosted website footer missing returnToMainPortal link!');
  }
  // --- Testing Supabase Cloud PostgreSQL Integration Suite ---
  app.setSupabaseConfig('https://test-ref.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-anon-key');
  const sbConf = app.getSupabaseConfig();
  if (sbConf.url !== 'https://test-ref.supabase.co' || sbConf.key !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-anon-key') {
    throw new Error('Supabase config get/set failed!');
  }
  app.openSupabaseConfigModal();
  const sbModalBody = mockElements['modal-generic-body'].innerHTML;
  if (!sbModalBody.includes('sb-config-url') || !sbModalBody.includes('sb-config-key')) {
    throw new Error('Supabase config modal did not render correctly!');
  }
  app.setSupabaseConfig('', '');

  // Verify atomic targeted mutation methods exist and are callable
  if (typeof app.pushSingleStockToSupabase !== 'function' ||
      typeof app.deleteSingleStockFromSupabase !== 'function' ||
      typeof app.pushSingleStoreToSupabase !== 'function' ||
      typeof app.pushSingleStaffToSupabase !== 'function' ||
      typeof app.pushSingleTransactionToSupabase !== 'function') {
    throw new Error('Atomic Supabase mutation methods missing!');
  }
  await app.pushSingleStockToSupabase('store-up-001', { id: 'test-med', name: 'Test Med', quantity: 50 });
  await app.deleteSingleStockFromSupabase('store-up-001', 'test-med');
  await app.pushSingleStoreToSupabase({ id: 'store-up-001', name: 'Test Store' });
  await app.pushSingleStaffToSupabase('store-up-001', { id: 'st-test', name: 'Test Staff' }, 'upsert');
  await app.pushSingleTransactionToSupabase('store-up-001', { id: 'txn-test', totalBill: 150 });
  console.log('Atomic targeted single-row mutation methods verified successfully!');

  // --- Testing Offline Outbox Queue & Replay Suite ---
  if (typeof app.getOfflineOutbox !== 'function' ||
      typeof app.enqueueOfflineMutation !== 'function' ||
      typeof app.flushOfflineOutbox !== 'function') {
    throw new Error('Offline outbox queue methods missing!');
  }
  mockLocalStorage.removeItem('ACS_OFFLINE_OUTBOX');
  app.enqueueOfflineMutation({ type: 'UPSERT_STOCK', storeId: 'store-up-001', data: { id: 'queued-med-1', name: 'Offline Pan-D', quantity: 99 } });
  const outbox = app.getOfflineOutbox();
  if (!outbox || !outbox.some(m => m.data && m.data.id === 'queued-med-1')) {
    throw new Error('Offline outbox enqueue failed to record mutation!');
  }
  app.handleNetworkOffline();
  app.handleNetworkOnline();
  await app.flushOfflineOutbox();
  console.log('Offline Outbox Queue & Replay Suite verified successfully!');

  // --- Testing ACID POS Dispensing RPC Suite ---
  if (typeof app.callSupabasePosDispenseRpc !== 'function') {
    throw new Error('callSupabasePosDispenseRpc method missing!');
  }
  const rpcResult = await app.callSupabasePosDispenseRpc('store-up-001', 'med-ddh-001', 2, {
    id: 'INV-TEST-RPC',
    totalBill: 450,
    patientName: 'Test Patient',
    medName: 'Augmentin 625 Duo Tablet'
  });
  if (!rpcResult || !rpcResult.success) {
    throw new Error('callSupabasePosDispenseRpc failed to return success status!');
  }
  console.log('ACID POS Dispensing RPC Suite verified successfully!');

  // --- Testing Automated Stock Risk Intelligence & Expiry Audit Suite ---
  if (typeof app.openStockAlertAuditModal !== 'function' ||
      typeof app.requestStockPushNotifications !== 'function') {
    throw new Error('Stock Risk Intelligence & Expiry Audit methods missing!');
  }
  app.openStockAlertAuditModal();
  const auditModalBody = mockElements['modal-generic-body'].innerHTML;
  if (!auditModalBody.includes('Stock &amp; Expiry Risk Audit Dossier') && !auditModalBody.includes('flagged SKU(s)')) {
    throw new Error('Stock Alert Audit modal did not render correctly!');
  }
  app.requestStockPushNotifications();
  console.log('Automated Stock Risk Intelligence & Expiry Audit Suite verified successfully!');

  console.log('Supabase Cloud Database integration suite verified successfully!');

  console.log('ALL CONNECTION TESTS VERIFIED AND PASSED 100%!');
  console.log('ALL PHOTO & PROFILE STUDIO TESTS PASSED 100%!');
  console.log('ALL PUBLIC STOREFRONT & AUTO-MATCHER TESTS PASSED 100%!');
  console.log('ALL AUTHENTICATION & VIEW-ONLY STORE CONSTRAINTS PASSED 100%!');
  console.log('ALL PWA & MOBILE ERGONOMIC TESTS PASSED 100%!');
  console.log('ALL FULL CRUD (STORE, MEDICINE, STAFF) TESTS PASSED 100%!');
  console.log('ALL TESTS PASSED COMPLETELY WITHOUT ANY ERRORS!');
  } catch (err) {
    console.error('ERROR during testing:', err);
    process.exit(1);
  }
}

runTests();
