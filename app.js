/**
 * ACS (All Chemists & Stores Registry) - Core Application Logic
 * UP Pharmacy Data Hosting & Management Platform
 */

class ACSApp {
  constructor() {
    this.stores = [];
    this.currentStoreId = null;
    this.currentUser = null; // { role: 'pharmacy_owner' | 'admin', name, storeId }
    this.activeTab = "landing"; // 'landing', 'directory', 'store-detail', 'hosted-site', 'stocks', 'staff', 'revenue', 'verify'
    this.financialsVisible = false;
    this.charts = {};

    // Stock filters
    this.stockSearchQuery = "";
    this.stockScheduleFilter = "ALL";
    this.stockAlertFilter = "ALL"; // 'ALL', 'LOW_STOCK', 'EXPIRING'
    this.stockHorizonFilter = "ALL"; // 'ALL', 'HEALTHY', 'EXPIRING', 'LOW_STOCK'

    // Hosted site search & sub-tab (Page 1 vs Page 2)
    this.hostedStockSearch = "";
    this.hostedSubTab = "storefront"; // 'storefront' (Page 1) or 'audit-dossier' (Page 2)

    // Directory filters
    this.directorySearch = "";
    this.directoryDistrict = "ALL";

    // Landing login role tab & showcase sub-tab
    this.landingLoginRole = "pharmacy_owner";
    this.landingSubTab = "gateway"; // 'gateway' | 'showcase'
    this.showcaseDistrict = "ALL";
    this.showcaseSearch = "";

    this.init();
  }

  init() {
    this.loadStores();
    this.checkUrlRouting();
    this.setupEventListeners();
    this.renderHeaderBar();
    this.renderCurrentView();

    window.addEventListener("popstate", () => {
      this.checkUrlRouting();
      this.renderHeaderBar();
      this.renderCurrentView();
    });
  }

  checkUrlRouting() {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const storeParam = urlParams.get("store");
    const subTabParam = urlParams.get("tab");

    let slug = null;
    let isAudit = false;

    if (path.includes("/pharmacy/")) {
      const parts = path.split("/pharmacy/");
      if (parts[1]) {
        const segs = parts[1].split("/").filter(Boolean);
        slug = segs[0] ? segs[0].trim() : null;
        if (segs[1] === "audit" || segs[1] === "dossier" || segs[1] === "stock") {
          isAudit = true;
        }
      }
    } else if (storeParam) {
      slug = storeParam.trim();
      if (subTabParam === "audit") isAudit = true;
    } else if (window.location.hash.startsWith("#/pharmacy/")) {
      const hashParts = window.location.hash.replace("#/pharmacy/", "").split("/").filter(Boolean);
      slug = hashParts[0] ? hashParts[0].trim() : null;
      if (hashParts[1] === "audit") isAudit = true;
    }

    if (slug) {
      let target = this.stores.find((s) => s.slug === slug || s.id === slug);
      if (!target && slug === "anand-chemist") {
        target = this.stores.find((s) => s.slug === "anand-chemist" || s.name.toLowerCase().includes("anand"));
      }
      if (target) {
        this.currentStoreId = target.id;
        this.activeTab = "hosted-site";
        this.hostedSubTab = isAudit ? "audit-dossier" : "storefront";
        return;
      }
    }

    this.loadUserSession();
  }

  // --- Storage & Session Layer ---
  loadStores() {
    const saved = localStorage.getItem("ACS_STORES_DATA_V1");
    if (saved) {
      try {
        this.stores = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local storage, falling back to initial data", e);
        this.stores = JSON.parse(JSON.stringify(INITIAL_STORES_DATA));
      }
    } else {
      this.stores = JSON.parse(JSON.stringify(INITIAL_STORES_DATA));
      this.saveStores();
    }

    if (!this.currentStoreId && this.stores.length > 0) {
      this.currentStoreId = this.stores[0].id;
    }
  }

  saveStores() {
    localStorage.setItem("ACS_STORES_DATA_V1", JSON.stringify(this.stores));
  }

  loadUserSession() {
    const savedUser = localStorage.getItem("ACS_USER_SESSION_V1");
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        if (this.currentUser.storeId) {
          this.currentStoreId = this.currentUser.storeId;
        }
        this.activeTab = "store-detail";
      } catch (e) {
        this.currentUser = null;
        this.activeTab = "landing";
      }
    } else {
      this.currentUser = null;
      this.activeTab = "landing";
    }
  }

  saveUserSession() {
    if (this.currentUser) {
      localStorage.setItem("ACS_USER_SESSION_V1", JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem("ACS_USER_SESSION_V1");
    }
  }

  getCurrentStore() {
    return this.stores.find((s) => s.id === this.currentStoreId) || this.stores[0] || null;
  }

  // --- Authentication System (2 Roles: Pharmacy Owner & Admin) ---
  loginAsOwner(storeId, customOwnerName) {
    const store = this.stores.find((s) => s.id === storeId) || this.stores[0];
    this.currentStoreId = store.id;
    this.currentUser = {
      role: "pharmacy_owner",
      name: customOwnerName || store.ownerName,
      storeId: store.id,
      storeName: store.name
    };
    this.saveUserSession();
    this.activeTab = "store-detail";
    this.renderHeaderBar();
    this.renderCurrentView();
    this.showToast(`Logged in as Pharmacy Owner: ${this.currentUser.name} (${store.name})`, "success");

    // Show celebratory post-login option
    this.promptOwnerPostLoginActions(store);
  }

  loginAsAdmin(adminName = "Dr. Alok Srivastava") {
    this.currentUser = {
      role: "admin",
      name: adminName,
      designation: "State Drug Regulatory Officer & Registrar"
    };
    this.saveUserSession();
    this.activeTab = "directory";
    this.renderHeaderBar();
    this.renderCurrentView();
    this.showToast(`Logged in as State Regulatory Admin (${this.currentUser.name})`, "success");
  }

  logout() {
    this.currentUser = null;
    this.saveUserSession();
    this.activeTab = "landing";
    this.renderHeaderBar();
    this.renderCurrentView();
    this.showToast("Logged out successfully. Returned to Portal Gateway.", "info");
  }

  promptOwnerPostLoginActions(store) {
    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal || !title || !body) return;

    title.innerHTML = `<i class="fa fa-check-circle text-emerald-600"></i> Welcome, ${this.currentUser.name}!`;
    body.innerHTML = `
      <div class="space-y-4 text-xs">
        <div class="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-900">
          <p class="font-bold text-sm text-[#135c7e]">Your Pharmacy is ready on ACS!</p>
          <p class="mt-1 text-slate-600">
            You are managing <strong>${store.name}</strong>. What would you like to do right now?
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onclick="window.acsApp.closeModal(); window.acsApp.viewHostedWebsite('${store.id}')" class="p-4 bg-white hover:bg-slate-50 border-2 border-[#135c7e] rounded-xl text-left transition group">
            <div class="text-xl text-[#135c7e] mb-1"><i class="fa fa-globe"></i></div>
            <strong class="font-bold text-slate-900 block group-hover:text-[#135c7e]">View My Live Hosted Website</strong>
            <span class="text-slate-500 text-[11px] mt-0.5 block">See the public website hosted with your store photo, live medicines & contact.</span>
          </button>

          <button onclick="window.acsApp.closeModal(); window.acsApp.openEditStoreModal('${store.id}')" class="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition group">
            <div class="text-xl text-amber-600 mb-1"><i class="fa fa-pencil-square-o"></i></div>
            <strong class="font-bold text-slate-900 block group-hover:text-amber-600">Update Store Details & Photo</strong>
            <span class="text-slate-500 text-[11px] mt-0.5 block">Change storefront photo, Form 20/21 licenses, hours, or address.</span>
          </button>
        </div>

        <div class="pt-2 flex justify-end">
          <button onclick="window.acsApp.closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg">
            Proceed to Store Dashboard
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  // --- UI Toast System ---
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-msg toast-${type}`;
    
    let icon = "info-circle";
    if (type === "success") icon = "check-circle";
    if (type === "warning") icon = "exclamation-triangle";
    if (type === "danger") icon = "times-circle";

    toast.innerHTML = `
      <i class="fa fa-${icon} text-lg"></i>
      <div class="flex-1 font-medium text-sm">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- Header Navigation & User Bar ---
  renderHeaderBar() {
    const authContainer = document.getElementById("header-auth-controls");
    const storeSelectorContainer = document.getElementById("header-store-selector-container");
    const navBar = document.getElementById("portal-nav-bar");

    if (this.currentUser) {
      // User is logged in
      if (authContainer) {
        const isOwner = this.currentUser.role === "pharmacy_owner";
        authContainer.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 text-xs text-right">
              <span class="text-[10px] uppercase font-bold text-amber-300 block">
                ${isOwner ? "Pharmacy Store Owner" : "State Regulatory Admin"}
              </span>
              <span class="font-bold text-white">${this.currentUser.name}</span>
            </div>
            <button onclick="window.acsApp.logout()" class="bg-rose-600/90 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow">
              <i class="fa fa-sign-out"></i> Logout
            </button>
          </div>
        `;
      }

      if (storeSelectorContainer) {
        if (this.currentUser.role === "admin") {
          storeSelectorContainer.classList.remove("hidden");
          const selector = document.getElementById("header-store-select");
          if (selector) {
            selector.innerHTML = this.stores
              .map(
                (s) =>
                  `<option value="${s.id}" ${s.id === this.currentStoreId ? "selected" : ""}>
                    ${s.name} (${s.district})
                  </option>`
              )
              .join("");
          }
        } else {
          // Pharmacy owner: lock to their store or show switcher if multiple
          storeSelectorContainer.classList.remove("hidden");
          const selector = document.getElementById("header-store-select");
          if (selector) {
            selector.innerHTML = `
              <option value="${this.currentUser.storeId}" selected>
                ${this.currentUser.storeName}
              </option>
            `;
          }
        }
      }

      if (navBar) {
        navBar.classList.remove("hidden");
        // Update nav buttons
        this.updateNavButtonsVisibility();
      }
    } else {
      // Guest / Not logged in: Show Gateway Button
      if (authContainer) {
        authContainer.innerHTML = `
          <button onclick="window.acsApp.switchTab('landing')" class="bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5">
            <i class="fa fa-lock"></i> Portal Login / Access
          </button>
        `;
      }

      if (storeSelectorContainer) {
        storeSelectorContainer.classList.add("hidden");
      }

      if (navBar) {
        navBar.classList.add("hidden");
      }
    }
  }

  updateNavButtonsVisibility() {
    const isOwner = this.currentUser && this.currentUser.role === "pharmacy_owner";
    const dirBtn = document.querySelector('[data-tab="directory"]');
    const hostedBtn = document.querySelector('[data-tab="hosted-site"]');

    if (dirBtn) {
      // Owners focus on their store, but can view directory if needed
      dirBtn.style.display = isOwner ? "none" : "flex";
    }

    if (hostedBtn) {
      hostedBtn.style.display = "flex";
    }
  }

  switchStore(storeId) {
    this.currentStoreId = storeId;
    this.renderHeaderBar();
    this.renderCurrentView();
    this.showToast(`Switched active pharmacy to "${this.getCurrentStore().name}"`, "info");
  }

  switchTab(tabName) {
    this.activeTab = tabName;

    if (window.location.pathname.startsWith("/pharmacy/")) {
      try {
        window.history.pushState({}, "", "/");
      } catch (e) {}
    }

    // Update nav button active states
    document.querySelectorAll(".nav-item-btn").forEach((btn) => {
      if (btn.getAttribute("data-tab") === tabName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    this.renderHeaderBar();
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- View Router ---
  renderCurrentView() {
    const container = document.getElementById("main-view-container");
    if (!container) return;

    // Toggle Portal Header / Footer vs Standalone Hosted Mode
    const portalHeader = document.querySelector("header.no-print");
    const portalFooter = document.querySelector("footer.no-print");
    const mainElement = document.querySelector("main");

    if (this.activeTab === "hosted-site") {
      document.body.classList.add("hosted-mode");
      if (portalHeader) portalHeader.style.display = "none";
      if (portalFooter) portalFooter.style.display = "none";
      if (mainElement) {
        mainElement.className = "w-full p-0 m-0 max-w-none flex-1";
      }
    } else {
      document.body.classList.remove("hosted-mode");
      if (portalHeader) portalHeader.style.display = "";
      if (portalFooter) portalFooter.style.display = "";
      if (mainElement) {
        mainElement.className = "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6";
      }
    }

    // If not authenticated and not on landing, force landing
    if (!this.currentUser && this.activeTab !== "landing" && this.activeTab !== "hosted-site") {
      this.activeTab = "landing";
    }

    const store = this.getCurrentStore();
    this.updatePageSeo(store);

    switch (this.activeTab) {
      case "landing":
        container.innerHTML = this.getLandingPageViewHtml();
        this.bindLandingEvents();
        break;
      case "hosted-site":
        container.innerHTML = this.getHostedWebsiteViewHtml(store);
        this.bindHostedWebsiteEvents();
        break;
      case "directory":
        container.innerHTML = this.getDirectoryViewHtml();
        this.bindDirectoryEvents();
        break;
      case "store-detail":
        container.innerHTML = this.getStoreDetailViewHtml(store);
        this.bindStoreDetailEvents();
        break;
      case "stocks":
        container.innerHTML = this.getStocksViewHtml(store);
        this.bindStockEvents();
        break;
      case "staff":
        container.innerHTML = this.getStaffViewHtml(store);
        this.bindStaffEvents();
        break;
      case "revenue":
        container.innerHTML = this.getRevenueViewHtml(store);
        this.bindRevenueEvents();
        this.renderRevenueCharts(store);
        break;
      case "verify":
        container.innerHTML = this.getVerifyViewHtml();
        this.bindVerifyEvents();
        break;
      default:
        container.innerHTML = this.getLandingPageViewHtml();
        this.bindLandingEvents();
    }
  }

  updatePageSeo(store) {
    const metaDesc = document.getElementById("meta-description");
    const metaKeywords = document.getElementById("meta-keywords");
    const canonical = document.getElementById("canonical-url");
    const ogTitle = document.getElementById("og-title");
    const ogDesc = document.getElementById("og-description");
    const ogUrl = document.getElementById("og-url");
    const ogImg = document.getElementById("og-image");
    const twitterTitle = document.getElementById("twitter-title");
    const twitterDesc = document.getElementById("twitter-description");
    const schemaScript = document.getElementById("seo-schema");

    const setAttr = (el, attr, val) => {
      if (el) {
        if (typeof el.setAttribute === "function") el.setAttribute(attr, val);
        el[attr] = val;
      }
    };

    const baseOrigin = (typeof window !== "undefined" && window.location && window.location.origin && !window.location.origin.includes("localhost"))
      ? window.location.origin
      : "https://acsakhil.com";

    if (this.activeTab === "hosted-site" && store) {
      document.title = `${store.name} - UP FSDA Licensed Retail Pharmacy | ${store.district}, UP`;
      const desc = `${store.name} in ${store.district}, Uttar Pradesh. Official licensed retail pharmacy (Form 20 Lic: ${store.license20}, Form 21 Lic: ${store.license21}). UPPC registered pharmacist on duty. Search live medicine availability, verify drug prices, and order online.`;
      const keywords = `${store.name}, ${store.name} ${store.district}, pharmacy in ${store.city}, chemist ${store.district}, buy medicine ${store.district}, UPPC registered pharmacist, Form 20 ${store.license20}, Schedule H drugs, retail pharmacy Uttar Pradesh`;
      const storeUrl = `${baseOrigin}/pharmacy/${store.slug}`;

      setAttr(metaDesc, "content", desc);
      setAttr(metaKeywords, "content", keywords);
      setAttr(canonical, "href", storeUrl);
      setAttr(ogTitle, "content", `${store.name} | UP FSDA Licensed Pharmacy`);
      setAttr(ogDesc, "content", desc);
      setAttr(ogUrl, "content", storeUrl);
      setAttr(ogImg, "content", store.photoUrl);
      setAttr(twitterTitle, "content", `${store.name} | UP FSDA Licensed Pharmacy`);
      setAttr(twitterDesc, "content", desc);

      if (schemaScript) {
        schemaScript.textContent = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Pharmacy",
          "name": store.name,
          "description": desc,
          "image": store.photoUrl,
          "telephone": store.phone,
          "url": storeUrl,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": store.address,
            "addressLocality": store.city,
            "addressRegion": "Uttar Pradesh",
            "addressCountry": "IN"
          },
          "priceRange": "₹₹",
          "currenciesAccepted": "INR",
          "paymentAccepted": "Cash, UPI, Credit Card, Debit Card",
          "openingHours": store.is24x7 ? "Mo-Su 00:00-24:00" : store.operatingHours,
          "hasMap": `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ' ' + store.address)}`,
          "identifier": [
            {
              "@type": "PropertyValue",
              "name": "Form 20 Retail Drug License",
              "value": store.license20
            },
            {
              "@type": "PropertyValue",
              "name": "Form 21 Retail Drug License",
              "value": store.license21
            },
            {
              "@type": "PropertyValue",
              "name": "GSTIN",
              "value": store.gstin
            }
          ]
        }, null, 2);
      }
    } else {
      document.title = "ACS - All Chemists & Stores Registry | Uttar Pradesh Pharmacy Network";
      const desc = "Official Uttar Pradesh retail pharmacy network and chemists registry. Search live licensed pharmacies, Form 20/21 licenses, UPPC registered pharmacists on duty, and real-time medicine stocks across UP.";
      const keywords = "pharmacy Uttar Pradesh, chemists registry UP, UPPC registered pharmacist, drug license Form 20 Form 21, Anand Chemist, Sanjeevani Medicos, retail pharmacy compliance FSDA, medicine stock availability";
      const siteUrl = `${baseOrigin}/`;

      setAttr(metaDesc, "content", desc);
      setAttr(metaKeywords, "content", keywords);
      setAttr(canonical, "href", siteUrl);
      setAttr(ogTitle, "content", document.title);
      setAttr(ogDesc, "content", desc);
      setAttr(ogUrl, "content", siteUrl);
      setAttr(twitterTitle, "content", document.title);
      setAttr(twitterDesc, "content", desc);

      if (schemaScript) {
        schemaScript.textContent = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalOrganization",
          "name": "ACS Uttar Pradesh Pharmacy Network",
          "url": siteUrl,
          "logo": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=500&q=80",
          "description": desc,
          "areaServed": {
            "@type": "AdministrativeArea",
            "name": "Uttar Pradesh"
          }
        }, null, 2);
      }
    }
  }

  // ==========================================
  // VIEW 0: LANDING PAGE, GATEWAY & SHOWCASE
  // ==========================================
  setLandingSubTab(tab) {
    this.landingSubTab = tab;
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  openDeployedShowcase() {
    this.activeTab = "landing";
    this.landingSubTab = "showcase";
    if (window.location.pathname.startsWith("/pharmacy/")) {
      try {
        window.history.pushState({}, "", "/");
      } catch (e) {}
    }
    this.renderHeaderBar();
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  copyStoreLink(url) {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        this.showToast("Copied live public URL to clipboard!", "success");
      }).catch(() => {
        this.fallbackCopyText(fullUrl);
      });
    } else {
      this.fallbackCopyText(fullUrl);
    }
  }

  fallbackCopyText(text) {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand("copy");
      this.showToast("Copied live public URL to clipboard!", "success");
    } catch (e) {
      this.showToast("URL: " + text, "info");
    }
    document.body.removeChild(el);
  }

  viewHostedAudit(storeId) {
    this.currentStoreId = storeId;
    this.activeTab = "hosted-site";
    this.hostedSubTab = "audit-dossier";
    const store = this.getCurrentStore();
    if (store) {
      try {
        const newPath = `/pharmacy/${store.slug || store.id}/audit`;
        if (window.location.pathname !== newPath) {
          window.history.pushState({ storeId: store.id, tab: "audit" }, "", newPath);
        }
      } catch (e) {}
    }
    this.renderHeaderBar();
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  generateQrSvg(text, size = 180) {
    const N = 25;
    const grid = Array.from({ length: N }, () => Array(N).fill(false));
    
    const drawFinder = (r0, c0) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            grid[r0 + r][c0 + c] = true;
          }
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, N - 7);
    drawFinder(N - 7, 0);

    for (let i = 8; i < N - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 31 + text.charCodeAt(i)) & 0xffffffff;
    }

    let seed = Math.abs(hash) || 123456789;
    const nextRand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const inTL = r < 8 && c < 8;
        const inTR = r < 8 && c >= N - 8;
        const inBL = r >= N - 8 && c < 8;
        const inTiming = (r === 6 && c < N - 8) || (c === 6 && r < N - 8);
        if (inTL || inTR || inBL || inTiming) continue;
        grid[r][c] = nextRand() > 0.52;
      }
    }

    let rects = "";
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (grid[r][c]) {
          rects += `<rect x="${c}" y="${r}" width="1.02" height="1.02" fill="#0f172a" />`;
        }
      }
    }

    return `
      <svg viewBox="0 0 ${N} ${N}" width="${size}" height="${size}" class="rounded-lg shadow-xs bg-white p-2 border border-slate-200">
        ${rects}
      </svg>
    `;
  }

  getLandingPageViewHtml() {
    const isShowcase = this.landingSubTab === "showcase";

    return `
      <div class="space-y-8 animate-fade-in -mt-2">
        <!-- Top Sub-Navigation Switcher -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div class="inline-flex items-center gap-1.5 p-1 bg-slate-200/90 rounded-2xl text-xs font-bold shadow-xs">
            <button 
              onclick="window.acsApp.setLandingSubTab('gateway')" 
              class="px-4 py-2 rounded-xl transition flex items-center gap-2 ${!isShowcase ? 'bg-[#135c7e] text-white shadow font-black' : 'text-slate-600 hover:text-slate-900'}"
            >
              <i class="fa fa-lock"></i>
              <span>Portal Access Gateway</span>
            </button>
            <button 
              onclick="window.acsApp.setLandingSubTab('showcase')" 
              class="px-4 py-2 rounded-xl transition flex items-center gap-2 ${isShowcase ? 'bg-[#135c7e] text-white shadow font-black' : 'text-slate-600 hover:text-slate-900'}"
            >
              <i class="fa fa-globe"></i>
              <span>Live Deployed Pharmacies Directory</span>
              <span class="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black">${this.stores.length} LIVE</span>
            </button>
          </div>

          <div class="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>All Hosted Websites Deployed Live on Vercel & ACS</span>
          </div>
        </div>

        ${isShowcase ? this.getShowcaseViewHtml() : this.getGatewayViewHtml()}
      </div>
    `;
  }

  getShowcaseViewHtml() {
    const query = (this.showcaseSearch || "").toLowerCase();
    const districtFilter = this.showcaseDistrict || "ALL";

    const filteredStores = this.stores.filter((s) => {
      const matchSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query) ||
        s.district.toLowerCase().includes(query) ||
        s.ownerName.toLowerCase().includes(query) ||
        s.license20.toLowerCase().includes(query);

      const matchDistrict = districtFilter === "ALL" || s.district === districtFilter;

      return matchSearch && matchDistrict;
    });

    const districts = Array.from(new Set(this.stores.map((s) => s.district))).sort();

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Official Directory Header with Tricolor Accent -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="tricolor-strip absolute top-0 left-0 right-0"></div>
          
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <div>
              <div class="inline-flex items-center gap-2 text-xs font-bold text-[#135c7e] uppercase tracking-wider mb-1">
                <i class="fa fa-shield text-amber-500"></i> Uttar Pradesh Public Pharmacy Network
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Directory of Live Deployed Pharmacy Websites
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Official public storefront websites hosted under ACS Central Registry with statutory UP FSDA Form 20/21 compliance, active UPPC registered pharmacists, and real-time medicine availability.
              </p>
            </div>

            <div class="flex items-center gap-3">
              <button onclick="window.acsApp.openAddStoreModal()" class="bg-[#135c7e] hover:bg-[#0f4b67] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm">
                <i class="fa fa-plus-circle"></i> Host a New Pharmacy
              </button>
            </div>
          </div>

          <!-- Search & District Filter Controls -->
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div class="sm:col-span-8 relative">
              <i class="fa fa-search absolute left-3.5 top-3.5 text-slate-400 text-xs"></i>
              <input 
                type="text" 
                id="showcase-search-input" 
                placeholder="Search live pharmacy by store name, address, owner, or Form 20 license number..." 
                value="${this.showcaseSearch}"
                class="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#135c7e] bg-slate-50/50"
              />
            </div>
            <div class="sm:col-span-4">
              <select 
                id="showcase-district-select" 
                class="w-full py-2.5 px-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#135c7e] bg-white font-medium text-slate-700"
              >
                <option value="ALL" ${districtFilter === "ALL" ? "selected" : ""}>All UP Districts (${this.stores.length} Stores)</option>
                ${districts.map((d) => `
                  <option value="${d}" ${districtFilter === d ? "selected" : ""}>District: ${d}</option>
                `).join("")}
              </select>
            </div>
          </div>
        </div>

        <!-- Deployed Pharmacy Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${filteredStores.length === 0 ? `
            <div class="col-span-full bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
              <i class="fa fa-globe text-4xl text-slate-300 mb-2"></i>
              <h4 class="font-bold text-slate-700 text-base">No Deployed Pharmacies Found</h4>
              <p class="text-xs text-slate-500 mt-1">Try adjusting your search query or district filter.</p>
            </div>
          ` : filteredStores.map((s) => {
            const chief = s.staff.find((st) => st.isOnDuty && st.uppcRegNo && st.uppcRegNo.startsWith("UPPC")) || s.staff.find((st) => st.role.includes("Chief") || (st.uppcRegNo && st.uppcRegNo.startsWith("UPPC"))) || s.staff[0];
            const liveUrl = `${window.location.origin}/pharmacy/${s.slug}`;
            const cleanPhone = s.phone.replace(/[^0-9]/g, "");

            return `
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#135c7e]/60 transition overflow-hidden flex flex-col justify-between group">
                <div>
                  <!-- Storefront Facade Photo -->
                  <div class="relative h-44 bg-slate-900 overflow-hidden">
                    <img src="${s.photoUrl}" alt="${s.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90" onerror="this.src='https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80'" />
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

                    <div class="absolute top-3 left-3 flex items-center gap-1.5">
                      <span class="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                        <i class="fa fa-check-circle"></i> UP FSDA Verified
                      </span>
                      ${s.is24x7 ? `<span class="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow">24x7 Open</span>` : ''}
                    </div>

                    <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span class="text-xs font-mono bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/20">
                        ${s.id.toUpperCase()}
                      </span>
                      <span class="text-xs font-bold text-amber-300">
                        <i class="fa fa-map-marker"></i> ${s.district}, UP
                      </span>
                    </div>
                  </div>

                  <!-- Card Body -->
                  <div class="p-5 space-y-4">
                    <div>
                      <h3 class="text-base font-black text-slate-900 line-clamp-1 group-hover:text-[#135c7e] transition">
                        ${s.name}
                      </h3>
                      <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">${s.address}</p>
                    </div>

                    <!-- Live Public URL Pill -->
                    <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                      <div class="flex items-center gap-1.5 min-w-0">
                        <i class="fa fa-link text-[#135c7e] text-xs flex-shrink-0"></i>
                        <span class="font-mono text-[11px] text-[#135c7e] font-bold truncate">/pharmacy/${s.slug}</span>
                      </div>
                      <button 
                        onclick="window.acsApp.copyStoreLink('/pharmacy/${s.slug}')" 
                        class="bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-bold text-[10px] transition flex-shrink-0 flex items-center gap-1"
                        title="Copy direct live webpage link"
                      >
                        <i class="fa fa-copy"></i> Copy
                      </button>
                    </div>

                    <!-- License & Pharmacist Snapshot -->
                    <div class="grid grid-cols-2 gap-2 text-[11px] border-t border-slate-100 pt-3">
                      <div>
                        <span class="text-slate-400 block font-medium">Form 20 Retail:</span>
                        <span class="font-mono font-bold text-slate-800 text-xs truncate block">${s.license20}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block font-medium">Form 21 Biological:</span>
                        <span class="font-mono font-bold text-slate-800 text-xs truncate block">${s.license21}</span>
                      </div>
                    </div>

                    <div class="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="text-slate-500 font-medium">Pharmacist Incharge:</span>
                        <span class="font-bold text-slate-900">${chief ? chief.name : 'Qualified Pharmacist'}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-slate-500 font-medium">UPPC Reg ID:</span>
                        <span class="font-mono font-bold text-[#135c7e]">${chief ? chief.uppcRegNo : 'UPPC-PH'}</span>
                      </div>
                      <div class="flex items-center justify-between text-[11px] pt-1 border-t border-teal-200/50">
                        <span class="text-emerald-800 font-semibold"><i class="fa fa-cubes"></i> ${s.stocks.length} Live Medicines</span>
                        <span class="text-slate-500">Owner: ${s.ownerName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Card Actions -->
                <div class="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col gap-2">
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <button 
                      onclick="window.acsApp.viewHostedWebsite('${s.id}')" 
                      class="bg-[#135c7e] hover:bg-[#0f4b67] text-white py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <i class="fa fa-globe"></i> Open Storefront
                    </button>
                    <button 
                      onclick="window.acsApp.viewHostedAudit('${s.id}')" 
                      class="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <i class="fa fa-file-text-o"></i> Audit Dossier
                    </button>
                  </div>

                  <div class="grid grid-cols-2 gap-2 text-[11px]">
                    <button 
                      onclick="window.acsApp.openStoreCertificateModal('${s.id}')" 
                      class="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 py-1.5 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1"
                    >
                      <i class="fa fa-certificate text-amber-600"></i> QR Certificate
                    </button>
                    <a 
                      href="tel:${cleanPhone}" 
                      class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-1.5 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 text-center"
                    >
                      <i class="fa fa-phone text-[#135c7e]"></i> ${s.phone}
                    </a>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  getGatewayViewHtml() {
    return `
      <div class="space-y-10 animate-fade-in">
        <!-- Deployed Showcase Banner Shortcut -->
        <div class="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-amber-300">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center text-lg flex-shrink-0 shadow">
              <i class="fa fa-globe"></i>
            </span>
            <div>
              <strong class="text-slate-950 text-sm font-black block">Explore All 5 Live Deployed Pharmacy Storefronts</strong>
              <span class="text-slate-900 text-xs font-medium">Browse verified pharmacy websites with Form 20/21 compliance, photos, and live medicine stocks.</span>
            </div>
          </div>
          <button 
            onclick="window.acsApp.setLandingSubTab('showcase')" 
            class="bg-slate-950 hover:bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <span>Open Deployed Websites Directory</span>
            <i class="fa fa-arrow-right text-amber-400"></i>
          </button>
        </div>

        <!-- Hero Section with Dual Columns -->
        <div class="bg-gradient-to-br from-[#0e445e] via-[#135c7e] to-[#1e3e6b] text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
          <!-- Background Subtle Pattern -->
          <div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/5 pointer-events-none"></div>
          <div class="absolute right-40 top-10 w-48 h-48 rounded-full bg-amber-400/10 pointer-events-none"></div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <!-- Left Hero Content -->
            <div class="lg:col-span-7 space-y-5">
              <div class="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide">
                <i class="fa fa-shield"></i> State Pharmacy & Medicine Data Registry
              </div>
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Host Your Pharmacy.<br />
                <span class="text-amber-400">Get a Real Live Website</span> & Statutory Compliance.
              </h1>
              <p class="text-teal-100 text-sm sm:text-base leading-relaxed max-w-xl">
                The centralized portal for Uttar Pradesh pharmacy owners to create their verified public storefront website, manage UPPC registered pharmacists, track live medicine batches, and secure financial records.
              </p>

              <!-- Live Stat Badges -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl text-center">
                  <span class="text-xl sm:text-2xl font-black text-amber-300 block">1,280+</span>
                  <span class="text-[11px] text-teal-100 font-medium">Licensed Stores</span>
                </div>
                <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl text-center">
                  <span class="text-xl sm:text-2xl font-black text-amber-300 block">5,120+</span>
                  <span class="text-[11px] text-teal-100 font-medium">UPPC Pharmacists</span>
                </div>
                <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl text-center">
                  <span class="text-xl sm:text-2xl font-black text-amber-300 block">1.4L+</span>
                  <span class="text-[11px] text-teal-100 font-medium">Medicine Batches</span>
                </div>
                <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl text-center">
                  <span class="text-xl sm:text-2xl font-black text-amber-300 block">75</span>
                  <span class="text-[11px] text-teal-100 font-medium">UP Districts</span>
                </div>
              </div>
            </div>

            <!-- Right Hero: 2-Role Login Box -->
            <div class="lg:col-span-5 bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-100">
              <div class="text-center pb-4 border-b border-slate-100">
                <span class="w-10 h-10 rounded-xl bg-teal-50 text-[#135c7e] inline-flex items-center justify-center text-lg font-black mb-2">
                  <i class="fa fa-lock"></i>
                </span>
                <h3 class="text-lg font-extrabold text-slate-900">ACS Portal Access Gateway</h3>
                <p class="text-xs text-slate-500 mt-0.5">Select your role to access your management dashboard</p>
              </div>

              <!-- Role Selector Tabs: 2 Roles ONLY -->
              <div class="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mt-4 mb-4 text-xs font-bold">
                <button id="tab-login-owner" class="py-2.5 rounded-lg text-center transition ${this.landingLoginRole === 'pharmacy_owner' ? 'bg-[#135c7e] text-white shadow' : 'text-slate-600 hover:text-slate-900'}">
                  <i class="fa fa-hospital-o mr-1"></i> Pharmacy Owner
                </button>
                <button id="tab-login-admin" class="py-2.5 rounded-lg text-center transition ${this.landingLoginRole === 'admin' ? 'bg-[#135c7e] text-white shadow' : 'text-slate-600 hover:text-slate-900'}">
                  <i class="fa fa-shield mr-1"></i> State Admin
                </button>
              </div>

              <!-- Login Form Container -->
              <div id="landing-login-form-container">
                <!-- Dynamically rendered based on active role tab -->
              </div>
            </div>
          </div>
        </div>

        <!-- 4 Pillars Section: Why Host with ACS -->
        <div class="space-y-6">
          <div class="text-center max-w-2xl mx-auto">
            <span class="text-xs font-bold uppercase tracking-wider text-[#135c7e] bg-teal-50 px-3 py-1 rounded-full">
              Complete Digital Ecosystem
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Everything Your Pharmacy Needs in One Platform
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              From instant hosted customer websites to stringent Pharmacy Act compliance.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="portal-card p-6 bg-white flex flex-col justify-between">
              <div>
                <div class="w-12 h-12 rounded-xl bg-teal-50 text-[#135c7e] flex items-center justify-center text-xl mb-4">
                  <i class="fa fa-globe"></i>
                </div>
                <h4 class="font-bold text-slate-900 text-base">Your Own Hosted Website</h4>
                <p class="text-xs text-slate-600 mt-2 leading-relaxed">
                  Every pharmacy gets a dedicated live public website with storefront photos, Form 20/21 license numbers, WhatsApp ordering, and patient prescription uploads.
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-[#135c7e]">
                Live Instant URL Preview &rarr;
              </div>
            </div>

            <div class="portal-card p-6 bg-white flex flex-col justify-between">
              <div>
                <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl mb-4">
                  <i class="fa fa-user-md"></i>
                </div>
                <h4 class="font-bold text-slate-900 text-base">UPPC Pharmacist Vault</h4>
                <p class="text-xs text-slate-600 mt-2 leading-relaxed">
                  Log on-duty registered pharmacists with authentic UPPC numbers, shift timings, degree qualifications, and Aadhaar-linked verification for state inspections.
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-blue-700">
                Section 42 Pharmacy Act &rarr;
              </div>
            </div>

            <div class="portal-card p-6 bg-white flex flex-col justify-between">
              <div>
                <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl mb-4">
                  <i class="fa fa-cubes"></i>
                </div>
                <h4 class="font-bold text-slate-900 text-base">Schedule H/H1 Batch Stock</h4>
                <p class="text-xs text-slate-600 mt-2 leading-relaxed">
                  Real-time stock register with manufacturer, batch codes, expiration alerts, schedule classification, and 1-click CSV bulk import/export.
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700">
                Low Stock & Expiry Alerts &rarr;
              </div>
            </div>

            <div class="portal-card p-6 bg-white flex flex-col justify-between">
              <div>
                <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl mb-4">
                  <i class="fa fa-lock"></i>
                </div>
                <h4 class="font-bold text-slate-900 text-base">Private Financial Ledger</h4>
                <p class="text-xs text-slate-600 mt-2 leading-relaxed">
                  Track daily turnover, digital vs. cash transactions, and GST accounting. Keep figures masked with the on-demand Financial Privacy Lock.
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-amber-700">
                Eye Toggle Privacy Mask &rarr;
              </div>
            </div>
          </div>
        </div>

        <!-- Sample Live Hosted Stores Preview Banner -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
                <i class="fa fa-desktop text-[#135c7e]"></i> Explore Live Hosted Pharmacy Websites
              </h3>
              <p class="text-xs text-slate-500">
                Click any store below to see the real hosted webpage generated by the platform.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="window.acsApp.setLandingSubTab('showcase')" class="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm">
                <i class="fa fa-list"></i> Full Live Directory (${this.stores.length})
              </button>
              <button onclick="window.acsApp.openAddStoreModal()" class="bg-[#135c7e] hover:bg-[#0f4b67] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                <i class="fa fa-plus-circle"></i> Host Your Own Pharmacy
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${this.stores.map((s) => `
              <div class="border border-slate-200 rounded-xl p-3 bg-slate-50 hover:bg-white hover:border-[#135c7e] transition group flex flex-col justify-between">
                <div>
                  <div class="h-28 rounded-lg overflow-hidden relative mb-2.5">
                    <img src="${s.photoUrl}" alt="${s.name}" class="w-full h-full object-cover group-hover:scale-105 transition" />
                    <span class="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      ${s.status}
                    </span>
                  </div>
                  <h5 class="font-bold text-xs text-slate-800 line-clamp-1">${s.name}</h5>
                  <span class="text-[11px] text-slate-500 block"><i class="fa fa-map-marker text-amber-500"></i> ${s.district}, UP</span>
                </div>
                <div class="mt-3 pt-2 border-t border-slate-200 flex flex-col gap-1.5">
                  <button onclick="window.acsApp.viewHostedWebsite('${s.id}')" class="w-full bg-[#135c7e] hover:bg-[#0f4b67] text-white text-[11px] font-bold py-1.5 rounded-lg transition flex items-center justify-center gap-1">
                    <i class="fa fa-globe"></i> View Hosted Site
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }

  bindLandingEvents() {
    // If on showcase sub-tab, bind showcase filters
    if (this.landingSubTab === "showcase") {
      const searchInput = document.getElementById("showcase-search-input");
      const districtSelect = document.getElementById("showcase-district-select");

      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          this.showcaseSearch = e.target.value;
          this.renderCurrentView();
          const nextInput = document.getElementById("showcase-search-input");
          if (nextInput) {
            nextInput.focus();
            nextInput.setSelectionRange(this.showcaseSearch.length, this.showcaseSearch.length);
          }
        });
      }

      if (districtSelect) {
        districtSelect.addEventListener("change", (e) => {
          this.showcaseDistrict = e.target.value;
          this.renderCurrentView();
        });
      }
      return;
    }

    // Otherwise, bind Gateway Login Events
    const tabOwner = document.getElementById("tab-login-owner");
    const tabAdmin = document.getElementById("tab-login-admin");
    const formContainer = document.getElementById("landing-login-form-container");

    const renderRoleForm = () => {
      if (!formContainer) return;

      if (this.landingLoginRole === "pharmacy_owner") {
        formContainer.innerHTML = `
          <div class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Select Your Registered Pharmacy:</label>
              <select id="landing-owner-store-select" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#135c7e] font-medium">
                ${this.stores.map(s => `<option value="${s.id}">${s.name} (${s.district})</option>`).join("")}
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Owner Name / Pharmacist Mobile:</label>
              <input type="text" id="landing-owner-mobile" value="+91 94150 28419" placeholder="Enter registered phone number" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#135c7e]" />
            </div>

            <div class="pt-2 flex flex-col gap-2">
              <button id="btn-submit-owner-login" class="w-full py-2.5 bg-[#135c7e] hover:bg-[#0f4b67] text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2">
                <span>Enter Pharmacy Dashboard</span>
                <i class="fa fa-arrow-right"></i>
              </button>

              <button id="btn-landing-onboard-store" class="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl transition flex items-center justify-center gap-1.5">
                <i class="fa fa-plus-circle text-amber-600"></i>
                <span>Host a Brand New Pharmacy</span>
              </button>
            </div>

            <div class="text-[11px] text-slate-400 text-center pt-1">
              <i class="fa fa-info-circle text-teal-600"></i> No password required for demo testing. Pre-linked to UP Form 20/21 licenses.
            </div>
          </div>
        `;

        const btnLogin = document.getElementById("btn-submit-owner-login");
        const btnOnboard = document.getElementById("btn-landing-onboard-store");
        const selectStore = document.getElementById("landing-owner-store-select");

        if (btnLogin && selectStore) {
          btnLogin.addEventListener("click", () => {
            const storeId = selectStore.value;
            this.loginAsOwner(storeId);
          });
        }

        if (btnOnboard) {
          btnOnboard.addEventListener("click", () => {
            this.openAddStoreModal();
          });
        }

      } else {
        // Admin Form
        formContainer.innerHTML = `
          <div class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">State Regulatory Admin Email:</label>
              <input type="email" id="landing-admin-email" value="admin@acs.up.gov.in" readonly class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-slate-600" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Authority Designation:</label>
              <input type="text" value="State Drug Registrar & Senior Auditor" readonly class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600" />
            </div>

            <div class="pt-2">
              <button id="btn-submit-admin-login" class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl shadow transition flex items-center justify-center gap-2">
                <i class="fa fa-shield"></i>
                <span>Login as State Regulatory Admin</span>
              </button>
            </div>

            <div class="text-[11px] text-slate-400 text-center pt-1">
              <i class="fa fa-lock text-amber-500"></i> Full administrative oversight across all 75 Uttar Pradesh districts.
            </div>
          </div>
        `;

        const btnAdminLogin = document.getElementById("btn-submit-admin-login");
        if (btnAdminLogin) {
          btnAdminLogin.addEventListener("click", () => {
            this.loginAsAdmin();
          });
        }
      }
    };

    if (tabOwner && tabAdmin) {
      tabOwner.addEventListener("click", () => {
        this.landingLoginRole = "pharmacy_owner";
        tabOwner.className = "py-2.5 rounded-lg text-center transition bg-[#135c7e] text-white shadow";
        tabAdmin.className = "py-2.5 rounded-lg text-center transition text-slate-600 hover:text-slate-900";
        renderRoleForm();
      });

      tabAdmin.addEventListener("click", () => {
        this.landingLoginRole = "admin";
        tabAdmin.className = "py-2.5 rounded-lg text-center transition bg-[#135c7e] text-white shadow";
        tabOwner.className = "py-2.5 rounded-lg text-center transition text-slate-600 hover:text-slate-900";
        renderRoleForm();
      });
    }

    renderRoleForm();
  }

  setHostedSubTab(tab) {
    this.hostedSubTab = tab;
    const store = this.getCurrentStore();
    if (store) {
      try {
        const newPath = tab === "audit-dossier" 
          ? `/pharmacy/${store.slug || store.id}/audit` 
          : `/pharmacy/${store.slug || store.id}`;
        if (window.location.pathname !== newPath) {
          window.history.pushState({ storeId: store.id, subTab: tab }, "", newPath);
        }
      } catch (e) {}
    }
    this.renderCurrentView();
  }

  // ==========================================
  // VIEW: REAL HOSTED PHARMACY WEBSITE
  // ==========================================
  viewHostedWebsite(storeId) {
    this.currentStoreId = storeId;
    this.activeTab = "hosted-site";
    const store = this.getCurrentStore();
    if (store) {
      try {
        const newPath = `/pharmacy/${store.slug || store.id}`;
        if (window.location.pathname !== newPath) {
          window.history.pushState({ storeId: store.id }, "", newPath);
        }
      } catch (e) {}
    }
    this.renderHeaderBar();
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  getHostedWebsiteViewHtml(store) {
    if (!store) return `<div class="p-8 text-center bg-white rounded-xl">No store found.</div>`;

    const isAudit = this.hostedSubTab === "audit-dossier";
    const cleanPhone = store.phone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=Hello%20${encodeURIComponent(store.name)},%20I%20am%20inquiring%20about%20medicine%20availability.`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ' ' + store.address)}`;

    // Pharmacist on Duty summary (prioritizes currently clocked-in duty pharmacist)
    const chiefPharmacist = store.staff.find((st) => st.isOnDuty && st.uppcRegNo && st.uppcRegNo.startsWith("UPPC")) ||
      store.staff.find((st) => st.role.includes("Chief") || (st.uppcRegNo && st.uppcRegNo.startsWith("UPPC"))) ||
      store.staff[0];

    // Filter stocks for public storefront search (Page 1)
    const filteredPublicStock = store.stocks.filter((m) => {
      if (!this.hostedStockSearch) return true;
      const q = this.hostedStockSearch.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.saltName.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q)
      );
    });

    // Filter stocks for audit dossier search (Page 2)
    const auditQuery = (this.auditStockSearch || "").toLowerCase();
    const auditSched = this.auditScheduleFilter || "ALL";
    const auditAlert = this.auditAlertFilter || "ALL";

    const filteredAuditStock = store.stocks.filter((m) => {
      const matchSearch = !auditQuery ||
        m.name.toLowerCase().includes(auditQuery) ||
        m.saltName.toLowerCase().includes(auditQuery) ||
        m.batchNo.toLowerCase().includes(auditQuery) ||
        m.manufacturer.toLowerCase().includes(auditQuery);

      const matchSchedule = auditSched === "ALL" || m.schedule.includes(auditSched);

      let matchAlert = true;
      if (auditAlert === "LOW_STOCK") {
        matchAlert = m.quantity <= (m.minAlertThreshold || 20);
      } else if (auditAlert === "EXPIRING") {
        const exp = new Date(m.expiryDate);
        const diffMonths = (exp.getFullYear() - 2026) * 12 + (exp.getMonth() - 9);
        matchAlert = diffMonths <= 3;
      }

      return matchSearch && matchSchedule && matchAlert;
    });

    // Statutory metrics for Page 2
    const totalInventoryValue = store.stocks.reduce((acc, curr) => acc + (curr.quantity * curr.purchaseRate), 0);
    const lowStockCount = store.stocks.filter((m) => m.quantity <= (m.minAlertThreshold || 20)).length;
    const expiringCount = store.stocks.filter((m) => {
      const exp = new Date(m.expiryDate);
      const diffMonths = (exp.getFullYear() - 2026) * 12 + (exp.getMonth() - 9);
      return diffMonths <= 3;
    }).length;
    const uppcStaffCount = store.staff.filter((st) => st.uppcRegNo && st.uppcRegNo.startsWith("UPPC")).length;
    const rev = store.revenueData;

    return `
      <div class="hosted-standalone-site w-full bg-white text-slate-800 animate-fade-in min-h-screen flex flex-col justify-between">
        <!-- Micro Statutory Top Bar -->
        <div class="bg-teal-950 text-teal-100 py-2.5 px-6 sm:px-12 flex flex-wrap items-center justify-between text-xs border-b border-teal-900">
          <div class="flex items-center gap-3">
            <span><i class="fa fa-shield text-amber-400"></i> UP FSDA Licensed Retail Pharmacy</span>
            <span class="text-teal-700">|</span>
            <span class="font-mono text-teal-200">Lic 20: ${store.license20}</span>
            <span class="text-teal-700 hidden sm:inline">|</span>
            <span class="font-mono text-teal-200 hidden sm:inline">Lic 21: ${store.license21}</span>
            <span class="text-teal-700 hidden md:inline">|</span>
            <span class="hidden md:inline"><i class="fa fa-map-marker text-amber-400"></i> ${store.district}, Uttar Pradesh</span>
          </div>
          <div class="flex items-center gap-3">
            <span>Hours: <strong>${store.operatingHours}</strong></span>
            ${store.is24x7 ? `<span class="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">24x7 Open</span>` : ''}
            <span class="text-teal-700 hidden sm:inline">|</span>
            <a href="tel:${cleanPhone}" class="text-amber-300 hover:text-white font-bold hidden sm:inline">
              <i class="fa fa-phone"></i> ${store.phone}
            </a>
          </div>
        </div>

        <!-- Real Standalone Pharmacy Navbar -->
        <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 py-4 px-6 sm:px-12 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#135c7e] to-[#2c5895] text-white flex items-center justify-center text-xl font-black shadow-md flex-shrink-0">
              <i class="fa fa-plus"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">${store.name}</h1>
                <span class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border border-emerald-300 flex items-center gap-1">
                  <i class="fa fa-check-circle"></i> UPPC Verified
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <i class="fa fa-map-marker text-slate-400"></i> ${store.address}
              </p>
            </div>
          </div>

          <!-- Navigation Switcher & Direct Actions -->
          <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div class="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button 
                onclick="window.acsApp.setHostedSubTab('storefront')" 
                class="px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${!isAudit ? 'bg-white text-[#135c7e] shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'}"
              >
                <i class="fa fa-medkit"></i> Storefront & Medicines
              </button>
              <button 
                onclick="window.acsApp.setHostedSubTab('audit-dossier')" 
                class="px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${isAudit ? 'bg-[#135c7e] text-white shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'}"
              >
                <i class="fa fa-file-text-o"></i> Statutory Audit Dossier
              </button>
            </div>

            <div class="h-6 w-px bg-slate-200 hidden md:block"></div>

            <a href="tel:${cleanPhone}" class="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5">
              <i class="fa fa-phone text-[#135c7e]"></i> Call Store
            </a>
            <a href="${waUrl}" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm">
              <i class="fa fa-whatsapp text-sm"></i> WhatsApp
            </a>
            <button onclick="window.acsApp.openPrescriptionUploadModal('${store.name}')" class="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3.5 py-2 rounded-xl font-black transition flex items-center gap-1.5 shadow-sm">
              <i class="fa fa-file-text-o"></i> Upload Rx
            </button>
            <button onclick="window.acsApp.openStoreCertificateModal('${store.id}')" class="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs">
              <i class="fa fa-certificate text-amber-600"></i> QR Certificate
            </button>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="flex-1 w-full">
          ${!isAudit ? `
            <!-- ======================================================== -->
            <!-- PAGE 1: PUBLIC PATIENT STOREFRONT VIEW                  -->
            <!-- ======================================================== -->
            <div>
              <!-- Store Hero Banner Image -->
              <div class="relative h-72 sm:h-96 bg-slate-900 overflow-hidden">
                <img src="${store.photoUrl}" alt="${store.name}" class="w-full h-full object-cover opacity-90 transition duration-500 hover:scale-105" onerror="this.src='https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80'" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent"></div>
                
                <div class="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-12 sm:right-12 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span class="text-xs font-black uppercase tracking-widest text-amber-300 block mb-1">
                      Licensed Retail Chemists & Druggists
                    </span>
                    <h2 class="text-2xl sm:text-4xl font-black">${store.name}</h2>
                    <p class="text-xs sm:text-sm text-slate-200 mt-2 max-w-2xl leading-relaxed">
                      Dispensing 100% genuine allopathic, biological, and OTC medications under constant supervision of qualified UPPC registered pharmacists.
                    </p>
                  </div>

                  <div class="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs">
                    <div>
                      <span class="text-slate-400 block text-[10px] uppercase font-bold">Form 20 Lic:</span>
                      <span class="font-mono font-bold text-white text-xs">${store.license20}</span>
                    </div>
                    <div class="h-7 w-px bg-white/20"></div>
                    <div>
                      <span class="text-slate-400 block text-[10px] uppercase font-bold">Form 21 Lic:</span>
                      <span class="font-mono font-bold text-white text-xs">${store.license21}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Main Body Grid: Pharmacist on Duty & Live Medicine Search -->
              <div class="max-w-7xl mx-auto p-6 sm:p-12 space-y-8">
                <!-- Grid: 3 Highlight Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Pharmacist On Duty -->
                  <div class="p-6 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col justify-between shadow-sm">
                    <div>
                      <div class="flex items-center justify-between gap-2 mb-3">
                        <span class="text-[#135c7e] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <i class="fa fa-user-md text-base text-teal-700"></i> Registered Pharmacist
                        </span>
                        <span class="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> ON ACTIVE DUTY
                        </span>
                      </div>

                      <h3 class="text-lg font-black text-slate-900">${chiefPharmacist ? chiefPharmacist.name : 'Qualified Pharmacist'}</h3>
                      <span class="text-xs text-teal-800 font-semibold block">${chiefPharmacist ? chiefPharmacist.qualification : 'B.Pharm (UP)'}</span>
                      
                      <div class="mt-3 pt-3 border-t border-teal-200/80 space-y-2 text-xs text-slate-700">
                        <div class="flex items-center justify-between">
                          <span class="text-slate-500 font-medium">UPPC Reg ID:</span>
                          <span class="font-mono font-bold text-[#135c7e] bg-teal-100/80 px-2 py-0.5 rounded">${chiefPharmacist ? chiefPharmacist.uppcRegNo : 'UPPC-PH-41290'}</span>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-slate-500 font-medium">Shift Timing:</span>
                          <span class="font-bold text-slate-800">${chiefPharmacist ? chiefPharmacist.shift : 'Active Duty'}</span>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-slate-500 font-medium">Biometric Check-In:</span>
                          <span class="font-mono font-bold text-slate-800">${chiefPharmacist ? (chiefPharmacist.dutyCheckInTime || '08:30 AM Logged') : 'Verified'}</span>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-slate-500 font-medium">Aadhaar Linked:</span>
                          <span class="text-emerald-700 font-bold"><i class="fa fa-check-circle"></i> Biometric Verified</span>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-teal-200/80 text-[11px] text-teal-900 flex items-center gap-1.5 font-semibold">
                      <i class="fa fa-shield text-teal-700"></i> Personally present for prescription dispensing (Sec 42 Pharmacy Act).
                    </div>
                  </div>

                  <!-- Store Facilities & Cold Storage -->
                  <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                      <div class="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-3">
                        <i class="fa fa-snowflake-o text-base text-blue-600"></i> Cold Chain & Storage
                      </div>
                      <h3 class="text-base font-bold text-slate-900">Certified Refrigerated Bins</h3>
                      <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        Insulin, vaccines, biologicals, and injectables strictly preserved at 2°C – 8°C with digital temperature monitoring.
                      </p>
                      <div class="mt-3 space-y-1.5 text-xs text-slate-600">
                        <div class="flex items-center gap-2"><i class="fa fa-check text-emerald-600"></i> Daily digital temperature logbook maintained</div>
                        <div class="flex items-center gap-2"><i class="fa fa-check text-emerald-600"></i> Dedicated backup generator power supply</div>
                      </div>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <i class="fa fa-shield text-slate-400"></i> Inspected by District Drug Inspector (UP FSDA).
                    </div>
                  </div>

                  <!-- Location & GPS Directions -->
                  <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                      <div class="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-3">
                        <i class="fa fa-location-arrow text-base text-amber-600"></i> Store Location & GPS
                      </div>
                      <h3 class="text-base font-bold text-slate-900">${store.city}, Uttar Pradesh</h3>
                      <p class="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                        ${store.address}
                      </p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-200">
                      <a href="${mapsUrl}" target="_blank" class="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white py-2.5 px-3 rounded-xl text-xs font-bold transition shadow-sm">
                        <i class="fa fa-map-marker text-amber-400"></i> Open in Google Maps
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Live Medicine Search for Customers -->
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
                  <!-- Schedule H Statutory Advisory Caution Box -->
                  <div class="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs text-rose-950 flex items-start gap-3.5 shadow-xs">
                    <div class="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-base flex-shrink-0 mt-0.5">
                      <i class="fa fa-exclamation-triangle"></i>
                    </div>
                    <div>
                      <strong class="font-black text-rose-900 block text-sm">SCHEDULE H / H1 PRESCRIPTION MEDICINE STATUTORY WARNING</strong>
                      <p class="text-rose-800 mt-0.5 leading-relaxed">
                        In accordance with the Drugs and Cosmetics Rules 1945 (Rule 65), medicines marked as Schedule H or Schedule H1 cannot be sold by retail without the written prescription of a Registered Medical Practitioner. Our on-duty UPPC registered pharmacist verifies all prescriptions prior to dispensing.
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 class="text-xl font-black text-slate-900 flex items-center gap-2">
                        <i class="fa fa-search text-[#135c7e]"></i> Check Medicine Availability
                      </h3>
                      <p class="text-xs text-slate-500 mt-0.5">
                        Search for medicines, generic compositions, or brand names to check real-time stock at this store.
                      </p>
                    </div>
                    <span class="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-3.5 py-1.5 rounded-full self-start sm:self-auto flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      ${store.stocks.length} Medicines in Live Database
                    </span>
                  </div>

                  <!-- Search Input -->
                  <div class="relative">
                    <i class="fa fa-search absolute left-4 top-3.5 text-slate-400 text-sm"></i>
                    <input 
                      type="text" 
                      id="hosted-stock-search-input" 
                      placeholder="Search medicine brand, generic composition (e.g. Paracetamol, Augmentin, Insulin, Telmisartan)..." 
                      value="${this.hostedStockSearch}"
                      class="w-full pl-11 pr-4 py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#135c7e] bg-slate-50/50"
                    />
                  </div>

                  <!-- Medicine Availability Table -->
                  <div class="overflow-x-auto rounded-xl border border-slate-200">
                    <table class="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr class="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                          <th class="py-3 px-4">Medicine & Composition</th>
                          <th class="py-3 px-3">Manufacturer</th>
                          <th class="py-3 px-3">Schedule</th>
                          <th class="py-3 px-3">Availability</th>
                          <th class="py-3 px-3">Unit Price (MRP)</th>
                          <th class="py-3 px-4 text-right">Inquire / Order</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        ${filteredPublicStock.length === 0 ? `
                          <tr>
                            <td colspan="6" class="py-10 text-center text-slate-400">
                              <i class="fa fa-medkit text-3xl mb-2 text-slate-300 block"></i>
                              No medicines found matching "${this.hostedStockSearch}". Please call the store directly at ${store.phone} or upload your prescription.
                            </td>
                          </tr>
                        ` : filteredPublicStock.map((m) => {
                          const inStock = m.quantity > 0;
                          return `
                            <tr class="hover:bg-slate-50/80 transition">
                              <td class="py-3 px-4">
                                <span class="font-bold text-slate-900 text-sm block">${m.name}</span>
                                <span class="text-[11px] text-slate-500 font-mono">${m.saltName}</span>
                              </td>
                              <td class="py-3 px-3 text-slate-700 font-medium">${m.manufacturer}</td>
                              <td class="py-3 px-3">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${m.schedule.includes('H') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'}">
                                  ${m.schedule}
                                </span>
                              </td>
                              <td class="py-3 px-3">
                                ${inStock ? `
                                  <span class="text-emerald-700 font-bold flex items-center gap-1.5">
                                    <i class="fa fa-check-circle"></i> In Stock (${m.quantity} ${m.unit})
                                  </span>
                                ` : `
                                  <span class="text-rose-600 font-bold flex items-center gap-1.5">
                                    <i class="fa fa-times-circle"></i> Out of Stock
                                  </span>
                                `}
                              </td>
                              <td class="py-3 px-3 font-bold text-slate-900 text-sm">
                                ₹ ${m.mrp.toFixed(2)}
                              </td>
                              <td class="py-3 px-4 text-right">
                                <a href="${waUrl}&text=Hello,%20is%20${encodeURIComponent(m.name)}%20available?" target="_blank" class="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-sm">
                                  <i class="fa fa-whatsapp"></i> Inquire
                                </a>
                              </td>
                            </tr>
                          `;
                        }).join("")}
                      </tbody>
                    </table>
                  </div>

                  <!-- Prescription Upload CTA Strip -->
                  <div class="p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-amber-50 border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div class="flex items-center gap-3.5">
                      <span class="w-11 h-11 rounded-2xl bg-[#135c7e] text-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                        <i class="fa fa-file-text-o"></i>
                      </span>
                      <div>
                        <strong class="font-extrabold text-slate-900 text-sm block">Have a doctor's prescription?</strong>
                        <span class="text-slate-600">Upload your prescription photo and our registered pharmacist will verify and prepare your medicines.</span>
                      </div>
                    </div>
                    <button onclick="window.acsApp.openPrescriptionUploadModal('${store.name}')" class="bg-amber-400 hover:bg-amber-500 text-slate-950 px-5 py-2.5 rounded-xl font-black transition shadow flex-shrink-0">
                      Upload Prescription Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ` : `
            <!-- ======================================================== -->
            <!-- PAGE 2: STATUTORY STOCK, STAFF & REVENUE AUDIT DOSSIER  -->
            <!-- ======================================================== -->
            <div class="max-w-7xl mx-auto p-6 sm:p-12 space-y-8 animate-fade-in">
              <!-- Statutory Audit Header & Legal Disclaimer -->
              <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-900/60 relative overflow-hidden">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                  <div>
                    <div class="flex items-center gap-2 text-amber-300 font-mono text-xs uppercase tracking-widest font-black mb-1">
                      <i class="fa fa-shield text-amber-400"></i> Government of Uttar Pradesh • FSDA & UPPC Statutory Audit Dossier
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-white">
                      Statutory Regulatory Compliance Dossier & Live Ledger
                    </h2>
                    <p class="text-xs text-teal-100 mt-1.5 max-w-3xl leading-relaxed">
                      Official compliance register for <strong>${store.name}</strong> under the Drugs & Cosmetics Act 1940 (Form 20/21) and Pharmacy Act 1948 Section 42. Synchronized in real time with the ACS State Central Registry.
                    </p>
                  </div>

                  <div class="flex items-center gap-3">
                    <button 
                      onclick="window.acsApp.toggleFinancialPrivacy()" 
                      class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.financialsVisible ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}"
                    >
                      <i class="fa ${this.financialsVisible ? 'fa-eye-slash' : 'fa-eye'}"></i>
                      <span>${this.financialsVisible ? 'Hide Private Numbers' : 'Reveal Financial Numbers'}</span>
                    </button>
                    <button 
                      onclick="window.acsApp.openAddMedicineModal()" 
                      class="bg-[#135c7e] hover:bg-[#0f4b67] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <i class="fa fa-plus"></i> Add Medicine
                    </button>
                  </div>
                </div>

                <!-- Real-time Statutory KPI Cards Bar -->
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-teal-800/60 text-xs">
                  <div class="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <span class="text-slate-400 block text-[10px] uppercase font-bold">Total Active SKUs</span>
                    <span class="text-xl font-black text-white mt-0.5 block">${store.stocks.length}</span>
                  </div>
                  <div class="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <span class="text-slate-400 block text-[10px] uppercase font-bold">Stock Valuation</span>
                    <span class="text-xl font-black text-emerald-400 mt-0.5 block">₹ ${totalInventoryValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div class="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <span class="text-slate-400 block text-[10px] uppercase font-bold">Low Stock Items</span>
                    <span class="text-xl font-black ${lowStockCount > 0 ? 'text-rose-400' : 'text-slate-200'} mt-0.5 block">${lowStockCount}</span>
                  </div>
                  <div class="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <span class="text-slate-400 block text-[10px] uppercase font-bold">Expiring &le; 90 Days</span>
                    <span class="text-xl font-black ${expiringCount > 0 ? 'text-amber-400' : 'text-slate-200'} mt-0.5 block">${expiringCount}</span>
                  </div>
                  <div class="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <span class="text-slate-400 block text-[10px] uppercase font-bold">UPPC Pharmacists</span>
                    <span class="text-xl font-black text-teal-300 mt-0.5 block">${uppcStaffCount} Active</span>
                  </div>
                  <div class="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <span class="text-slate-400 block text-[10px] uppercase font-bold">Month Turnover</span>
                    <span class="text-xl font-black text-amber-300 mt-0.5 block ${this.financialsVisible ? '' : 'privacy-blur'}">₹ ${(rev.monthRevenue || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <!-- SECTION 1: MEDICINE STOCK & BATCH INVENTORY REGISTER -->
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                      <i class="fa fa-cubes text-[#135c7e]"></i> Statutory Medicine Stock & Batch Inventory Register
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Mandatory batch tracking, expiry monitoring, and rack location records under Form 20/21 rules.
                    </p>
                  </div>

                  <div class="flex flex-wrap items-center gap-2">
                    <button id="hosted-audit-btn-export-csv" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5">
                      <i class="fa fa-download"></i> Export CSV
                    </button>
                    <button id="hosted-audit-btn-import-csv" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5">
                      <i class="fa fa-upload"></i> Bulk CSV Import
                    </button>
                    <input type="file" id="hosted-audit-csv-input" accept=".csv" class="hidden" />
                    <button onclick="window.acsApp.openAddMedicineModal()" class="bg-[#135c7e] hover:bg-[#0f4b67] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                      <i class="fa fa-plus"></i> Add New Medicine
                    </button>
                  </div>
                </div>

                <!-- Search & Filter Controls -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div class="relative sm:col-span-1">
                    <i class="fa fa-search absolute left-3.5 top-3 text-slate-400 text-xs"></i>
                    <input 
                      type="text" 
                      id="hosted-audit-search-input" 
                      placeholder="Search brand, salt, batch, manufacturer..." 
                      value="${this.auditStockSearch || ''}"
                      class="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#135c7e]"
                    />
                  </div>

                  <div>
                    <select id="hosted-audit-schedule-filter" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#135c7e] bg-white">
                      <option value="ALL" ${auditSched === 'ALL' ? 'selected' : ''}>All Schedules (H, H1, X, OTC)</option>
                      <option value="Schedule H" ${auditSched === 'Schedule H' ? 'selected' : ''}>Schedule H (Prescription Only)</option>
                      <option value="Schedule H1" ${auditSched === 'Schedule H1' ? 'selected' : ''}>Schedule H1 (High Risk / Antibiotic)</option>
                      <option value="Schedule X" ${auditSched === 'Schedule X' ? 'selected' : ''}>Schedule X (Narcotics)</option>
                      <option value="OTC" ${auditSched === 'OTC' ? 'selected' : ''}>OTC / General</option>
                    </select>
                  </div>

                  <div>
                    <select id="hosted-audit-alert-filter" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#135c7e] bg-white">
                      <option value="ALL" ${auditAlert === 'ALL' ? 'selected' : ''}>All Stock Status</option>
                      <option value="LOW_STOCK" ${auditAlert === 'LOW_STOCK' ? 'selected' : ''}>Low Stock Critical (&le; 20 units)</option>
                      <option value="EXPIRING" ${auditAlert === 'EXPIRING' ? 'selected' : ''}>Expiring Within 90 Days</option>
                    </select>
                  </div>
                </div>

                <!-- Full Comprehensive Audit Stock Table -->
                <div class="overflow-x-auto rounded-xl border border-slate-200">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                        <th class="py-3 px-3">Medicine & Salt Composition</th>
                        <th class="py-3 px-3">Batch No</th>
                        <th class="py-3 px-3">Expiry Date</th>
                        <th class="py-3 px-3">Rack Bay</th>
                        <th class="py-3 px-3">Schedule</th>
                        <th class="py-3 px-3 text-center">In-Stock Quantity</th>
                        <th class="py-3 px-3">Purchase & MRP</th>
                        <th class="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      ${filteredAuditStock.length === 0 ? `
                        <tr>
                          <td colspan="8" class="py-8 text-center text-slate-400">
                            No medicine records found matching your filters.
                          </td>
                        </tr>
                      ` : filteredAuditStock.map((m) => {
                        const isLow = m.quantity <= (m.minAlertThreshold || 20);
                        const exp = new Date(m.expiryDate);
                        const diffMonths = (exp.getFullYear() - 2026) * 12 + (exp.getMonth() - 9);
                        const isExpiring = diffMonths <= 3;

                        return `
                          <tr class="hover:bg-slate-50/80 transition">
                            <td class="py-3 px-3">
                              <span class="font-bold text-slate-900 block text-xs">${m.name}</span>
                              <span class="text-[11px] text-slate-500 font-mono">${m.saltName}</span>
                              <span class="text-[10px] text-slate-400 block mt-0.5">${m.manufacturer}</span>
                            </td>
                            <td class="py-3 px-3 font-mono text-slate-700 font-semibold">
                              ${m.batchNo}
                            </td>
                            <td class="py-3 px-3">
                              <span class="font-mono font-semibold ${isExpiring ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200' : 'text-slate-700'}">
                                ${m.expiryDate}
                              </span>
                              ${isExpiring ? `<span class="block text-[10px] text-amber-700 font-bold mt-0.5">Expiring Soon</span>` : ''}
                            </td>
                            <td class="py-3 px-3">
                              <span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                                ${m.rackLocation || 'Rack A'}
                              </span>
                            </td>
                            <td class="py-3 px-3">
                              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${m.schedule.includes('H1') ? 'bg-purple-50 text-purple-700 border border-purple-200' : m.schedule.includes('H') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'}">
                                ${m.schedule}
                              </span>
                            </td>
                            <td class="py-3 px-3 text-center">
                              <div class="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                                <button onclick="window.acsApp.adjustStockQty('${m.id}', -5)" class="w-5 h-5 flex items-center justify-center rounded bg-white hover:bg-slate-200 text-slate-700 font-black shadow-xs">-</button>
                                <span class="font-extrabold ${isLow ? 'text-rose-600' : 'text-slate-800'} min-w-[2.5rem] text-center">
                                  ${m.quantity}
                                </span>
                                <button onclick="window.acsApp.adjustStockQty('${m.id}', 5)" class="w-5 h-5 flex items-center justify-center rounded bg-white hover:bg-slate-200 text-slate-700 font-black shadow-xs">+</button>
                              </div>
                              <span class="text-[10px] text-slate-400 block mt-0.5">${m.unit}</span>
                            </td>
                            <td class="py-3 px-3">
                              <div class="text-slate-900 font-bold text-xs">Selling Price: ₹ ${m.mrp.toFixed(2)}</div>
                              <div class="text-[11px] text-slate-600 font-semibold mt-0.5">Buying Cost: ₹ ${m.purchaseRate.toFixed(2)}</div>
                            </td>
                            <td class="py-3 px-3 text-right">
                              <div class="flex items-center justify-end gap-1">
                                <button onclick="window.acsApp.openEditMedicineModal('${m.id}')" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit Medicine Details">
                                  <i class="fa fa-pencil"></i>
                                </button>
                                <button onclick="window.acsApp.deleteMedicine('${m.id}')" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded" title="Delete Medicine">
                                  <i class="fa fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        `;
                      }).join("")}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- SECTION 2: UPPC REGISTERED PHARMACIST & STAFF COMPLIANCE ROSTER -->
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                      <i class="fa fa-user-md text-[#135c7e]"></i> UPPC Registered Pharmacists & Staff Compliance Roster
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Statutory pharmacist duty register mandated under the Pharmacy Act 1948 Section 42.
                    </p>
                  </div>

                  <button onclick="window.acsApp.openAddStaffModal()" class="bg-[#135c7e] hover:bg-[#0f4b67] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto">
                    <i class="fa fa-user-plus"></i> Add Staff / Pharmacist
                  </button>
                </div>

                <!-- Statutory Callout -->
                <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
                  <i class="fa fa-shield text-amber-600 text-lg mt-0.5"></i>
                  <div>
                    <strong class="font-bold">Pharmacy Act 1948 Statutory Requirement:</strong>
                    Only qualified pharmacists with active registrations registered in the <strong>Uttar Pradesh Pharmacy Council (UPPC)</strong> registry are legally entitled to dispense prescription medications.
                  </div>
                </div>

                <!-- Staff Roster Cards Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  ${store.staff.map((st) => {
                    const isUppc = st.uppcRegNo && st.uppcRegNo.startsWith("UPPC");
                    return `
                      <div class="p-4 rounded-xl border ${isUppc ? 'border-teal-200 bg-teal-50/40' : 'border-slate-200 bg-slate-50/40'} flex flex-col justify-between space-y-3">
                        <div class="flex items-start gap-3">
                          <img src="${st.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80'}" alt="${st.name}" class="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0" onerror="this.src='https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80'" />
                          <div class="flex-1 min-w-0">
                            <h4 class="font-black text-slate-900 text-sm truncate">${st.name}</h4>
                            <span class="text-xs font-bold text-[#135c7e] block">${st.role}</span>
                            <span class="text-[11px] text-slate-500 block">${st.qualification}</span>
                          </div>
                        </div>

                        <div class="space-y-1.5 text-xs border-t border-slate-200/70 pt-2.5">
                          <div class="flex items-center justify-between">
                            <span class="text-slate-500">UPPC Reg ID:</span>
                            <span class="font-mono font-bold text-[#135c7e] flex items-center gap-1">
                              ${st.uppcRegNo}
                              ${isUppc ? `<i class="fa fa-check-circle text-emerald-600"></i>` : ''}
                            </span>
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-slate-500">Shift Timing:</span>
                            <span class="font-semibold text-slate-800">${st.shift}</span>
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-slate-500">Contact:</span>
                            <span class="font-mono text-slate-700">${st.phone}</span>
                          </div>
                        </div>

                        <div class="flex items-center justify-between border-t border-slate-200/70 pt-2 text-xs">
                          <span class="text-[10px] text-slate-400">Joined: ${st.joinedDate}</span>
                          <button onclick="window.acsApp.deleteStaff('${st.id}')" class="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded text-xs transition" title="Remove staff">
                            <i class="fa fa-trash"></i> Remove
                          </button>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>

              <!-- SECTION 3: PRIVATE FINANCIAL LEDGER & REVENUE INTELLIGENCE -->
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                      <i class="fa fa-inr text-amber-500"></i> Financial Ledger & Revenue Intelligence
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Statutory sales turnovers, UPI vs cash ratios, and GST reconciliation records.
                    </p>
                  </div>

                  <div class="flex items-center gap-2">
                    <button onclick="window.acsApp.toggleFinancialPrivacy()" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold border ${this.financialsVisible ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-100 border-slate-300 text-slate-700'} transition flex items-center gap-1.5">
                      <i class="fa ${this.financialsVisible ? 'fa-eye-slash' : 'fa-eye'}"></i>
                      <span>${this.financialsVisible ? 'Hide Numbers' : 'Reveal Numbers'}</span>
                    </button>
                    <button onclick="window.acsApp.openAddSalesModal()" class="bg-[#135c7e] hover:bg-[#0f4b67] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                      <i class="fa fa-plus"></i> Record Daily Sales
                    </button>
                  </div>
                </div>

                <!-- Financial KPI Metric Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span class="text-slate-500 text-xs font-semibold block">Today's Counter Sales</span>
                    <span class="text-2xl font-black text-slate-900 mt-1 block ${this.financialsVisible ? '' : 'privacy-blur'}">
                      ₹ ${(rev.todaySales || 0).toLocaleString('en-IN')}
                    </span>
                    <span class="text-[11px] text-emerald-700 font-bold block mt-1"><i class="fa fa-arrow-up"></i> +8.4% vs yesterday</span>
                  </div>

                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span class="text-slate-500 text-xs font-semibold block">This Month's Gross Turnover</span>
                    <span class="text-2xl font-black text-slate-900 mt-1 block ${this.financialsVisible ? '' : 'privacy-blur'}">
                      ₹ ${(rev.monthRevenue || 0).toLocaleString('en-IN')}
                    </span>
                    <span class="text-[11px] text-emerald-700 font-bold block mt-1"><i class="fa fa-arrow-up"></i> Active Billing</span>
                  </div>

                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span class="text-slate-500 text-xs font-semibold block">UPI & Digital Mode Share</span>
                    <span class="text-2xl font-black text-emerald-700 mt-1 block ${this.financialsVisible ? '' : 'privacy-blur'}">
                      ${rev.paymentModes ? Math.round((rev.paymentModes.upi / (rev.paymentModes.upi + rev.paymentModes.cards + rev.paymentModes.cash)) * 100) : 58}%
                    </span>
                    <span class="text-[11px] text-slate-500 font-medium block mt-1">Cashless Transactions</span>
                  </div>

                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span class="text-slate-500 text-xs font-semibold block">Annual GST Reconciled</span>
                    <span class="text-2xl font-black text-[#135c7e] mt-1 block ${this.financialsVisible ? '' : 'privacy-blur'}">
                      ₹ ${(rev.annualGstPaid || 0).toLocaleString('en-IN')}
                    </span>
                    <span class="text-[11px] text-emerald-700 font-bold block mt-1"><i class="fa fa-check-circle"></i> GSTIN: ${store.gstin}</span>
                  </div>
                </div>

                <!-- Charts Row: Monthly Bar Chart & Payment Doughnut Chart -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div class="lg:col-span-2 p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
                      <span><i class="fa fa-bar-chart text-[#135c7e] mr-1.5"></i> Monthly Revenue Turnover History</span>
                      <span class="text-[11px] text-slate-500 font-normal">FY 2025-2026</span>
                    </h4>
                    <div class="h-64 relative">
                      <canvas id="hosted-audit-monthly-chart"></canvas>
                    </div>
                  </div>

                  <div class="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
                      <span><i class="fa fa-pie-chart text-emerald-600 mr-1.5"></i> Payment Modes</span>
                      <span class="text-[11px] text-slate-500 font-normal">Current Month</span>
                    </h4>
                    <div class="h-64 relative flex items-center justify-center">
                      <canvas id="hosted-audit-payment-chart"></canvas>
                    </div>
                  </div>
                </div>

                <!-- Monthly Reconciliation History Table -->
                <div class="overflow-x-auto rounded-xl border border-slate-200">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                        <th class="py-3 px-4">Billing Month</th>
                        <th class="py-3 px-4">Gross Turnover</th>
                        <th class="py-3 px-4">Digital Mode (UPI/POS)</th>
                        <th class="py-3 px-4">Cash Mode</th>
                        <th class="py-3 px-4">Digital Share %</th>
                        <th class="py-3 px-4">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      ${(rev.monthlyHistory || []).map((m) => {
                        const digitalRatio = Math.round((m.digital / m.revenue) * 100);
                        return `
                          <tr class="hover:bg-slate-50/80 transition">
                            <td class="py-3 px-4 font-bold text-slate-800">${m.month}</td>
                            <td class="py-3 px-4 font-mono font-bold text-slate-900 ${this.financialsVisible ? '' : 'privacy-blur'}">
                              ₹ ${m.revenue.toLocaleString('en-IN')}
                            </td>
                            <td class="py-3 px-4 font-mono text-emerald-700 ${this.financialsVisible ? '' : 'privacy-blur'}">
                              ₹ ${m.digital.toLocaleString('en-IN')}
                            </td>
                            <td class="py-3 px-4 font-mono text-slate-600 ${this.financialsVisible ? '' : 'privacy-blur'}">
                              ₹ ${m.cash.toLocaleString('en-IN')}
                            </td>
                            <td class="py-3 px-4">
                              <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-700">
                                ${digitalRatio}%
                              </span>
                            </td>
                            <td class="py-3 px-4">
                              <span class="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                                <i class="fa fa-check-circle"></i> Reconciled
                              </span>
                            </td>
                          </tr>
                        `;
                      }).join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          `}
        </main>

        <!-- Pharmacy Website Footer -->
        <footer class="bg-slate-950 text-slate-400 py-10 px-6 sm:px-12 text-xs border-t border-slate-800 mt-12">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div class="flex items-center gap-2 text-white font-black text-base">
                <span class="w-6 h-6 rounded-lg bg-[#135c7e] flex items-center justify-center text-xs text-white">+</span>
                <span>${store.name}</span>
              </div>
              <p class="text-slate-400 mt-1.5 max-w-lg leading-relaxed">
                Licensed Retail Chemist dispensing genuine medicines under UPPC registered supervision. Regulated under the Drugs and Cosmetics Act 1940 & Pharmacy Act 1948.
              </p>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-300">
              <div><span class="text-slate-500 block text-[10px] uppercase font-bold">GSTIN:</span> <span class="font-mono">${store.gstin}</span></div>
              <div><span class="text-slate-500 block text-[10px] uppercase font-bold">FSDA Form 20:</span> <span class="font-mono">${store.license20}</span></div>
              <div><span class="text-slate-500 block text-[10px] uppercase font-bold">FSDA Form 21:</span> <span class="font-mono">${store.license21}</span></div>
            </div>
          </div>

          <div class="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <div>
              © 2026 ${store.name}. Hosted on the Uttar Pradesh Pharmacy Syndicate Network (ACS).
            </div>
            <div class="flex items-center gap-3">
              <a href="/" onclick="event.preventDefault(); window.acsApp.switchTab('landing');" class="text-amber-400 hover:text-amber-300 underline font-semibold">
                ACS Central Registry Portal
              </a>
            </div>
          </div>
        </footer>

        <!-- Discreet Floating Button for Logged-In Store Owner or Admin -->
        ${this.currentUser ? `
          <div class="fixed bottom-16 md:bottom-5 right-5 z-40">
            <button onclick="window.acsApp.switchTab('store-detail')" class="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md border border-white/20 text-xs font-bold transition flex items-center gap-2">
              <i class="fa fa-dashboard text-amber-400"></i> Store Management Portal
            </button>
          </div>
        ` : ''}

        <!-- Mobile Ergonomic Sticky Bottom Quick Action Bar (Screens <= 768px) -->
        <div class="mobile-bottom-bar md:hidden">
          <a href="tel:${cleanPhone}" class="flex-1 py-2 px-1 bg-slate-800 text-white rounded-xl text-center text-xs font-bold flex flex-col items-center justify-center gap-0.5">
            <i class="fa fa-phone text-amber-400 text-sm"></i>
            <span class="text-[10px]">Call Store</span>
          </a>
          <a href="${waUrl}" target="_blank" class="flex-1 py-2 px-1 bg-emerald-600 text-white rounded-xl text-center text-xs font-bold flex flex-col items-center justify-center gap-0.5 shadow">
            <i class="fa fa-whatsapp text-white text-sm"></i>
            <span class="text-[10px]">WhatsApp</span>
          </a>
          <button onclick="window.acsApp.openPrescriptionUploadModal('${store.name}')" class="flex-1 py-2 px-1 bg-amber-400 text-slate-950 rounded-xl text-center text-xs font-black flex flex-col items-center justify-center gap-0.5 shadow">
            <i class="fa fa-upload text-slate-950 text-sm"></i>
            <span class="text-[10px]">Upload Rx</span>
          </button>
          <button onclick="window.acsApp.setHostedSubTab('${isAudit ? 'storefront' : 'audit-dossier'}')" class="flex-1 py-2 px-1 bg-teal-800 text-white rounded-xl text-center text-xs font-bold flex flex-col items-center justify-center gap-0.5">
            <i class="fa ${isAudit ? 'fa-medkit' : 'fa-file-text-o'} text-teal-200 text-sm"></i>
            <span class="text-[10px]">${isAudit ? 'Storefront' : 'Audit'}</span>
          </button>
        </div>
      </div>
    `;
  }

    bindHostedWebsiteEvents() {
    const store = this.getCurrentStore();
    if (!store) return;

    if (this.hostedSubTab === "storefront") {
      // Page 1 Search Input
      const searchInput = document.getElementById("hosted-stock-search-input");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          this.hostedStockSearch = e.target.value;
          this.renderCurrentView();
        });
      }
    } else {
      // Page 2 Audit Dossier Events
      const auditSearch = document.getElementById("hosted-audit-search-input");
      if (auditSearch) {
        auditSearch.addEventListener("input", (e) => {
          this.auditStockSearch = e.target.value;
          this.renderCurrentView();
        });
      }

      const auditSched = document.getElementById("hosted-audit-schedule-filter");
      if (auditSched) {
        auditSched.addEventListener("change", (e) => {
          this.auditScheduleFilter = e.target.value;
          this.renderCurrentView();
        });
      }

      const auditAlert = document.getElementById("hosted-audit-alert-filter");
      if (auditAlert) {
        auditAlert.addEventListener("change", (e) => {
          this.auditAlertFilter = e.target.value;
          this.renderCurrentView();
        });
      }

      const btnExportCsv = document.getElementById("hosted-audit-btn-export-csv");
      if (btnExportCsv) {
        btnExportCsv.addEventListener("click", () => {
          this.exportStockCSV();
        });
      }

      const btnImportCsv = document.getElementById("hosted-audit-btn-import-csv");
      const fileInput = document.getElementById("hosted-audit-csv-input");
      if (btnImportCsv && fileInput) {
        btnImportCsv.addEventListener("click", () => {
          fileInput.click();
        });
        fileInput.addEventListener("change", (e) => {
          this.handleCsvUpload(e);
        });
      }

      // Render Charts for Page 2
      this.renderHostedAuditCharts(store);
    }
  }

  renderHostedAuditCharts(store) {
    if (typeof Chart === "undefined" || !store || !store.revenueData) return;

    if (this.charts["hostedAuditMonthly"]) {
      this.charts["hostedAuditMonthly"].destroy();
    }
    if (this.charts["hostedAuditPayment"]) {
      this.charts["hostedAuditPayment"].destroy();
    }

    const rev = store.revenueData;
    const ctxMonthly = document.getElementById("hosted-audit-monthly-chart");
    if (ctxMonthly) {
      this.charts["hostedAuditMonthly"] = new Chart(ctxMonthly, {
        type: "bar",
        data: {
          labels: rev.monthlyHistory.map((h) => h.month),
          datasets: [
            {
              label: "Gross Sales (₹)",
              data: rev.monthlyHistory.map((h) => h.revenue),
              backgroundColor: "rgba(19, 92, 126, 0.85)",
              borderColor: "#135c7e",
              borderWidth: 1,
              borderRadius: 6,
            },
            {
              label: "Digital UPI/POS (₹)",
              data: rev.monthlyHistory.map((h) => h.digital),
              backgroundColor: "rgba(16, 185, 129, 0.8)",
              borderColor: "#10b981",
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (val) => "₹" + (val / 1000) + "k",
                font: { size: 10 },
              },
            },
            x: {
              ticks: { font: { size: 10 } },
            },
          },
        },
      });
    }

    const ctxPayment = document.getElementById("hosted-audit-payment-chart");
    if (ctxPayment) {
      this.charts["hostedAuditPayment"] = new Chart(ctxPayment, {
        type: "doughnut",
        data: {
          labels: ["UPI / QR", "Cards / POS", "Cash Counter"],
          datasets: [
            {
              data: [rev.paymentModes.upi, rev.paymentModes.cards, rev.paymentModes.cash],
              backgroundColor: ["#10b981", "#3b82f6", "#f59e0b"],
              borderWidth: 2,
              borderColor: "#ffffff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
          },
          cutout: "68%",
        },
      });
    }
  }

  openPrescriptionUploadModal(storeName) {
    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal || !title || !body) return;

    title.innerHTML = `<i class="fa fa-file-text-o text-teal-700"></i> Upload Prescription to ${storeName}`;
    body.innerHTML = `
      <form id="form-upload-rx" class="space-y-4 text-xs">
        <div class="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-900">
          <p class="font-bold">Doctor's Prescription Verification</p>
          <p class="mt-0.5 text-slate-600">Please upload a clear photograph or PDF of your registered medical practitioner's prescription. Our registered pharmacist will review it before dispensing.</p>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
          <input type="text" required placeholder="e.g. Alok Verma" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#135c7e]" />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Contact Phone / WhatsApp *</label>
          <input type="tel" required placeholder="+91 98765 43210" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#135c7e]" />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Prescription Image / Document *</label>
          <input type="file" id="rx-file-input" accept="image/*,application/pdf" required class="w-full px-3 py-2 border rounded-lg" />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Special Notes / Medicine Request</label>
          <textarea rows="2" placeholder="e.g. Need 1-month dose of diabetes medicines" class="w-full px-3 py-2 border rounded-lg"></textarea>
        </div>

        <div class="pt-2 flex justify-end gap-2 border-t border-slate-100">
          <button type="button" onclick="window.acsApp.closeModal()" class="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow">Submit Prescription to Pharmacist</button>
        </div>
      </form>
    `;

    modal.classList.remove("hidden");

    document.getElementById("form-upload-rx").onsubmit = (e) => {
      e.preventDefault();
      this.closeModal();
      this.showToast("Prescription submitted successfully! The registered pharmacist will contact you shortly.", "success");
    };
  }

  // ==========================================
  // VIEW 1: DIRECTORY (ALL REGISTERED STORES)
  // ==========================================
  getDirectoryViewHtml() {
    let filtered = this.stores.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(this.directorySearch.toLowerCase()) ||
        s.district.toLowerCase().includes(this.directorySearch.toLowerCase()) ||
        s.ownerName.toLowerCase().includes(this.directorySearch.toLowerCase()) ||
        s.license20.toLowerCase().includes(this.directorySearch.toLowerCase());
      const matchDistrict = this.directoryDistrict === "ALL" || s.district === this.directoryDistrict;
      return matchSearch && matchDistrict;
    });

    const districtOptions = ["ALL", ...new Set(this.stores.map((s) => s.district))];

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Top Section Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-800 font-bold text-sm">
                <i class="fa fa-hospital-o"></i>
              </span>
              <h2 class="text-xl font-bold text-slate-800">Uttar Pradesh Pharmacy Store Directory</h2>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              State-wide administrative registry of licensed retail & wholesale drugstores hosted on ACS.
            </p>
          </div>
          <button id="btn-open-add-store" class="inline-flex items-center gap-2 bg-[#135c7e] hover:bg-[#0f4b67] text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition">
            <i class="fa fa-plus-circle"></i> Onboard New Pharmacy
          </button>
        </div>

        <!-- Filter & Search Controls -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div class="relative md:col-span-2">
            <i class="fa fa-search absolute left-3.5 top-3.5 text-slate-400"></i>
            <input 
              type="text" 
              id="directory-search-input" 
              placeholder="Search by store name, owner, license no, or locality..." 
              value="${this.directorySearch}"
              class="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135c7e]"
            />
          </div>
          <div>
            <select id="directory-district-select" class="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135c7e]">
              <option value="ALL">All UP Districts (${this.stores.length} total)</option>
              ${districtOptions.filter((d) => d !== "ALL").map((d) => `<option value="${d}" ${d === this.directoryDistrict ? "selected" : ""}>District: ${d}</option>`).join("")}
            </select>
          </div>
        </div>

        <!-- Stores Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${filtered.length === 0 ? `
            <div class="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
              <i class="fa fa-building-o text-4xl text-slate-300 mb-3"></i>
              <h4 class="text-base font-semibold text-slate-700">No Pharmacy Stores Found</h4>
              <p class="text-sm text-slate-500 mt-1">Try adjusting your search terms or district filters.</p>
            </div>
          ` : filtered.map((store) => `
            <div class="portal-card portal-card-interactive flex flex-col overflow-hidden bg-white">
              <div class="relative h-48 bg-slate-100 overflow-hidden group">
                <img src="${store.photoUrl}" alt="${store.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80'" />
                <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-sm">
                    <i class="fa fa-check-circle"></i> ${store.status}
                  </span>
                  ${store.is24x7 ? `
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
                      <i class="fa fa-clock-o"></i> 24x7 Emergency
                    </span>
                  ` : ''}
                </div>
                <div class="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs">
                  <i class="fa fa-map-marker text-amber-400"></i> ${store.district}
                </div>
              </div>

              <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-lg text-slate-900 line-clamp-1">${store.name}</h3>
                  <p class="text-xs text-slate-500 mt-1 flex items-start gap-1">
                    <i class="fa fa-location-arrow text-[#135c7e] mt-0.5"></i>
                    <span class="line-clamp-2">${store.address}</span>
                  </p>

                  <div class="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span class="text-slate-400 block">Form 20 License:</span>
                      <span class="font-semibold text-slate-700">${store.license20}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block">Pharmacists:</span>
                      <span class="font-semibold text-blue-700">${store.staff.filter(st => st.uppcRegNo.startsWith('UPPC')).length} Reg. UPPC</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block">Stock SKUs:</span>
                      <span class="font-semibold text-emerald-700">${store.stocks.length} Medicines</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block">Owner:</span>
                      <span class="font-medium text-slate-800 truncate block">${store.ownerName}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button onclick="window.acsApp.viewHostedWebsite('${store.id}')" class="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1">
                    <i class="fa fa-globe"></i>
                    <span>Live Website</span>
                  </button>
                  <button onclick="window.acsApp.selectAndOpenStore('${store.id}')" class="flex-1 bg-[#135c7e] hover:bg-[#0f4b67] text-white py-2 px-2.5 rounded-lg text-xs font-semibold text-center transition flex items-center justify-center gap-1">
                    <span>Manage Hub</span>
                    <i class="fa fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  bindDirectoryEvents() {
    const searchInput = document.getElementById("directory-search-input");
    const districtSelect = document.getElementById("directory-district-select");
    const btnOpenAddStore = document.getElementById("btn-open-add-store");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.directorySearch = e.target.value;
        this.renderCurrentView();
      });
    }

    if (districtSelect) {
      districtSelect.addEventListener("change", (e) => {
        this.directoryDistrict = e.target.value;
        this.renderCurrentView();
      });
    }

    if (btnOpenAddStore) {
      btnOpenAddStore.addEventListener("click", () => {
        this.openAddStoreModal();
      });
    }
  }

  selectAndOpenStore(storeId) {
    this.currentStoreId = storeId;
    this.renderHeaderBar();
    this.switchTab("store-detail");
    this.showToast(`Active Store: ${this.getCurrentStore().name}`, "success");
  }

  // ==========================================
  // VIEW 2: STORE DETAIL (HERO & COMPLIANCE)
  // ==========================================
  getStoreDetailViewHtml(store) {
    if (!store) {
      return `<div class="p-8 text-center bg-white rounded-xl">No store selected.</div>`;
    }

    const regPharmacistsCount = store.staff.filter((s) => s.uppcRegNo && s.uppcRegNo.startsWith("UPPC")).length;
    const lowStockCount = store.stocks.filter((m) => m.quantity <= (m.minAlertThreshold || 20)).length;

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Store Master Banner & Hero Profile -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="relative h-64 bg-slate-800">
            <img src="${store.photoUrl}" alt="${store.name}" class="w-full h-full object-cover opacity-85" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent"></div>
            
            <div class="absolute top-4 right-4 flex items-center gap-2">
              <button onclick="window.acsApp.openStoreCertificateModal('${store.id}')" class="bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow backdrop-blur transition flex items-center gap-1.5">
                <i class="fa fa-certificate text-amber-600"></i> QR Certificate
              </button>
              <button onclick="window.acsApp.openPosDispensingModal('${store.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow backdrop-blur transition flex items-center gap-1.5">
                <i class="fa fa-calculator"></i> Dispense Rx POS
              </button>
              <button onclick="window.acsApp.viewHostedWebsite('${store.id}')" class="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow backdrop-blur transition flex items-center gap-1.5">
                <i class="fa fa-globe"></i> View Live Hosted Website
              </button>
              <button onclick="window.acsApp.openEditStoreModal('${store.id}')" class="bg-white/90 hover:bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold shadow backdrop-blur transition flex items-center gap-1.5">
                <i class="fa fa-pencil"></i> Edit Store Info
              </button>
              <button onclick="window.print()" class="bg-teal-700/90 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow backdrop-blur transition flex items-center gap-1.5">
                <i class="fa fa-print"></i> Print Dossier
              </button>
            </div>

            <div class="absolute bottom-5 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <i class="fa fa-shield"></i> UP FSDA Verified
                  </span>
                  ${store.is24x7 ? `<span class="bg-amber-500 text-slate-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full">24x7 Service</span>` : ''}
                </div>
                <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">${store.name}</h1>
                <p class="text-slate-200 text-xs md:text-sm mt-1 flex items-center gap-2">
                  <i class="fa fa-map-marker text-amber-400"></i> ${store.address}
                </p>
              </div>

              <div class="bg-black/40 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 flex items-center gap-4 text-xs">
                <div>
                  <span class="text-slate-300 block">Helpline:</span>
                  <a href="tel:${store.phone}" class="font-bold text-white hover:underline">${store.phone}</a>
                </div>
                <div class="h-6 w-px bg-white/20"></div>
                <div>
                  <span class="text-slate-300 block">Store ID:</span>
                  <span class="font-mono font-bold text-amber-400">${store.id.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Metrics Bar -->
          <div class="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/50 p-4 border-t border-slate-100">
            <div class="p-3 text-center">
              <span class="text-xs text-slate-500 block font-medium">Pharmacists on Duty</span>
              <span class="text-xl font-bold text-[#135c7e]">${regPharmacistsCount} Registered</span>
            </div>
            <div class="p-3 text-center">
              <span class="text-xs text-slate-500 block font-medium">Medicine Inventory</span>
              <span class="text-xl font-bold text-emerald-600">${store.stocks.length} SKUs Listed</span>
            </div>
            <div class="p-3 text-center">
              <span class="text-xs text-slate-500 block font-medium">Inventory Alerts</span>
              <span class="text-xl font-bold ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-700'}">
                ${lowStockCount} Low / Alert
              </span>
            </div>
            <div class="p-3 text-center">
              <span class="text-xs text-slate-500 block font-medium">Current Month Sales</span>
              <span class="text-xl font-bold text-blue-800 ${this.financialsVisible ? '' : 'privacy-blur'}" onclick="window.acsApp.toggleFinancialPrivacy()">
                ₹ ${store.revenueData.monthlyGross.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        <!-- Prescription Dispensing POS Simulator & Digital Bill Generator Banner -->
        <div class="bg-gradient-to-r from-teal-900 via-[#135c7e] to-slate-900 text-white p-5 rounded-2xl shadow-md border border-teal-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              <i class="fa fa-shield"></i> Pharmacy Act 1948 • Section 42 Dispensing Counter
            </div>
            <h3 class="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <i class="fa fa-calculator text-amber-400"></i> Prescription Dispensing POS & Digital Cash Memo Generator
            </h3>
            <p class="text-xs text-teal-100 max-w-2xl leading-relaxed">
              Dispense doctor-prescribed medications, automatically deduct inventory in the live database, compute 12% GST, and instantly print an official statutory Cash Memo / Retail Tax Invoice.
            </p>
          </div>
          <div class="flex items-center gap-2.5 flex-shrink-0">
            <button onclick="window.acsApp.openPosDispensingModal('${store.id}')" class="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs shadow transition flex items-center gap-2">
              <i class="fa fa-plus-circle"></i> Launch Prescription Dispense (POS)
            </button>
          </div>
        </div>

        <!-- Compliance & Regulatory Dossier Card -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2">
                <i class="fa fa-id-card-o text-xl text-[#135c7e]"></i>
                <h3 class="font-bold text-slate-800 text-base">Mandatory Drug Licenses & Certificates</h3>
              </div>
              <span class="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-1 rounded border border-emerald-200">
                <i class="fa fa-check"></i> Valid Till 2029
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-500 uppercase">Retail Drug License (Form 20)</span>
                  <span class="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">Allopathy</span>
                </div>
                <div class="text-base font-mono font-bold text-slate-800 mt-1">${store.license20}</div>
                <div class="text-xs text-slate-500 mt-2 flex items-center justify-between">
                  <span>Authorized by:</span>
                  <span class="font-medium text-slate-700">Drug Licensing Authority, UP</span>
                </div>
              </div>

              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-500 uppercase">Schedule C/C1 License (Form 21)</span>
                  <span class="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">Biological</span>
                </div>
                <div class="text-base font-mono font-bold text-slate-800 mt-1">${store.license21}</div>
                <div class="text-xs text-slate-500 mt-2 flex items-center justify-between">
                  <span>Biologicals / Injectables:</span>
                  <span class="font-medium text-emerald-700">Authorized & Inspected</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
              <div class="p-3 bg-white border border-slate-200 rounded-lg">
                <span class="text-slate-400 block">GSTIN Number:</span>
                <span class="font-mono font-bold text-slate-800 text-sm">${store.gstin}</span>
              </div>
              <div class="p-3 bg-white border border-slate-200 rounded-lg">
                <span class="text-slate-400 block">Owner / Authorized Person:</span>
                <span class="font-bold text-slate-800 text-sm">${store.ownerName}</span>
              </div>
              <div class="p-3 bg-white border border-slate-200 rounded-lg">
                <span class="text-slate-400 block">Operating Hours:</span>
                <span class="font-bold text-slate-800 text-sm">${store.operatingHours}</span>
              </div>
            </div>

            <!-- Quick Action Shortcuts -->
            <div class="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
              <button onclick="window.acsApp.openPosDispensingModal('${store.id}')" class="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-4 py-2 rounded-lg text-xs font-bold transition">
                <i class="fa fa-calculator text-emerald-600"></i> Dispense Rx POS
              </button>
              <button onclick="window.acsApp.openStoreCertificateModal('${store.id}')" class="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-4 py-2 rounded-lg text-xs font-bold transition">
                <i class="fa fa-certificate text-amber-600"></i> Official QR Certificate
              </button>
              <button onclick="window.acsApp.viewHostedWebsite('${store.id}')" class="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition">
                <i class="fa fa-globe"></i> View Live Hosted Webpage
              </button>
              <button onclick="window.acsApp.switchTab('stocks')" class="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-lg text-xs font-semibold transition">
                <i class="fa fa-medkit text-teal-700"></i> Manage Medicine Stocks (${store.stocks.length})
              </button>
              <button onclick="window.acsApp.switchTab('staff')" class="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-lg text-xs font-semibold transition">
                <i class="fa fa-user-md text-blue-700"></i> Staff Roster (${store.staff.length})
              </button>
              <button onclick="window.acsApp.switchTab('revenue')" class="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-lg text-xs font-semibold transition">
                <i class="fa fa-line-chart text-amber-600"></i> Revenue Analytics
              </button>
            </div>
          </div>

          <!-- Store Photos & Location Card -->
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
                <i class="fa fa-picture-o text-amber-600"></i> Storefront Photos
              </h3>
              <button onclick="window.acsApp.openPhotoUpdateModal('${store.id}')" class="text-xs text-[#135c7e] hover:underline font-semibold">
                Update Photo
              </button>
            </div>

            <div class="rounded-lg overflow-hidden border border-slate-200 h-44 bg-slate-100 relative group">
              <img src="${store.photoUrl}" alt="${store.name}" class="w-full h-full object-cover" />
              <div class="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                Verified Front Facade
              </div>
            </div>

            <div class="space-y-2 text-xs text-slate-600 pt-2">
              <div class="flex items-center justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">Established Year:</span>
                <span class="font-semibold text-slate-800">${store.establishedYear}</span>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">Official Email:</span>
                <a href="mailto:${store.email}" class="font-medium text-[#135c7e] hover:underline">${store.email}</a>
              </div>
              <div class="flex items-center justify-between py-1">
                <span class="text-slate-500">UP District:</span>
                <span class="font-semibold text-slate-800">${store.district}</span>
              </div>
            </div>

            <div class="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-start gap-2">
              <i class="fa fa-info-circle text-teal-700 mt-0.5"></i>
              <span>All premises photos and pharmacist registers are subject to periodic audit by UP Drug Inspectorate.</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindStoreDetailEvents() {
    // events bound via inline onclick handles
  }

  setStockHorizonFilter(horizon) {
    this.stockHorizonFilter = horizon;
    this.renderCurrentView();
  }

  // ==========================================
  // VIEW 3: MEDICINE STOCKS & INVENTORY
  // ==========================================
  getStocksViewHtml(store) {
    if (!store) return ``;

    let filteredStocks = store.stocks.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(this.stockSearchQuery.toLowerCase()) ||
        m.saltName.toLowerCase().includes(this.stockSearchQuery.toLowerCase()) ||
        m.batchNo.toLowerCase().includes(this.stockSearchQuery.toLowerCase()) ||
        m.manufacturer.toLowerCase().includes(this.stockSearchQuery.toLowerCase());

      const matchSchedule = this.stockScheduleFilter === "ALL" || m.schedule.includes(this.stockScheduleFilter);

      let matchAlert = true;
      if (this.stockAlertFilter === "LOW_STOCK" || this.stockHorizonFilter === "LOW_STOCK") {
        matchAlert = m.quantity <= (m.minAlertThreshold || 20);
      } else if (this.stockAlertFilter === "EXPIRING" || this.stockHorizonFilter === "EXPIRING") {
        const exp = new Date(m.expiryDate);
        const diffMonths = (exp.getFullYear() - 2026) * 12 + (exp.getMonth() - 9);
        matchAlert = diffMonths <= 3;
      } else if (this.stockHorizonFilter === "HEALTHY") {
        const exp = new Date(m.expiryDate);
        const diffMonths = (exp.getFullYear() - 2026) * 12 + (exp.getMonth() - 9);
        matchAlert = diffMonths > 3 && m.quantity > (m.minAlertThreshold || 20);
      }

      return matchSearch && matchSchedule && matchAlert;
    });

    const totalCostValue = store.stocks.reduce((acc, curr) => acc + (curr.quantity * curr.purchaseRate), 0);
    const totalRetailValue = store.stocks.reduce((acc, curr) => acc + (curr.quantity * curr.mrp), 0);
    const lowStockCount = store.stocks.filter((m) => m.quantity <= (m.minAlertThreshold || 20)).length;
    const expiringCount = store.stocks.filter((m) => {
      const exp = new Date(m.expiryDate);
      const diffMonths = (exp.getFullYear() - 2026) * 12 + (exp.getMonth() - 9);
      return diffMonths <= 3;
    }).length;

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Stock Top Management Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-teal-50 text-[#135c7e] font-black text-base shadow-xs">
                <i class="fa fa-cubes"></i>
              </span>
              <div>
                <h2 class="text-xl font-black text-slate-800">Medicine Stock & Inventory Register</h2>
                <p class="text-xs text-slate-500 mt-0.5">
                  Live inventory register for <strong>${store.name}</strong> • Real-time buying cost & selling price (MRP) management.
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button onclick="window.acsApp.openReorderPoModal()" class="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition">
              <i class="fa fa-file-text-o"></i> Generate Supplier PO Draft
            </button>
            <button onclick="window.acsApp.openBulkPriceModal()" class="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black shadow-sm transition">
              <i class="fa fa-calculator"></i> Bulk Price Adjuster
            </button>
            <button id="btn-export-csv" class="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition">
              <i class="fa fa-download"></i> Export CSV
            </button>
            <button id="btn-import-csv" class="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition">
              <i class="fa fa-upload"></i> Bulk CSV Import
            </button>
            <input type="file" id="csv-file-input" accept=".csv" class="hidden" />
            <button id="btn-add-medicine" class="inline-flex items-center gap-1.5 bg-[#135c7e] hover:bg-[#0f4b67] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition">
              <i class="fa fa-plus"></i> Add New Medicine
            </button>
          </div>
        </div>

        <!-- Inventory Financial KPI Cards Deck -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-slate-500 text-[11px] font-semibold block">Active Catalog SKUs</span>
            <span class="text-2xl font-black text-slate-900 mt-1 block">${store.stocks.length}</span>
            <span class="text-[10px] text-teal-700 font-bold mt-1 block">Live in Database</span>
          </div>

          <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-slate-500 text-[11px] font-semibold block">Total Cost Valuation</span>
            <span class="text-xl font-black text-slate-800 mt-1 block">₹ ${totalCostValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <span class="text-[10px] text-slate-400 mt-1 block">Stock Purchase Investment</span>
          </div>

          <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-slate-500 text-[11px] font-semibold block">Retail / MRP Valuation</span>
            <span class="text-xl font-black text-[#135c7e] mt-1 block">₹ ${totalRetailValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <span class="text-[10px] text-emerald-700 font-bold mt-1 block">Gross Selling Potential</span>
          </div>

          <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-slate-500 text-[11px] font-semibold block">Total Stock Units</span>
            <span class="text-xl font-black text-indigo-700 mt-1 block">${store.stocks.reduce((acc, curr) => acc + curr.quantity, 0).toLocaleString('en-IN')}</span>
            <span class="text-[10px] text-indigo-600 font-bold mt-1 block">Physical Package Units</span>
          </div>

          <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-slate-500 text-[11px] font-semibold block">Low Stock Items</span>
            <span class="text-2xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-700'} mt-1 block">${lowStockCount}</span>
            <span class="text-[10px] ${lowStockCount > 0 ? 'text-rose-500 font-bold' : 'text-slate-400'} mt-1 block">&le; 20 Units Threshold</span>
          </div>

          <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-slate-500 text-[11px] font-semibold block">Expiring &le; 90 Days</span>
            <span class="text-2xl font-black ${expiringCount > 0 ? 'text-amber-600' : 'text-slate-700'} mt-1 block">${expiringCount}</span>
            <span class="text-[10px] text-amber-600 font-bold mt-1 block">Priority FIFO Dispatch</span>
          </div>
        </div>

        <!-- Batch Expiry Horizon Filter Tabs -->
        <div class="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold border border-slate-200">
          <span class="text-slate-500 text-[11px] px-2 font-semibold">Expiry & Risk Horizon:</span>
          <button onclick="window.acsApp.setStockHorizonFilter('ALL')" class="px-3 py-1.5 rounded-xl transition ${this.stockHorizonFilter === 'ALL' ? 'bg-[#135c7e] text-white shadow font-black' : 'text-slate-600 hover:text-slate-900'}">
            All Inventory (${store.stocks.length})
          </button>
          <button onclick="window.acsApp.setStockHorizonFilter('HEALTHY')" class="px-3 py-1.5 rounded-xl transition ${this.stockHorizonFilter === 'HEALTHY' ? 'bg-emerald-600 text-white shadow font-black' : 'text-slate-600 hover:text-slate-900'}">
            <i class="fa fa-check-circle"></i> Healthy Batches
          </button>
          <button onclick="window.acsApp.setStockHorizonFilter('EXPIRING')" class="px-3 py-1.5 rounded-xl transition ${this.stockHorizonFilter === 'EXPIRING' ? 'bg-amber-500 text-slate-950 shadow font-black' : 'text-slate-600 hover:text-slate-900'}">
            <i class="fa fa-clock-o"></i> Near Expiry &le; 90 Days (${expiringCount})
          </button>
          <button onclick="window.acsApp.setStockHorizonFilter('LOW_STOCK')" class="px-3 py-1.5 rounded-xl transition ${this.stockHorizonFilter === 'LOW_STOCK' ? 'bg-rose-600 text-white shadow font-black' : 'text-slate-600 hover:text-slate-900'}">
            <i class="fa fa-exclamation-triangle"></i> Critical Low Stock (${lowStockCount})
          </button>
        </div>

        <!-- Filter & Search Controls Bar -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div class="relative md:col-span-2">
            <i class="fa fa-search absolute left-3.5 top-3 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              id="stock-search-input" 
              placeholder="Search by brand name, salt/chemical composition, batch, or manufacturer..." 
              value="${this.stockSearchQuery}"
              class="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#135c7e]"
            />
          </div>
          <div>
            <select id="stock-schedule-select" class="w-full py-2.5 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#135c7e] bg-white">
              <option value="ALL" ${this.stockScheduleFilter === "ALL" ? "selected" : ""}>All Schedules (H, H1, X, OTC)</option>
              <option value="Schedule H" ${this.stockScheduleFilter === "Schedule H" ? "selected" : ""}>Schedule H (Prescription)</option>
              <option value="Schedule H1" ${this.stockScheduleFilter === "Schedule H1" ? "selected" : ""}>Schedule H1 (High Alert / Antibiotic)</option>
              <option value="Schedule X" ${this.stockScheduleFilter === "Schedule X" ? "selected" : ""}>Schedule X (Narcotics)</option>
              <option value="OTC" ${this.stockScheduleFilter === "OTC" ? "selected" : ""}>OTC / General</option>
            </select>
          </div>
          <div>
            <select id="stock-alert-select" class="w-full py-2.5 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#135c7e] bg-white">
              <option value="ALL" ${this.stockAlertFilter === "ALL" ? "selected" : ""}>All Stock Alert Levels</option>
              <option value="LOW_STOCK" ${this.stockAlertFilter === "LOW_STOCK" ? "selected" : ""}>Low Stock Critical (${lowStockCount})</option>
              <option value="EXPIRING" ${this.stockAlertFilter === "EXPIRING" ? "selected" : ""}>Expiring Within 90 Days (${expiringCount})</option>
            </select>
          </div>
        </div>

        <!-- Comprehensive Detailed Medicine Table with Inline Editing -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
            <span class="font-bold flex items-center gap-1.5">
              <i class="fa fa-info-circle text-[#135c7e]"></i> Tip: Edit Cost Price (Buy), Selling Price (MRP), or Stock Quantity directly in the fields below. Changes save instantly!
            </span>
            <span class="text-[11px] text-slate-500 font-mono">Showing ${filteredStocks.length} of ${store.stocks.length} SKUs</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th class="py-3.5 px-4 min-w-[200px]">Medicine & Generic Salt</th>
                  <th class="py-3.5 px-3 min-w-[120px]">Batch & Rack</th>
                  <th class="py-3.5 px-3 min-w-[100px]">Expiry</th>
                  <th class="py-3.5 px-3">Schedule</th>
                  <th class="py-3.5 px-3 min-w-[130px] text-center">In-Stock Qty</th>
                  <th class="py-3.5 px-3 min-w-[120px]">Buying Cost (CP)</th>
                  <th class="py-3.5 px-3 min-w-[120px]">Selling Cost (MRP)</th>
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${filteredStocks.length === 0 ? `
                  <tr>
                    <td colspan="8" class="py-14 text-center text-slate-400">
                      <i class="fa fa-cubes text-4xl mb-2 text-slate-300 block"></i>
                      No medicine records found matching your filters.
                    </td>
                  </tr>
                ` : filteredStocks.map((m) => {
                  const isLow = m.quantity <= (m.minAlertThreshold || 20);
                  const expDate = new Date(m.expiryDate);
                  const diffMonths = (expDate.getFullYear() - 2026) * 12 + (expDate.getMonth() - 9);
                  const isExpiringSoon = diffMonths <= 3;

                  let scheduleBadge = `<span class="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">${m.schedule}</span>`;
                  if (m.schedule.includes("H1")) {
                    scheduleBadge = `<span class="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold"><i class="fa fa-exclamation-circle"></i> ${m.schedule}</span>`;
                  } else if (m.schedule.includes("H")) {
                    scheduleBadge = `<span class="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">${m.schedule}</span>`;
                  }

                  return `
                    <tr class="hover:bg-slate-50/80 transition">
                      <td class="py-3.5 px-4">
                        <div class="font-extrabold text-slate-900 text-sm">${m.name}</div>
                        <div class="text-[11px] text-slate-500 font-mono mt-0.5">${m.saltName}</div>
                        <div class="text-[10px] text-slate-400 mt-0.5">${m.manufacturer}</div>
                      </td>
                      <td class="py-3.5 px-3">
                        <div class="font-mono font-semibold text-slate-700 text-xs">${m.batchNo}</div>
                        <div class="mt-1 flex items-center gap-1">
                          <span class="text-[10px] text-slate-400">Rack:</span>
                          <input 
                            type="text" 
                            value="${m.rackLocation || 'Shelf'}" 
                            onchange="window.acsApp.updateStockInline('${m.id}', 'rackLocation', this.value)"
                            class="w-16 px-1.5 py-0.5 bg-slate-100 hover:bg-white focus:bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-700 font-bold focus:ring-1 focus:ring-[#135c7e] transition"
                            title="Edit rack location directly"
                          />
                        </div>
                      </td>
                      <td class="py-3.5 px-3">
                        <span class="font-mono text-xs ${isExpiringSoon ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold' : 'text-slate-700 font-medium'}">
                          ${m.expiryDate}
                        </span>
                        ${isExpiringSoon ? `<span class="block text-[10px] text-amber-700 font-bold mt-0.5">Near Expiry</span>` : ''}
                      </td>
                      <td class="py-3.5 px-3">${scheduleBadge}</td>
                      <td class="py-3.5 px-3 text-center">
                        <div class="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                          <button onclick="window.acsApp.adjustStockQty('${m.id}', -5)" class="w-6 h-6 flex items-center justify-center rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-black shadow-xs transition">-</button>
                          <input 
                            type="number" 
                            min="0" 
                            value="${m.quantity}" 
                            onchange="window.acsApp.updateStockInline('${m.id}', 'quantity', this.value)"
                            class="w-12 text-center bg-transparent font-black ${isLow ? 'text-rose-600' : 'text-slate-800'} text-sm outline-none"
                            title="Direct edit quantity"
                          />
                          <button onclick="window.acsApp.adjustStockQty('${m.id}', 5)" class="w-6 h-6 flex items-center justify-center rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-black shadow-xs transition">+</button>
                        </div>
                        <span class="text-[10px] text-slate-400 block mt-0.5">${m.unit}</span>
                      </td>
                      <td class="py-3.5 px-3">
                        <div class="flex items-center gap-1 bg-slate-50 hover:bg-white focus-within:bg-white border border-slate-200 focus-within:border-[#135c7e] rounded-lg px-2 py-1.5 transition">
                          <span class="text-slate-400 font-bold text-xs">₹</span>
                          <input 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            value="${m.purchaseRate.toFixed(2)}" 
                            onchange="window.acsApp.updateStockInline('${m.id}', 'purchaseRate', this.value)"
                            class="w-16 bg-transparent text-slate-800 font-bold text-xs outline-none"
                            title="Edit Cost Price (Purchase Rate)"
                          />
                        </div>
                        <span class="text-[10px] text-slate-400 block mt-0.5">Per unit cost</span>
                      </td>
                      <td class="py-3.5 px-3">
                        <div class="flex items-center gap-1 bg-emerald-50/60 hover:bg-white focus-within:bg-white border border-emerald-200 focus-within:border-emerald-500 rounded-lg px-2 py-1.5 transition">
                          <span class="text-emerald-700 font-bold text-xs">₹</span>
                          <input 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            value="${m.mrp.toFixed(2)}" 
                            onchange="window.acsApp.updateStockInline('${m.id}', 'mrp', this.value)"
                            class="w-16 bg-transparent text-emerald-800 font-black text-xs outline-none"
                            title="Edit Selling Price (MRP)"
                          />
                        </div>
                        <span class="text-[10px] text-emerald-700 font-semibold block mt-0.5">Public MRP</span>
                      </td>
                      <td class="py-3.5 px-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <button onclick="window.acsApp.openEditMedicineModal('${m.id}')" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Full Edit (Batch, Salt, Price)">
                            <i class="fa fa-pencil"></i>
                          </button>
                          <button onclick="window.acsApp.deleteMedicine('${m.id}')" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Medicine">
                            <i class="fa fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  bindStockEvents() {
    const searchInput = document.getElementById("stock-search-input");
    const scheduleSelect = document.getElementById("stock-schedule-select");
    const alertSelect = document.getElementById("stock-alert-select");
    const btnAddMedicine = document.getElementById("btn-add-medicine");
    const btnExportCsv = document.getElementById("btn-export-csv");
    const btnImportCsv = document.getElementById("btn-import-csv");
    const csvFileInput = document.getElementById("csv-file-input");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.stockSearchQuery = e.target.value;
        this.renderCurrentView();
      });
    }

    if (scheduleSelect) {
      scheduleSelect.addEventListener("change", (e) => {
        this.stockScheduleFilter = e.target.value;
        this.renderCurrentView();
      });
    }

    if (alertSelect) {
      alertSelect.addEventListener("change", (e) => {
        this.stockAlertFilter = e.target.value;
        this.renderCurrentView();
      });
    }

    if (btnAddMedicine) {
      btnAddMedicine.addEventListener("click", () => {
        this.openAddMedicineModal();
      });
    }

    if (btnExportCsv) {
      btnExportCsv.addEventListener("click", () => {
        this.exportStockToCsv();
      });
    }

    if (btnImportCsv && csvFileInput) {
      btnImportCsv.addEventListener("click", () => {
        csvFileInput.click();
      });

      csvFileInput.addEventListener("change", (e) => {
        this.handleCsvUpload(e);
      });
    }
  }

  updateStockInline(medicineId, field, rawValue) {
    const store = this.getCurrentStore();
    const item = store.stocks.find((m) => m.id === medicineId);
    if (!item) return;

    let value = rawValue;
    if (field === "quantity") {
      value = Math.max(0, parseInt(rawValue) || 0);
    } else if (field === "mrp" || field === "purchaseRate") {
      value = Math.max(0, parseFloat(rawValue) || 0);
    } else if (typeof rawValue === "string") {
      value = rawValue.trim();
    }

    item[field] = value;
    this.saveStores();
    this.renderCurrentView();

    this.showToast(`Updated "${item.name}": Selling Price ₹${item.mrp.toFixed(2)}, Buying Cost ₹${item.purchaseRate.toFixed(2)}`, "success");
  }

  adjustStockQty(medicineId, delta) {
    const store = this.getCurrentStore();
    const item = store.stocks.find((m) => m.id === medicineId);
    if (!item) return;

    item.quantity = Math.max(0, item.quantity + delta);
    this.saveStores();
    this.renderCurrentView();
    this.showToast(`Updated "${item.name}" stock: ${item.quantity} units`, "info");
  }

  deleteMedicine(medicineId) {
    const store = this.getCurrentStore();
    const item = store.stocks.find((m) => m.id === medicineId);
    if (!item) return;

    if (confirm(`Are you sure you want to delete ${item.name} from inventory?`)) {
      store.stocks = store.stocks.filter((m) => m.id !== medicineId);
      this.saveStores();
      this.renderCurrentView();
      this.showToast(`Deleted ${item.name} from stock records`, "danger");
    }
  }

  exportStockToCsv() {
    const store = this.getCurrentStore();
    if (!store || !store.stocks.length) {
      this.showToast("No medicines to export", "warning");
      return;
    }

    const headers = ["Medicine Name", "Salt / Generic Name", "Manufacturer", "Batch No", "Expiry Date", "Quantity", "Unit", "MRP", "Purchase Rate", "Schedule", "Rack Location"];
    const rows = store.stocks.map((m) => [
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.saltName.replace(/"/g, '""')}"`,
      `"${m.manufacturer.replace(/"/g, '""')}"`,
      `"${m.batchNo}"`,
      `"${m.expiryDate}"`,
      m.quantity,
      `"${m.unit}"`,
      m.mrp,
      m.purchaseRate,
      `"${m.schedule}"`,
      `"${m.rackLocation}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${store.name.replace(/[^a-zA-Z0-9]/g, "_")}_stocks.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast("Stock CSV exported successfully!", "success");
  }

  handleCsvUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          this.showToast("CSV file is empty or missing headers", "danger");
          return;
        }

        const store = this.getCurrentStore();
        let addedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 6) {
            store.stocks.push({
              id: `med-import-${Date.now()}-${i}`,
              name: cols[0] || "Imported Drug",
              saltName: cols[1] || "Generic Compound",
              manufacturer: cols[2] || "Generic Pharma",
              batchNo: cols[3] || `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
              expiryDate: cols[4] || "2027-12-31",
              quantity: parseInt(cols[5]) || 20,
              unit: cols[6] || "Strips",
              mrp: parseFloat(cols[7]) || 100.0,
              purchaseRate: parseFloat(cols[8]) || 70.0,
              schedule: cols[9] || "Schedule H",
              rackLocation: cols[10] || "Import Rack",
              minAlertThreshold: 20
            });
            addedCount++;
          }
        }

        this.saveStores();
        this.renderCurrentView();
        this.showToast(`Imported ${addedCount} medicine items from CSV!`, "success");
      } catch (err) {
        this.showToast("Error parsing CSV file format", "danger");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ==========================================
  // VIEW 4: STAFF & PHARMACIST ROSTER
  // ==========================================
  getStaffViewHtml(store) {
    if (!store) return ``;

    const activeDutyStaff = store.staff.find((st) => st.isOnDuty && st.uppcRegNo && st.uppcRegNo.startsWith("UPPC")) ||
      store.staff.find((st) => st.role.includes("Chief") || (st.uppcRegNo && st.uppcRegNo.startsWith("UPPC"))) ||
      store.staff[0];

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Staff Top Management Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-800 font-bold text-sm shadow-xs">
                <i class="fa fa-user-md"></i>
              </span>
              <h2 class="text-xl font-bold text-slate-800">Pharmacist & Staff Roster</h2>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Registered Pharmacists and staff roster for <strong>${store.name}</strong> as mandated under the Pharmacy Act 1948.
            </p>
          </div>

          <button id="btn-add-staff" class="inline-flex items-center gap-1.5 bg-[#135c7e] hover:bg-[#0f4b67] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition">
            <i class="fa fa-user-plus"></i> Add Staff / Pharmacist
          </button>
        </div>

        <!-- Live Statutory Shift & Pharmacist Duty Presence Board -->
        <div class="bg-gradient-to-r from-[#0d3b51] via-[#135c7e] to-[#1c4d75] text-white p-5 rounded-2xl shadow-md border border-teal-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Real-Time Shift Attendance & Biometrics
            </div>
            <h3 class="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <i class="fa fa-user-md text-amber-400"></i> Active Registered Pharmacist on Duty: ${activeDutyStaff ? activeDutyStaff.name : 'Qualified Incharge'}
            </h3>
            <p class="text-xs text-teal-100 max-w-2xl leading-relaxed">
              UPPC Reg: <strong class="text-amber-300 font-mono">${activeDutyStaff ? activeDutyStaff.uppcRegNo : 'UPPC-PH-Verified'}</strong> • Shift: <strong>${activeDutyStaff ? activeDutyStaff.shift : 'Active Duty'}</strong> • Biometric Clock-in: <strong>${activeDutyStaff ? (activeDutyStaff.dutyCheckInTime || '08:30 AM Logged') : 'Verified'}</strong>
            </p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5">
              <i class="fa fa-check-circle"></i> Section 42 Compliant
            </span>
          </div>
        </div>

        <!-- Pharmacist Statutory Warning Callout -->
        <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
          <i class="fa fa-shield text-amber-600 text-lg mt-0.5"></i>
          <div>
            <strong class="font-bold block text-sm">Pharmacy Act Statutory Compliance:</strong>
            It is mandatory that a registered pharmacist whose registration is active with the <strong>Uttar Pradesh Pharmacy Council (UPPC)</strong> remains personally present during all medicine dispensing hours. Non-compliance invites suspension under Form 20/21 rules.
          </div>
        </div>

        <!-- Staff Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${store.staff.length === 0 ? `
            <div class="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
              <i class="fa fa-users text-4xl text-slate-300 mb-2"></i>
              <h4 class="text-base font-semibold text-slate-700">No Staff Members Registered</h4>
              <p class="text-xs text-slate-500 mt-1">Click "Add Staff / Pharmacist" above to enroll personnel.</p>
            </div>
          ` : store.staff.map((st) => {
            const isPharmacist = st.uppcRegNo && st.uppcRegNo.startsWith("UPPC");
            return `
              <div class="portal-card bg-white p-5 flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-full ${isPharmacist ? 'bg-teal-100 text-[#135c7e]' : 'bg-slate-100 text-slate-600'} flex items-center justify-center font-bold text-base">
                        <i class="fa ${isPharmacist ? 'fa-user-md' : 'fa-user'}"></i>
                      </div>
                      <div>
                        <h4 class="font-bold text-slate-900 text-base">${st.name}</h4>
                        <span class="text-xs text-slate-500 block">${st.role}</span>
                      </div>
                    </div>
                    <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${st.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}">
                      <span class="w-1.5 h-1.5 rounded-full ${st.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
                      ${st.status}
                    </span>
                  </div>

                  <div class="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div class="flex items-center justify-between py-1 bg-slate-50 px-2 rounded">
                      <span class="text-slate-500 font-medium">UPPC Registration:</span>
                      <span class="font-mono font-bold ${isPharmacist ? 'text-[#135c7e]' : 'text-slate-400'}">
                        ${st.uppcRegNo}
                      </span>
                    </div>

                    <div class="flex items-center justify-between py-0.5">
                      <span class="text-slate-500">Qualification:</span>
                      <span class="font-semibold text-slate-800">${st.qualification}</span>
                    </div>

                    ${isPharmacist ? `
                      <div class="flex items-center justify-between py-0.5">
                        <span class="text-slate-500">UPPC Validity:</span>
                        <span class="font-semibold text-emerald-700 font-mono">${st.validUpto}</span>
                      </div>
                    ` : ''}

                    <div class="flex items-center justify-between py-0.5">
                      <span class="text-slate-500">Assigned Shift:</span>
                      <span class="font-medium text-slate-700">${st.shift}</span>
                    </div>

                    <div class="flex items-center justify-between py-0.5">
                      <span class="text-slate-500">Contact:</span>
                      <a href="tel:${st.phone}" class="font-medium text-blue-700 hover:underline">${st.phone}</a>
                    </div>
                  </div>

                  <!-- Real-Time Duty Attendance Status & Toggle -->
                  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      ${st.isOnDuty ? `
                        <span class="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> PRESENT ON DUTY
                        </span>
                      ` : `
                        <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          OFF DUTY
                        </span>
                      `}
                    </div>
                    <button 
                      onclick="window.acsApp.toggleStaffDuty('${st.id}')" 
                      class="text-xs px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${st.isOnDuty ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300' : 'bg-[#135c7e] hover:bg-[#0f4b67] text-white shadow-xs'}"
                      title="${st.isOnDuty ? 'Mark staff off duty' : 'Biometric shift clock-in'}"
                    >
                      <i class="fa ${st.isOnDuty ? 'fa-clock-o' : 'fa-check-circle'}"></i>
                      <span>${st.isOnDuty ? 'Mark Off Duty' : 'Biometric Clock-In'}</span>
                    </button>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    ${st.isAadhaarVerified ? `
                      <span class="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <i class="fa fa-check-circle"></i> Aadhaar Linked
                      </span>
                    ` : `
                      <span class="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                        <i class="fa fa-clock-o"></i> Verification Pending
                      </span>
                    `}
                  </div>

                  <div class="flex items-center gap-1">
                    ${isPharmacist ? `
                      <button onclick="window.acsApp.verifyPharmacistId('${st.uppcRegNo}')" class="text-xs text-[#135c7e] hover:bg-teal-50 px-2 py-1 rounded font-semibold" title="Verify Online">
                        Verify ID
                      </button>
                    ` : ''}
                    <button onclick="window.acsApp.deleteStaff('${st.id}')" class="text-xs text-rose-600 hover:bg-rose-50 px-2 py-1 rounded" title="Remove staff">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  bindStaffEvents() {
    const btnAddStaff = document.getElementById("btn-add-staff");
    if (btnAddStaff) {
      btnAddStaff.addEventListener("click", () => {
        this.openAddStaffModal();
      });
    }
  }

  deleteStaff(staffId) {
    const store = this.getCurrentStore();
    const st = store.staff.find((s) => s.id === staffId);
    if (!st) return;

    if (confirm(`Remove ${st.name} (${st.role}) from store roster?`)) {
      store.staff = store.staff.filter((s) => s.id !== staffId);
      this.saveStores();
      this.renderCurrentView();
      this.showToast(`Removed ${st.name} from staff roster`, "info");
    }
  }

  // ==========================================
  // VIEW 5: REVENUE & FINANCIAL ANALYTICS
  // ==========================================
  getRevenueViewHtml(store) {
    if (!store) return ``;

    const rev = store.revenueData;

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Top Revenue Bar with Privacy Lock -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-800 font-bold text-sm">
                <i class="fa fa-inr"></i>
              </span>
              <h2 class="text-xl font-bold text-slate-800">Financial Ledger & Revenue Intelligence</h2>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Sales, cash vs digital transactions, and GST accounting records for <strong>${store.name}</strong>.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button id="btn-toggle-privacy" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border ${this.financialsVisible ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-100 border-slate-300 text-slate-700'} transition">
              <i class="fa ${this.financialsVisible ? 'fa-eye-slash' : 'fa-eye'}"></i>
              <span>${this.financialsVisible ? 'Hide Numbers (Privacy Mode)' : 'Reveal Financial Numbers'}</span>
            </button>
            <button id="btn-add-sales" class="inline-flex items-center gap-1.5 bg-[#135c7e] hover:bg-[#0f4b67] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
              <i class="fa fa-plus"></i> Record Daily Sales
            </button>
          </div>
        </div>

        <!-- Privacy Notification Banner -->
        ${!this.financialsVisible ? `
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
            <span class="flex items-center gap-2">
              <i class="fa fa-lock text-blue-700 text-sm"></i>
              Financial figures are obscured for privacy in public or customer-facing environments. Click "Reveal Financial Numbers" to view.
            </span>
            <button onclick="window.acsApp.toggleFinancialPrivacy()" class="font-bold underline text-blue-800">Reveal Now</button>
          </div>
        ` : ''}

        <!-- Metric Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="portal-card bg-white p-5 border-l-4 border-l-teal-600">
            <span class="text-xs text-slate-500 font-semibold block uppercase">Today's Total Sales</span>
            <div class="text-2xl font-black text-slate-900 mt-1 ${this.financialsVisible ? '' : 'privacy-blur'}">
              ₹ ${rev.todaySales.toLocaleString('en-IN')}
            </div>
            <span class="text-[11px] text-emerald-600 font-medium mt-1 block">
              <i class="fa fa-arrow-up"></i> +4.2% vs yesterday
            </span>
          </div>

          <div class="portal-card bg-white p-5 border-l-4 border-l-[#135c7e]">
            <span class="text-xs text-slate-500 font-semibold block uppercase">Current Month Gross</span>
            <div class="text-2xl font-black text-[#135c7e] mt-1 ${this.financialsVisible ? '' : 'privacy-blur'}">
              ₹ ${rev.monthlyGross.toLocaleString('en-IN')}
            </div>
            <span class="text-[11px] text-slate-500 font-medium mt-1 block">
              Last month: ₹ ${rev.lastMonthGross.toLocaleString('en-IN')}
            </span>
          </div>

          <div class="portal-card bg-white p-5 border-l-4 border-l-blue-600">
            <span class="text-xs text-slate-500 font-semibold block uppercase">Total Monthly Invoices</span>
            <div class="text-2xl font-black text-blue-700 mt-1 ${this.financialsVisible ? '' : 'privacy-blur'}">
              ${rev.totalOrdersThisMonth || 520}
            </div>
            <span class="text-[11px] text-slate-500 font-medium mt-1 block">
              Dispensed Retail Tax Invoices
            </span>
          </div>

          <div class="portal-card bg-white p-5 border-l-4 border-l-amber-500">
            <span class="text-xs text-slate-500 font-semibold block uppercase">GST Liability (Est.)</span>
            <div class="text-2xl font-black text-amber-700 mt-1 ${this.financialsVisible ? '' : 'privacy-blur'}">
              ₹ ${rev.gstCollectedMonthly.toLocaleString('en-IN')}
            </div>
            <span class="text-[11px] text-slate-500 font-medium mt-1 block">
              12% Avg Pharma Tax Bracket
            </span>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i class="fa fa-bar-chart text-[#135c7e]"></i> Monthly Revenue Growth (Digital vs Cash)
              </h3>
              <span class="text-xs text-slate-400">Past 6 Months</span>
            </div>
            <div class="h-64">
              <canvas id="monthly-revenue-chart"></canvas>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i class="fa fa-pie-chart text-amber-600"></i> Payment Modes Share
              </h3>
              <span class="text-xs text-slate-400">UPI / Cash / Card</span>
            </div>
            <div class="h-64 flex items-center justify-center">
              <canvas id="payment-modes-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Recent Monthly Ledger Table -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider">Historical Monthly Settlements</h4>
            <button onclick="window.acsApp.showToast('Monthly ledger exported to PDF successfully!', 'success')" class="text-xs text-[#135c7e] hover:underline font-semibold flex items-center gap-1">
              <i class="fa fa-file-pdf-o"></i> Download Tax Summary
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th class="py-2.5 px-4">Billing Month</th>
                  <th class="py-2.5 px-4">Gross Turnover</th>
                  <th class="py-2.5 px-4">Digital Mode (UPI/POS)</th>
                  <th class="py-2.5 px-4">Cash Mode</th>
                  <th class="py-2.5 px-4">Digital Share %</th>
                  <th class="py-2.5 px-4">Audit Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${rev.monthlyHistory.map((m) => {
                  const digitalRatio = Math.round((m.digital / m.revenue) * 100);
                  return `
                    <tr class="hover:bg-slate-50/70">
                      <td class="py-2.5 px-4 font-bold text-slate-800">${m.month}</td>
                      <td class="py-2.5 px-4 font-mono font-bold text-slate-900 ${this.financialsVisible ? '' : 'privacy-blur'}">
                        ₹ ${m.revenue.toLocaleString('en-IN')}
                      </td>
                      <td class="py-2.5 px-4 font-mono text-emerald-700 ${this.financialsVisible ? '' : 'privacy-blur'}">
                        ₹ ${m.digital.toLocaleString('en-IN')}
                      </td>
                      <td class="py-2.5 px-4 font-mono text-slate-600 ${this.financialsVisible ? '' : 'privacy-blur'}">
                        ₹ ${m.cash.toLocaleString('en-IN')}
                      </td>
                      <td class="py-2.5 px-4">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-700">
                          ${digitalRatio}%
                        </span>
                      </td>
                      <td class="py-2.5 px-4">
                        <span class="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
                          <i class="fa fa-check-circle"></i> Reconciled
                        </span>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  bindRevenueEvents() {
    const btnToggle = document.getElementById("btn-toggle-privacy");
    const btnAddSales = document.getElementById("btn-add-sales");

    if (btnToggle) {
      btnToggle.addEventListener("click", () => {
        this.toggleFinancialPrivacy();
      });
    }

    if (btnAddSales) {
      btnAddSales.addEventListener("click", () => {
        this.openAddSalesModal();
      });
    }
  }

  toggleFinancialPrivacy() {
    this.financialsVisible = !this.financialsVisible;
    this.renderCurrentView();
    this.showToast(
      this.financialsVisible ? "Financial numbers unlocked" : "Financial numbers hidden",
      "info"
    );
  }

  renderRevenueCharts(store) {
    if (typeof Chart === "undefined") return;

    if (this.charts["monthlyRevenue"]) this.charts["monthlyRevenue"].destroy();
    if (this.charts["paymentModes"]) this.charts["paymentModes"].destroy();

    const rev = store.revenueData;

    // 1. Monthly Revenue Chart
    const ctxMonthly = document.getElementById("monthly-revenue-chart");
    if (ctxMonthly) {
      this.charts["monthlyRevenue"] = new Chart(ctxMonthly, {
        type: "bar",
        data: {
          labels: rev.monthlyHistory.map((h) => h.month),
          datasets: [
            {
              label: "Digital (UPI & Card)",
              data: rev.monthlyHistory.map((h) => h.digital),
              backgroundColor: "#135c7e",
              borderRadius: 4
            },
            {
              label: "Cash Counter",
              data: rev.monthlyHistory.map((h) => h.cash),
              backgroundColor: "#f5a623",
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: { 
              stacked: true, 
              ticks: { 
                callback: (val) => "₹ " + (val / 100000).toFixed(1) + "L" 
              } 
            }
          },
          plugins: {
            legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }

    // 2. Payment Modes Chart
    const ctxPayment = document.getElementById("payment-modes-chart");
    if (ctxPayment) {
      this.charts["paymentModes"] = new Chart(ctxPayment, {
        type: "doughnut",
        data: {
          labels: ["UPI / QR", "Credit & Debit Cards", "Cash Counter"],
          datasets: [
            {
              data: [rev.paymentChannels.upi, rev.paymentChannels.cards, rev.paymentChannels.cash],
              backgroundColor: ["#135c7e", "#2c5895", "#f5a623"],
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }
  }

  // ==========================================
  // VIEW 6: STATUTORY VERIFICATION PORTAL
  // ==========================================
  getVerifyViewHtml() {
    return `
      <div class="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-50 text-[#135c7e] text-2xl mb-3">
            <i class="fa fa-id-badge"></i>
          </div>
          <h2 class="text-xl font-bold text-slate-800">Uttar Pradesh Pharmacist & Drug License Verifier</h2>
          <p class="text-xs text-slate-500 max-w-lg mx-auto mt-1">
            Check the authenticity of any Pharmacist UPPC Registration Number or UP Drug Retail License (Form 20/21) against the central database.
          </p>

          <div class="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <input 
              type="text" 
              id="verify-input" 
              placeholder="e.g. UPPC-PH-41290 or UP/LKO/2021/20/4891" 
              class="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135c7e] font-mono uppercase"
            />
            <button id="btn-perform-verify" class="bg-[#135c7e] hover:bg-[#0f4b67] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition">
              Verify Credentials
            </button>
          </div>
        </div>

        <div id="verify-result-box"></div>
      </div>
    `;
  }

  bindVerifyEvents() {
    const btn = document.getElementById("btn-perform-verify");
    const input = document.getElementById("verify-input");

    if (btn && input) {
      btn.addEventListener("click", () => {
        this.runVerification(input.value.trim());
      });

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.runVerification(input.value.trim());
        }
      });
    }
  }

  verifyPharmacistId(id) {
    this.switchTab("verify");
    setTimeout(() => {
      const input = document.getElementById("verify-input");
      if (input) {
        input.value = id;
        this.runVerification(id);
      }
    }, 100);
  }

  runVerification(query) {
    const resultBox = document.getElementById("verify-result-box");
    if (!resultBox) return;

    if (!query) {
      resultBox.innerHTML = `
        <div class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs text-center">
          Please enter a UPPC Registration Number or Drug License number to verify.
        </div>
      `;
      return;
    }

    let foundStaff = null;
    let foundStore = null;

    for (const store of this.stores) {
      for (const st of store.staff) {
        if (st.uppcRegNo && st.uppcRegNo.toLowerCase() === query.toLowerCase()) {
          foundStaff = st;
          foundStore = store;
          break;
        }
      }
      if (foundStaff) break;
    }

    let matchingStoreLicense = this.stores.find(
      (s) => s.license20.toLowerCase() === query.toLowerCase() || s.license21.toLowerCase() === query.toLowerCase()
    );

    if (foundStaff) {
      resultBox.innerHTML = `
        <div class="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-md space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <i class="fa fa-check"></i>
              </span>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">UPPC Pharmacist Record Verified</h4>
                <span class="text-[11px] text-emerald-600 font-semibold">Active & In Good Standing</span>
              </div>
            </div>
            <span class="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-mono font-bold">
              ${foundStaff.uppcRegNo}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span class="text-slate-400 block">Pharmacist Name:</span>
              <span class="font-bold text-slate-800 text-sm">${foundStaff.name}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Qualifications:</span>
              <span class="font-semibold text-slate-800">${foundStaff.qualification}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Registration Valid Upto:</span>
              <span class="font-mono font-bold text-emerald-700">${foundStaff.validUpto}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Assigned Pharmacy:</span>
              <span class="font-semibold text-slate-800">${foundStore.name} (${foundStore.district})</span>
            </div>
          </div>
        </div>
      `;
    } else if (matchingStoreLicense) {
      resultBox.innerHTML = `
        <div class="bg-white p-6 rounded-2xl border-2 border-blue-500 shadow-md space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <i class="fa fa-check"></i>
              </span>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">UP Drug License Verified (Form 20/21)</h4>
                <span class="text-[11px] text-blue-600 font-semibold">Valid Under Drugs & Cosmetics Act</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span class="text-slate-400 block">Pharmacy Store:</span>
              <span class="font-bold text-slate-800 text-sm">${matchingStoreLicense.name}</span>
            </div>
            <div>
              <span class="text-slate-400 block">District & City:</span>
              <span class="font-semibold text-slate-800">${matchingStoreLicense.district}, UP</span>
            </div>
            <div>
              <span class="text-slate-400 block">License Form 20:</span>
              <span class="font-mono font-bold text-slate-800">${matchingStoreLicense.license20}</span>
            </div>
            <div>
              <span class="text-slate-400 block">License Form 21:</span>
              <span class="font-mono font-bold text-slate-800">${matchingStoreLicense.license21}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      resultBox.innerHTML = `
        <div class="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm text-center">
          <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2 text-xl">
            <i class="fa fa-exclamation"></i>
          </div>
          <h4 class="font-bold text-slate-800 text-sm">No Record Found for "${query}"</h4>
          <p class="text-xs text-slate-500 mt-1">
            Check the number for typographical errors. Sample valid numbers: <code>UPPC-PH-41290</code>, <code>UPPC-PH-37812</code>, <code>UP/LKO/2021/20/4891</code>.
          </p>
        </div>
      `;
    }
  }

  // ==========================================
  // MODALS: ADD STORE, MEDICINE, STAFF, SALES
  // ==========================================
  openAddStoreModal() {
    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal || !title || !body) return;

    title.innerHTML = `<i class="fa fa-hospital-o text-teal-700"></i> Onboard New Pharmacy Store (UP)`;
    body.innerHTML = `
      <form id="form-add-store" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Store / Firm Name *</label>
            <input type="text" id="new-store-name" required placeholder="e.g. Anand Health Chemist" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#135c7e]" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">UP District *</label>
            <select id="new-store-district" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#135c7e]">
              ${UP_DISTRICTS.map(d => `<option value="${d}">${d}</option>`).join("")}
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Full Shop Address *</label>
          <input type="text" id="new-store-address" required placeholder="Shop No., Market / Locality, PIN Code" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#135c7e]" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Drug License (Form 20) *</label>
            <input type="text" id="new-store-lic20" required placeholder="e.g. UP/LKO/2024/20/5501" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#135c7e]" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Drug License (Form 21) *</label>
            <input type="text" id="new-store-lic21" required placeholder="e.g. UP/LKO/2024/21/5502" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#135c7e]" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Owner Name *</label>
            <input type="text" id="new-store-owner" required placeholder="Owner Full Name" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#135c7e]" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
            <input type="tel" id="new-store-phone" required placeholder="+91 98765 43210" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#135c7e]" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
            <input type="text" id="new-store-gstin" placeholder="09XXXXX..." class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#135c7e]" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Storefront Photo URL / Upload</label>
            <input type="text" id="new-store-photo" placeholder="https://images.unsplash.com/..." class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#135c7e]" />
            <span class="text-[10px] text-slate-400">Leave blank to use verified default pharmacy facade image.</span>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Operating Hours</label>
            <input type="text" id="new-store-hours" placeholder="e.g. 09:00 AM - 10:00 PM" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#135c7e]" />
            <label class="inline-flex items-center gap-1.5 mt-2 text-slate-700">
              <input type="checkbox" id="new-store-24x7" class="rounded text-[#135c7e]" />
              <span>Is this an open 24x7 Emergency Chemist?</span>
            </label>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onclick="window.acsApp.closeModal()" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-semibold">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-[#135c7e] hover:bg-[#0f4b67] text-white rounded-lg font-semibold shadow">Register & Host My Website</button>
        </div>
      </form>
    `;

    modal.classList.remove("hidden");

    document.getElementById("form-add-store").onsubmit = (e) => {
      e.preventDefault();
      const storeName = document.getElementById("new-store-name").value;
      const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const newStore = {
        id: `store-up-${Date.now().toString().slice(-4)}`,
        slug: slug || `pharmacy-${Date.now().toString().slice(-4)}`,
        name: storeName,
        district: document.getElementById("new-store-district").value,
        city: document.getElementById("new-store-district").value,
        address: document.getElementById("new-store-address").value,
        license20: document.getElementById("new-store-lic20").value,
        license21: document.getElementById("new-store-lic21").value,
        ownerName: document.getElementById("new-store-owner").value,
        phone: document.getElementById("new-store-phone").value,
        whatsapp: document.getElementById("new-store-phone").value.replace(/[^0-9]/g, ""),
        email: "contact@" + storeName.toLowerCase().replace(/[^a-z]/g, "") + ".com",
        gstin: document.getElementById("new-store-gstin").value || "09AABCS0000P1Z1",
        establishedYear: new Date().getFullYear().toString(),
        operatingHours: document.getElementById("new-store-hours").value || "09:00 AM - 10:00 PM",
        is24x7: document.getElementById("new-store-24x7").checked,
        status: "Verified",
        photoUrl: document.getElementById("new-store-photo").value || "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        staff: [
          {
            id: `st-${Date.now()}-1`,
            name: document.getElementById("new-store-owner").value,
            role: "Registered Pharmacist & Incharge",
            uppcRegNo: "UPPC-PH-" + Math.floor(40000 + Math.random() * 20000),
            qualification: "B.Pharm (UP)",
            regDate: "2020-01-01",
            validUpto: "2030-01-01",
            phone: document.getElementById("new-store-phone").value,
            shift: "General Shift",
            isAadhaarVerified: true,
            status: "Active"
          }
        ],
        stocks: [
          {
            id: `med-${Date.now()}-1`,
            name: "Paracetamol 650mg",
            saltName: "Paracetamol IP 650mg",
            manufacturer: "Generic Pharma",
            batchNo: "BAT-GEN-101",
            expiryDate: "2028-12-31",
            quantity: 100,
            unit: "Strips (10 tabs)",
            mrp: 30.00,
            purchaseRate: 20.00,
            schedule: "OTC",
            rackLocation: "Rack A-01",
            minAlertThreshold: 20
          },
          {
            id: `med-${Date.now()}-2`,
            name: "Augmentin 625 Duo Tablet",
            saltName: "Amoxicillin + Potassium Clavulanate",
            manufacturer: "GSK Pharmaceuticals",
            batchNo: "BAT-AUG-5501",
            expiryDate: "2027-08-31",
            quantity: 80,
            unit: "Strips (10 tabs)",
            mrp: 220.00,
            purchaseRate: 165.00,
            schedule: "Schedule H",
            rackLocation: "Rack A-02",
            minAlertThreshold: 25
          }
        ],
        revenueData: {
          todaySales: 15000,
          monthlyGross: 450000,
          lastMonthGross: 410000,
          avgGrossMarginPercent: 21.0,
          totalOrdersThisMonth: 520,
          digitalSplitPercent: 65,
          cashSplitPercent: 35,
          gstCollectedMonthly: 54000,
          monthlyHistory: [
            { month: "Aug", revenue: 390000, digital: 240000, cash: 150000 },
            { month: "Sep", revenue: 410000, digital: 260000, cash: 150000 },
            { month: "Oct (Current)", revenue: 450000, digital: 292500, cash: 157500 }
          ],
          paymentChannels: { upi: 55, cards: 10, cash: 35 }
        }
      };

      this.stores.unshift(newStore);
      this.currentStoreId = newStore.id;
      this.currentUser = {
        role: "pharmacy_owner",
        name: newStore.ownerName,
        storeId: newStore.id,
        storeName: newStore.name
      };
      this.saveUserSession();
      this.saveStores();
      this.closeModal();
      this.renderHeaderBar();

      // Immediately show their real hosted website!
      this.viewHostedWebsite(newStore.id);
      this.showToast(`🎉 Congratulations! Your pharmacy website "${newStore.name}" is now live and hosted online!`, "success");
    };
  }

  openEditStoreModal(storeId) {
    const store = this.stores.find((s) => s.id === storeId);
    if (!store) return;

    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal || !title || !body) return;

    title.innerHTML = `<i class="fa fa-pencil-square-o text-teal-700"></i> Edit Pharmacy & Live Hosted Webpage: ${store.name}`;
    body.innerHTML = `
      <form id="form-edit-store" class="space-y-4 text-xs">
        <!-- Photo Management & Live Preview Card -->
        <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <i class="fa fa-camera text-teal-700"></i> Storefront Photo & Signboard
            </span>
            <span class="text-[10px] text-slate-500 font-medium">Shown on your public live webpage</span>
          </div>

          <!-- Live Image Preview Banner -->
          <div class="relative h-40 w-full rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-300 shadow-inner group">
            <img id="edit-store-photo-preview" src="${store.photoUrl}" alt="${store.name}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
              <span class="text-white font-bold text-xs" id="edit-store-preview-caption">${store.name}</span>
            </div>
          </div>

          <!-- Photo Edit Actions (Device Upload + URL + Presets) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Upload New Photo From Device</label>
              <input type="file" id="edit-store-photo-file" accept="image/*" class="w-full text-[11px] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-700 file:text-white hover:file:bg-teal-800 cursor-pointer" />
              <span class="text-[10px] text-slate-400 mt-0.5 block">Select JPG, PNG, or WEBP from phone or PC</span>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Or Paste Direct Photo URL</label>
              <input type="text" id="edit-store-photo" value="${store.photoUrl}" placeholder="https://..." class="w-full px-3 py-1.5 border rounded-lg bg-white font-mono text-[11px]" />
              <span class="text-[10px] text-slate-400 mt-0.5 block">Auto-updates preview on change</span>
            </div>
          </div>

          <!-- Preset Gallery Selector -->
          <div class="pt-2 border-t border-slate-200">
            <span class="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Or Choose an Official Preset Photo:</span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button type="button" onclick="window.acsApp.applyStorePhotoPreset('https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80', 'Retail Pharmacy')" class="p-1.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-lg text-left transition flex items-center gap-2">
                <img src="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=120&q=80" class="w-8 h-8 rounded object-cover flex-shrink-0" />
                <span class="text-[10px] font-semibold text-slate-700 leading-tight">Standard Chemist</span>
              </button>
              <button type="button" onclick="window.acsApp.applyStorePhotoPreset('https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80', 'Clinical Pharmacy')" class="p-1.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-lg text-left transition flex items-center gap-2">
                <img src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=120&q=80" class="w-8 h-8 rounded object-cover flex-shrink-0" />
                <span class="text-[10px] font-semibold text-slate-700 leading-tight">Clinical Care</span>
              </button>
              <button type="button" onclick="window.acsApp.applyStorePhotoPreset('https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80', 'Hospital Dispensary')" class="p-1.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-lg text-left transition flex items-center gap-2">
                <img src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=120&q=80" class="w-8 h-8 rounded object-cover flex-shrink-0" />
                <span class="text-[10px] font-semibold text-slate-700 leading-tight">Dispensary</span>
              </button>
              <button type="button" onclick="window.acsApp.applyStorePhotoPreset('https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80', 'Emergency Medicos')" class="p-1.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-lg text-left transition flex items-center gap-2">
                <img src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=120&q=80" class="w-8 h-8 rounded object-cover flex-shrink-0" />
                <span class="text-[10px] font-semibold text-slate-700 leading-tight">24x7 Medicos</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Store Identification & Owner Details -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Pharmacy / Chemist Firm Name *</label>
            <input type="text" id="edit-store-name" required value="${store.name}" class="w-full px-3 py-2 border rounded-lg font-bold text-slate-900" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Proprietor / Pharmacist Incharge Name *</label>
            <input type="text" id="edit-store-owner" required value="${store.ownerName || ''}" class="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">District (Uttar Pradesh) *</label>
            <input type="text" id="edit-store-district" required value="${store.district}" class="w-full px-3 py-2 border rounded-lg font-semibold" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">City / Town *</label>
            <input type="text" id="edit-store-city" required value="${store.city || store.district}" class="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Licensed Premises Address *</label>
          <input type="text" id="edit-store-address" required value="${store.address}" class="w-full px-3 py-2 border rounded-lg" />
        </div>

        <!-- Licenses & GSTIN -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Form 20 Retail Drug Lic *</label>
            <input type="text" id="edit-store-lic20" required value="${store.license20}" class="w-full px-3 py-2 border rounded-lg font-mono font-bold" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Form 21 Biological Lic *</label>
            <input type="text" id="edit-store-lic21" required value="${store.license21}" class="w-full px-3 py-2 border rounded-lg font-mono font-bold" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">GSTIN (Tax ID)</label>
            <input type="text" id="edit-store-gstin" value="${store.gstin}" class="w-full px-3 py-2 border rounded-lg font-mono" />
          </div>
        </div>

        <!-- Contact & Operating Hours -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Phone Helpline *</label>
            <input type="text" id="edit-store-phone" required value="${store.phone}" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">WhatsApp Order Number</label>
            <input type="text" id="edit-store-whatsapp" value="${store.whatsapp || ''}" class="w-full px-3 py-2 border rounded-lg font-mono" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Operating Hours</label>
            <input type="text" id="edit-store-hours" value="${store.operatingHours}" class="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer font-bold text-teal-950">
            <input type="checkbox" id="edit-store-24x7" ${store.is24x7 ? "checked" : ""} class="w-4 h-4 text-teal-700 rounded" />
            <span>24x7 Emergency All-Night Service Available</span>
          </label>
          <span class="text-[11px] text-teal-800">Badge shown on Google & storefront</span>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button type="button" onclick="window.acsApp.closeModal()" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" class="px-6 py-2 bg-[#135c7e] hover:bg-[#0f4b67] text-white rounded-lg font-bold shadow-md transition flex items-center gap-2">
            <i class="fa fa-check"></i> Save & Synchronize Live Webpage
          </button>
        </div>
      </form>
    `;

    modal.classList.remove("hidden");

    // Real-time photo preview listeners
    const fileInput = document.getElementById("edit-store-photo-file");
    const urlInput = document.getElementById("edit-store-photo");
    const previewImg = document.getElementById("edit-store-photo-preview");

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            if (previewImg) previewImg.src = loadEvt.target.result;
            if (urlInput) urlInput.value = loadEvt.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (urlInput) {
      urlInput.addEventListener("input", (e) => {
        if (previewImg && e.target.value.trim()) {
          previewImg.src = e.target.value.trim();
        }
      });
    }

    const nameInput = document.getElementById("edit-store-name");
    const captionEl = document.getElementById("edit-store-preview-caption");
    if (nameInput && captionEl) {
      nameInput.addEventListener("input", (e) => {
        captionEl.textContent = e.target.value || "My Pharmacy";
      });
    }

    document.getElementById("form-edit-store").onsubmit = (e) => {
      e.preventDefault();
      store.name = document.getElementById("edit-store-name").value.trim();
      store.ownerName = document.getElementById("edit-store-owner").value.trim();
      store.district = document.getElementById("edit-store-district").value.trim();
      store.city = document.getElementById("edit-store-city").value.trim();
      store.address = document.getElementById("edit-store-address").value.trim();
      store.license20 = document.getElementById("edit-store-lic20").value.trim();
      store.license21 = document.getElementById("edit-store-lic21").value.trim();
      store.gstin = document.getElementById("edit-store-gstin").value.trim();
      store.phone = document.getElementById("edit-store-phone").value.trim();
      store.whatsapp = (document.getElementById("edit-store-whatsapp").value || store.phone).replace(/[^0-9]/g, "");
      store.operatingHours = document.getElementById("edit-store-hours").value.trim();
      store.is24x7 = document.getElementById("edit-store-24x7").checked;
      store.photoUrl = document.getElementById("edit-store-photo").value.trim() || store.photoUrl;

      // Keep user session store name in sync if logged-in owner
      if (this.currentUser && this.currentUser.storeId === store.id) {
        this.currentUser.storeName = store.name;
        this.currentUser.name = store.ownerName || this.currentUser.name;
        this.saveUserSession();
      }

      this.saveStores();
      this.closeModal();
      this.renderHeaderBar();
      this.renderCurrentView();

      // Trigger cross-tab sync
      try {
        window.dispatchEvent(new Event("storage"));
      } catch (err) {}

      this.showToast(`🎉 Pharmacy profile & storefront photo updated! Live hosted website synchronized.`, "success");
    };
  }

  applyStorePhotoPreset(photoUrl, label) {
    const previewImg = document.getElementById("edit-store-photo-preview");
    const urlInput = document.getElementById("edit-store-photo");
    if (previewImg) previewImg.src = photoUrl;
    if (urlInput) urlInput.value = photoUrl;
    this.showToast(`Applied preset: ${label}`, "info");
  }

  openPhotoUpdateModal(storeId) {
    this.openEditStoreModal(storeId);
  }

  openAddMedicineModal() {
    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal || !title || !body) return;

    title.innerHTML = `<i class="fa fa-plus-circle text-teal-700"></i> Add New Medicine to Stock`;
    body.innerHTML = `
      <form id="form-add-med" class="space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Medicine Brand Name *</label>
            <input type="text" id="med-name" required placeholder="e.g. Calpol 500mg" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Generic / Salt Composition *</label>
            <input type="text" id="med-salt" required placeholder="e.g. Paracetamol 500mg" class="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Manufacturer *</label>
            <input type="text" id="med-mfg" required placeholder="e.g. GlaxoSmithKline" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Batch Number *</label>
            <input type="text" id="med-batch" required placeholder="e.g. BAT-2026-90" class="w-full px-3 py-2 border rounded-lg font-mono uppercase" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
            <input type="date" id="med-exp" required class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Schedule Category</label>
            <select id="med-schedule" class="w-full px-3 py-2 border rounded-lg">
              <option value="Schedule H">Schedule H (Prescription)</option>
              <option value="Schedule H1">Schedule H1 (High Alert / Antibiotic)</option>
              <option value="OTC">OTC (Over The Counter)</option>
              <option value="Schedule X">Schedule X (Narcotic / Habit-Forming)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Rack Location</label>
            <input type="text" id="med-rack" placeholder="e.g. Rack A-02" class="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div class="grid grid-cols-4 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Initial Qty *</label>
            <input type="number" id="med-qty" required min="1" value="50" class="w-full px-3 py-2 border rounded-xl" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Packaging Unit</label>
            <input type="text" id="med-unit" value="Strips" class="w-full px-3 py-2 border rounded-xl" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Cost Price (Buy ₹) *</label>
            <input type="number" id="med-buy" step="0.01" min="0" required value="85" class="w-full px-3 py-2 border rounded-xl font-bold text-slate-800" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Selling Price (MRP ₹) *</label>
            <input type="number" id="med-mrp" step="0.01" min="0" required value="120" class="w-full px-3 py-2 border rounded-xl font-extrabold text-emerald-800" />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onclick="window.acsApp.closeModal()" class="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-[#135c7e] hover:bg-[#0f4b67] text-white rounded-xl font-bold shadow-sm transition">Add to Stock</button>
        </div>
      </form>
    `;

    modal.classList.remove("hidden");

    document.getElementById("form-add-med").onsubmit = (e) => {
      e.preventDefault();
      const store = this.getCurrentStore();
      const newMed = {
        id: `med-${Date.now()}`,
        name: document.getElementById("med-name").value,
        saltName: document.getElementById("med-salt").value,
        manufacturer: document.getElementById("med-mfg").value,
        batchNo: document.getElementById("med-batch").value,
        expiryDate: document.getElementById("med-exp").value,
        schedule: document.getElementById("med-schedule").value,
        rackLocation: document.getElementById("med-rack").value || "General Shelf",
        quantity: parseInt(document.getElementById("med-qty").value) || 0,
        unit: document.getElementById("med-unit").value || "Strips",
        mrp: parseFloat(document.getElementById("med-mrp").value) || 0,
        purchaseRate: parseFloat(document.getElementById("med-buy").value) || 0,
        minAlertThreshold: 20
      };

      store.stocks.unshift(newMed);
      this.saveStores();
      this.closeModal();
      this.renderCurrentView();
      this.showToast(`Added "${newMed.name}" to inventory!`, "success");
    };
  }

  openEditMedicineModal(medicineId) {
    const store = this.getCurrentStore();
    const med = store.stocks.find(m => m.id === medicineId);
    if (!med) return;

    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal || !title || !body) return;

    title.innerHTML = `<i class="fa fa-pencil-square-o text-teal-700"></i> Edit Medicine Details: ${med.name}`;
    body.innerHTML = `
      <form id="form-edit-med" class="space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Brand Name *</label>
            <input type="text" id="edit-med-name" required value="${med.name}" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#135c7e]" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Salt / Generic Composition *</label>
            <input type="text" id="edit-med-salt" required value="${med.saltName}" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#135c7e]" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Manufacturer *</label>
            <input type="text" id="edit-med-mfg" required value="${med.manufacturer}" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#135c7e]" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Schedule Category *</label>
            <select id="edit-med-sched" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#135c7e] bg-white">
              <option value="Schedule H" ${med.schedule === 'Schedule H' ? 'selected' : ''}>Schedule H (Prescription)</option>
              <option value="Schedule H1" ${med.schedule === 'Schedule H1' ? 'selected' : ''}>Schedule H1 (High Alert / Antibiotic)</option>
              <option value="OTC" ${med.schedule === 'OTC' ? 'selected' : ''}>OTC / General</option>
              <option value="Schedule X" ${med.schedule === 'Schedule X' ? 'selected' : ''}>Schedule X (Narcotics)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Batch Number *</label>
            <input type="text" id="edit-med-batch" required value="${med.batchNo}" class="w-full px-3 py-2 border rounded-xl font-mono uppercase focus:ring-2 focus:ring-[#135c7e]" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Expiry Date *</label>
            <input type="date" id="edit-med-exp" required value="${med.expiryDate}" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#135c7e]" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Rack / Bay Location</label>
            <input type="text" id="edit-med-rack" value="${med.rackLocation}" class="w-full px-3 py-2 border rounded-xl font-mono focus:ring-2 focus:ring-[#135c7e]" />
          </div>
        </div>

        <div class="grid grid-cols-4 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
            <input type="number" id="edit-med-qty" min="0" required value="${med.quantity}" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#135c7e]" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Packaging Unit</label>
            <input type="text" id="edit-med-unit" value="${med.unit}" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#135c7e]" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Cost Price (Buy ₹) *</label>
            <input type="number" step="0.01" min="0" required id="edit-med-buy" value="${med.purchaseRate}" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#135c7e] font-bold text-slate-800" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Selling Price (MRP ₹) *</label>
            <input type="number" step="0.01" min="0" required id="edit-med-mrp" value="${med.mrp}" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 font-extrabold text-emerald-800" />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onclick="window.acsApp.closeModal()" class="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-[#135c7e] hover:bg-[#0f4b67] text-white rounded-xl font-bold shadow-sm transition">Save Changes & Update Live Site</button>
        </div>
      </form>
    `;

    modal.classList.remove("hidden");

    document.getElementById("form-edit-med").onsubmit = (e) => {
      e.preventDefault();
      med.name = document.getElementById("edit-med-name").value.trim();
      med.saltName = document.getElementById("edit-med-salt").value.trim();
      med.manufacturer = document.getElementById("edit-med-mfg").value.trim();
      med.schedule = document.getElementById("edit-med-sched").value;
      med.batchNo = document.getElementById("edit-med-batch").value.trim();
      med.expiryDate = document.getElementById("edit-med-exp").value;
      med.rackLocation = document.getElementById("edit-med-rack").value.trim() || "General Shelf";
      med.quantity = parseInt(document.getElementById("edit-med-qty").value) || 0;
      med.unit = document.getElementById("edit-med-unit").value.trim() || "Strips";
      med.mrp = parseFloat(document.getElementById("edit-med-mrp").value) || 0;
      med.purchaseRate = parseFloat(document.getElementById("edit-med-buy").value) || 0;

      this.saveStores();
      this.closeModal();
      this.renderCurrentView();

      this.showToast(`Updated "${med.name}": Selling Price ₹${med.mrp.toFixed(2)}, Buying Cost ₹${med.purchaseRate.toFixed(2)}`, "success");
    };
  }

  openAddStaffModal() {
    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal || !title || !body) return;

    title.innerHTML = `<i class="fa fa-user-plus text-teal-700"></i> Add Staff / Pharmacist`;
    body.innerHTML = `
      <form id="form-add-staff" class="space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Staff Full Name *</label>
            <input type="text" id="staff-name" required placeholder="e.g. Ramesh Chandra" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Role / Designation *</label>
            <select id="staff-role" class="w-full px-3 py-2 border rounded-lg">
              <option value="Chief Pharmacist">Chief Pharmacist</option>
              <option value="Registered Pharmacist">Registered Pharmacist</option>
              <option value="Assistant Pharmacist">Assistant Pharmacist</option>
              <option value="Billing & Inventory Desk">Billing & Inventory Desk</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">UPPC Reg Number (If Pharmacist)</label>
            <input type="text" id="staff-uppc" placeholder="e.g. UPPC-PH-71029" class="w-full px-3 py-2 border rounded-lg font-mono uppercase" />
            <span class="text-[10px] text-slate-400">Leave N/A for non-technical billing staff</span>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Qualification</label>
            <input type="text" id="staff-qual" placeholder="e.g. B.Pharm / D.Pharm" class="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Phone Number *</label>
            <input type="tel" id="staff-phone" required placeholder="+91 98765 43210" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Assigned Shift</label>
            <input type="text" id="staff-shift" value="Morning (08:00 AM - 04:00 PM)" class="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div class="pt-2">
          <label class="inline-flex items-center gap-2 text-slate-700">
            <input type="checkbox" id="staff-aadhaar" checked class="rounded text-[#135c7e]" />
            <span>Mark as Aadhaar & Identity Verified</span>
          </label>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onclick="window.acsApp.closeModal()" class="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-[#135c7e] text-white rounded-lg font-semibold">Enroll to Store Roster</button>
        </div>
      </form>
    `;

    modal.classList.remove("hidden");

    document.getElementById("form-add-staff").onsubmit = (e) => {
      e.preventDefault();
      const store = this.getCurrentStore();
      const newStaff = {
        id: `st-${Date.now()}`,
        name: document.getElementById("staff-name").value,
        role: document.getElementById("staff-role").value,
        uppcRegNo: document.getElementById("staff-uppc").value || "N/A (Non-Technical)",
        qualification: document.getElementById("staff-qual").value || "Higher Secondary",
        regDate: "2024-01-01",
        validUpto: "2029-01-01",
        phone: document.getElementById("staff-phone").value,
        shift: document.getElementById("staff-shift").value,
        isAadhaarVerified: document.getElementById("staff-aadhaar").checked,
        status: "Active"
      };

      store.staff.push(newStaff);
      this.saveStores();
      this.closeModal();
      this.renderCurrentView();
      this.showToast(`Enrolled ${newStaff.name} to store staff roster`, "success");
    };
  }

  openAddSalesModal() {
    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal || !title || !body) return;

    title.innerHTML = `<i class="fa fa-calculator text-amber-600"></i> Record Daily Sales Entry`;
    body.innerHTML = `
      <form id="form-add-sales" class="space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Today's Gross Sales (₹) *</label>
            <input type="number" id="sale-gross" required min="100" placeholder="e.g. 42500" class="w-full px-3 py-2 border rounded-lg text-sm font-bold" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Digital Collection (UPI/Cards ₹)</label>
            <input type="number" id="sale-digital" required min="0" placeholder="e.g. 28000" class="w-full px-3 py-2 border rounded-lg text-sm font-bold text-teal-700" />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Daily Invoices Count</label>
          <input type="number" id="sale-invoices" value="48" class="w-full px-3 py-2 border rounded-lg" />
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onclick="window.acsApp.closeModal()" class="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-[#135c7e] text-white rounded-lg font-semibold">Post to Ledger</button>
        </div>
      </form>
    `;

    modal.classList.remove("hidden");

    document.getElementById("form-add-sales").onsubmit = (e) => {
      e.preventDefault();
      const store = this.getCurrentStore();
      const gross = parseFloat(document.getElementById("sale-gross").value) || 0;
      const digital = parseFloat(document.getElementById("sale-digital").value) || 0;

      store.revenueData.todaySales = gross;
      store.revenueData.monthlyGross += gross;
      this.saveStores();
      this.closeModal();
      this.renderCurrentView();
      this.showToast(`Recorded daily sales: ₹ ${gross.toLocaleString('en-IN')}`, "success");
    };
  }

  openStoreCertificateModal(storeId) {
    const store = (storeId ? this.stores.find((s) => s.id === storeId) : null) || this.getCurrentStore();
    if (!store) return;

    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal || !title || !body) return;

    const chief = store.staff.find((st) => st.isOnDuty && st.uppcRegNo && st.uppcRegNo.startsWith("UPPC")) ||
      store.staff.find((st) => st.role.includes("Chief") || (st.uppcRegNo && st.uppcRegNo.startsWith("UPPC"))) ||
      store.staff[0];

    const liveUrl = `${window.location.origin}/pharmacy/${store.slug}`;
    const qrSvg = this.generateQrSvg(liveUrl, 150);

    title.innerHTML = `<i class="fa fa-certificate text-amber-500"></i> Official UP FSDA & UPPC Statutory Pharmacy Certificate`;
    body.innerHTML = `
      <div class="space-y-6">
        <!-- Certificate Frame Parchment -->
        <div class="certificate-frame bg-white relative overflow-hidden select-none">
          <div class="tricolor-strip absolute top-0 left-0 right-0"></div>

          <!-- Certificate Watermark Subtle -->
          <div class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <i class="fa fa-plus-square text-[260px] text-[#135c7e]"></i>
          </div>

          <!-- Certificate Header -->
          <div class="text-center space-y-1 relative z-10">
            <span class="text-xs font-black uppercase tracking-widest text-[#135c7e] block">
              Government of Uttar Pradesh • Food Safety and Drug Administration
            </span>
            <span class="text-[11px] font-bold text-slate-600 block">
              उत्तर प्रदेश शासन • औषधि प्रशासन एवं उत्तर प्रदेश फार्मेसी काउंसिल (UPPC)
            </span>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase pt-2">
              Certificate of Statutory Retail Pharmacy Registration
            </h2>
            <div class="inline-block bg-teal-50 border border-teal-200 px-3 py-1 rounded-full text-xs font-mono font-bold text-[#135c7e] mt-1">
              Certificate Reg No: UP/FSDA/REG/2026/${store.id.toUpperCase()}
            </div>
          </div>

          <!-- Certificate Body Text -->
          <div class="mt-6 pt-5 border-t-2 border-slate-200 text-xs text-slate-700 space-y-4 relative z-10 leading-relaxed">
            <p class="text-center font-medium">
              This is to certify that the retail pharmaceutical establishment detailed below has been formally inspected, registered, and authorized to stock, vend, and dispense prescription and scheduled drugs under <strong>Rule 61 of the Drugs and Cosmetics Rules, 1945</strong> and <strong>Section 42 of the Pharmacy Act, 1948</strong>.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans">
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Registered Pharmacy Name:</span>
                <strong class="text-sm font-black text-slate-900 block">${store.name}</strong>
                <span class="text-slate-600 text-[11px] block mt-1">${store.address}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Proprietor / Authorized Firm:</span>
                <strong class="text-sm font-bold text-slate-900 block">${store.ownerName}</strong>
                <span class="font-mono text-slate-600 text-[11px] block mt-1">GSTIN: ${store.gstin}</span>
              </div>
              <div class="pt-2 border-t border-slate-200">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Retail Drug License (Form 20):</span>
                <strong class="font-mono text-xs text-[#135c7e]">${store.license20}</strong>
              </div>
              <div class="pt-2 border-t border-slate-200">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Biological Drug License (Form 21):</span>
                <strong class="font-mono text-xs text-purple-700">${store.license21}</strong>
              </div>
            </div>

            <!-- Pharmacist On Record -->
            <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-4">
              <div>
                <span class="text-teal-900 text-[11px] font-bold block uppercase tracking-wide">Statutory Registered Pharmacist on Record:</span>
                <strong class="text-sm font-black text-[#135c7e]">${chief ? chief.name : 'Qualified Pharmacist'} (${chief ? chief.qualification : 'B.Pharm'})</strong>
                <span class="font-mono text-xs text-slate-600 block">UPPC Reg ID: ${chief ? chief.uppcRegNo : 'UPPC-PH-Verified'} • Aadhaar Biometric Linked</span>
              </div>
              <div class="text-right flex-shrink-0">
                <span class="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded">Active Status</span>
              </div>
            </div>

            <!-- QR Verification & Digital Signatures -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center pt-4 border-t border-slate-200">
              <div class="flex flex-col items-center text-center">
                <div class="certificate-seal">
                  FSDA & UPPC<br/>OFFICIAL<br/>SEAL
                </div>
                <span class="text-[10px] text-slate-400 mt-1">State Drug Directorate</span>
              </div>

              <div class="flex flex-col items-center text-center">
                ${qrSvg}
                <span class="text-[10px] font-mono text-slate-500 mt-1.5 flex items-center gap-1">
                  <i class="fa fa-qrcode"></i> Scan for Live Webpage
                </span>
                <button onclick="window.acsApp.copyStoreLink('/pharmacy/${store.slug}')" class="text-[11px] text-[#135c7e] hover:underline font-bold mt-0.5">
                  Copy Webpage Link
                </button>
              </div>

              <div class="text-center sm:text-right space-y-1">
                <div class="h-10 border-b border-slate-400 flex items-end justify-center sm:justify-end pb-1 font-serif italic text-slate-700 text-sm">
                  Dr. Alok Srivastava
                </div>
                <strong class="block text-[11px] text-slate-800">State Drug Regulatory Officer & Registrar</strong>
                <span class="block text-[10px] text-slate-500">Uttar Pradesh Pharmacy Council Bhavan, Lucknow</span>
                <span class="block text-[10px] font-mono text-emerald-700 font-bold">Digital Timestamp: 2026-10-07</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div class="text-xs text-slate-500 flex items-center gap-1.5">
            <i class="fa fa-lock text-amber-500"></i> Digitally secured and verified under UP FSDA Central Directory.
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow">
              <i class="fa fa-print"></i> Print Official Certificate
            </button>
            <button onclick="window.acsApp.closeModal(); window.acsApp.viewHostedWebsite('${store.id}')" class="px-4 py-2 bg-[#135c7e] hover:bg-[#0f4b67] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow">
              <i class="fa fa-globe"></i> Open Storefront Webpage
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  openPosDispensingModal(storeId) {
    const store = (storeId ? this.stores.find((s) => s.id === storeId) : null) || this.getCurrentStore();
    if (!store) return;

    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal || !title || !body) return;

    const chief = store.staff.find((st) => st.isOnDuty && st.uppcRegNo && st.uppcRegNo.startsWith("UPPC")) ||
      store.staff.find((st) => st.role.includes("Chief") || (st.uppcRegNo && st.uppcRegNo.startsWith("UPPC"))) ||
      store.staff[0];

    const inStockMeds = store.stocks.filter((m) => m.quantity > 0);
    const selectedMed = inStockMeds[0] || store.stocks[0];

    title.innerHTML = `<i class="fa fa-calculator text-[#135c7e]"></i> Prescription Dispensing POS & Digital Cash Memo Generator`;
    body.innerHTML = `
      <form id="form-pos-dispense" class="space-y-4 text-xs">
        <!-- Top Store Notice -->
        <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-teal-950">
          <div>
            <strong class="block text-sm text-[#135c7e]">${store.name}</strong>
            <span class="text-[11px] text-slate-600 font-mono">Form 20: ${store.license20} | GSTIN: ${store.gstin}</span>
          </div>
          <div class="text-right text-[11px]">
            <span class="text-slate-500">Pharmacist on Duty:</span>
            <strong class="block font-bold text-slate-800">${chief ? chief.name : 'Qualified Pharmacist'}</strong>
          </div>
        </div>

        <!-- Doctor Details -->
        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
          <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
            <i class="fa fa-user-md text-blue-600"></i> Prescribing Doctor Details (Schedule H Requirement)
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Doctor Full Name *</label>
              <input type="text" id="pos-doc-name" value="Dr. R. K. Mishra, MBBS, MD" required class="w-full px-3 py-2 border rounded-lg bg-white" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">MCI / SMC Reg Number *</label>
              <input type="text" id="pos-doc-reg" value="MCI-UP-48192" required class="w-full px-3 py-2 border rounded-lg bg-white font-mono uppercase" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Clinic / Hospital *</label>
              <input type="text" id="pos-doc-clinic" value="District Civil Hospital" required class="w-full px-3 py-2 border rounded-lg bg-white" />
            </div>
          </div>
        </div>

        <!-- Patient Details -->
        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
          <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
            <i class="fa fa-user text-emerald-600"></i> Patient Identification
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Patient Name *</label>
              <input type="text" id="pos-patient-name" value="Satish Chandra Verma" required class="w-full px-3 py-2 border rounded-lg bg-white" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Age & Gender *</label>
              <input type="text" id="pos-patient-age" value="48 Yrs / Male" required class="w-full px-3 py-2 border rounded-lg bg-white" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Prescription Slip Rx ID *</label>
              <input type="text" id="pos-rx-id" value="RX-UP-2026-${Math.floor(1000 + Math.random() * 9000)}" required class="w-full px-3 py-2 border rounded-lg bg-white font-mono uppercase" />
            </div>
          </div>
        </div>

        <!-- Medicine Item Selection -->
        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
          <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
            <i class="fa fa-medkit text-amber-600"></i> Medicine & Batch to Dispense
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block font-semibold text-slate-700 mb-1">Select Medicine SKU *</label>
              <select id="pos-med-select" class="w-full px-3 py-2 border rounded-lg bg-white font-medium text-slate-800">
                ${inStockMeds.map((m) => `
                  <option value="${m.id}" data-mrp="${m.mrp}" data-qty="${m.quantity}" data-schedule="${m.schedule}" data-batch="${m.batchNo}">
                    ${m.name} [${m.schedule}] - MRP: ₹${m.mrp.toFixed(2)} (Available: ${m.quantity} ${m.unit})
                  </option>
                `).join("")}
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Dispensing Quantity *</label>
              <input type="number" id="pos-dispense-qty" min="1" max="100" value="2" required class="w-full px-3 py-2 border rounded-lg bg-white font-bold text-sm" />
            </div>
          </div>

          <!-- Real-Time POS Calculation Card -->
          <div id="pos-calc-card" class="mt-3 p-3 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span class="text-slate-400 text-[10px] uppercase font-bold block">Rate Per Unit:</span>
              <strong id="pos-dispense-rate" class="text-sm font-bold text-slate-800">₹ ${(selectedMed ? selectedMed.mrp : 0).toFixed(2)}</strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px] uppercase font-bold block">Tax (CGST 6% + SGST 6%):</span>
              <strong id="pos-dispense-tax" class="text-sm font-bold text-slate-800">₹ ${((selectedMed ? selectedMed.mrp * 2 : 0) * 0.12).toFixed(2)}</strong>
            </div>
            <div>
              <span class="text-emerald-700 text-[10px] uppercase font-black block">Net Total Payable:</span>
              <strong id="pos-dispense-total" class="text-xl font-black text-emerald-700">₹ ${((selectedMed ? selectedMed.mrp * 2 : 0) * 1.12).toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div class="pt-2 flex items-center justify-between">
          <div class="text-[11px] text-slate-500">
            <i class="fa fa-info-circle text-[#135c7e]"></i> Stock quantity will be decremented and logged to the central ledger upon dispensing.
          </div>
          <div class="flex items-center gap-2">
            <button type="button" onclick="window.acsApp.closeModal()" class="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow transition flex items-center gap-2">
              <i class="fa fa-check-circle"></i> Dispense & Print Cash Memo
            </button>
          </div>
        </div>
      </form>
    `;

    modal.classList.remove("hidden");

    // Live update POS calculation
    const medSelect = document.getElementById("pos-med-select");
    const qtyInput = document.getElementById("pos-dispense-qty");
    const rateEl = document.getElementById("pos-dispense-rate");
    const taxEl = document.getElementById("pos-dispense-tax");
    const totalEl = document.getElementById("pos-dispense-total");

    const updateCalc = () => {
      if (!medSelect || !qtyInput) return;
      const opt = medSelect.options[medSelect.selectedIndex];
      if (!opt) return;
      const mrp = parseFloat(opt.getAttribute("data-mrp")) || 0;
      const qty = parseInt(qtyInput.value) || 1;
      const sub = mrp * qty;
      const tax = sub * 0.12;
      const total = sub + tax;

      if (rateEl) rateEl.textContent = `₹ ${mrp.toFixed(2)}`;
      if (taxEl) taxEl.textContent = `₹ ${tax.toFixed(2)}`;
      if (totalEl) totalEl.textContent = `₹ ${total.toFixed(2)}`;
    };

    if (medSelect) medSelect.addEventListener("change", updateCalc);
    if (qtyInput) qtyInput.addEventListener("input", updateCalc);

    // Form submit handler
    const form = document.getElementById("form-pos-dispense");
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        this.handlePosDispense(store);
      };
    }
  }

  handlePosDispense(store) {
    const medSelect = document.getElementById("pos-med-select");
    const qtyInput = document.getElementById("pos-dispense-qty");
    const docName = document.getElementById("pos-doc-name").value;
    const docReg = document.getElementById("pos-doc-reg").value;
    const patientName = document.getElementById("pos-patient-name").value;
    const patientAge = document.getElementById("pos-patient-age").value;
    const rxId = document.getElementById("pos-rx-id").value;

    const medId = medSelect.value;
    const qty = parseInt(qtyInput.value) || 1;

    const med = store.stocks.find((m) => m.id === medId);
    if (!med) return;

    if (med.quantity < qty) {
      this.showToast(`Insufficient stock! Available: ${med.quantity} ${med.unit}`, "warning");
      return;
    }

    // Decrement stock in database
    med.quantity -= qty;

    // Increment revenue
    const subtotal = med.mrp * qty;
    const tax = subtotal * 0.12;
    const totalBill = subtotal + tax;

    store.revenueData.todaySales += totalBill;
    store.revenueData.monthlyGross += totalBill;
    store.revenueData.totalOrdersThisMonth += 1;

    this.saveStores();

    // Show Printable Cash Memo in modal
    const chief = store.staff.find((st) => st.isOnDuty && st.uppcRegNo && st.uppcRegNo.startsWith("UPPC")) ||
      store.staff.find((st) => st.role.includes("Chief") || (st.uppcRegNo && st.uppcRegNo.startsWith("UPPC"))) ||
      store.staff[0];

    const invoiceNo = `INV-UP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const billDate = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

    const body = document.getElementById("modal-generic-body");
    const title = document.getElementById("modal-generic-title");
    if (title) title.innerHTML = `<i class="fa fa-check-circle text-emerald-600"></i> Dispensed Successfully • Official Cash Memo`;

    if (body) {
      body.innerHTML = `
        <div class="space-y-6">
          <div class="receipt-paper p-6 text-slate-800 text-xs select-none">
            <!-- Memo Header -->
            <div class="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
              <h2 class="text-base font-black uppercase text-slate-900">${store.name}</h2>
              <p class="text-[11px] text-slate-600">${store.address}</p>
              <div class="font-mono text-[10px] text-slate-500">
                Form 20 Lic: ${store.license20} | Form 21: ${store.license21} | GSTIN: ${store.gstin}
              </div>
              <div class="inline-block bg-slate-900 text-white font-bold px-3 py-0.5 rounded text-[10px] uppercase tracking-wider mt-1">
                RETAIL TAX INVOICE / CASH MEMO
              </div>
            </div>

            <!-- Invoice & Patient Meta -->
            <div class="grid grid-cols-2 gap-2 py-3 border-b border-dashed border-slate-300 text-[11px] font-mono">
              <div>
                <span class="text-slate-500">Bill No:</span> <strong>${invoiceNo}</strong><br/>
                <span class="text-slate-500">Date:</span> ${billDate}<br/>
                <span class="text-slate-500">Rx ID:</span> ${rxId}
              </div>
              <div class="text-right">
                <span class="text-slate-500">Patient:</span> <strong>${patientName}</strong> (${patientAge})<br/>
                <span class="text-slate-500">Doctor:</span> ${docName}<br/>
                <span class="text-slate-500">MCI Reg:</span> ${docReg}
              </div>
            </div>

            <!-- Itemized Table -->
            <div class="py-3 border-b border-dashed border-slate-300">
              <table class="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr class="border-b border-slate-300 text-slate-500 uppercase text-[10px]">
                    <th class="py-1">Item Description</th>
                    <th class="py-1">Batch</th>
                    <th class="py-1">Exp</th>
                    <th class="py-1 text-center">Qty</th>
                    <th class="py-1 text-right">MRP</th>
                    <th class="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="py-2">
                      <strong class="text-slate-900">${med.name}</strong><br/>
                      <span class="text-[9px] text-slate-500">${med.saltName}</span>
                    </td>
                    <td class="py-2">${med.batchNo}</td>
                    <td class="py-2">${med.expiryDate}</td>
                    <td class="py-2 text-center font-bold">${qty}</td>
                    <td class="py-2 text-right">₹${med.mrp.toFixed(2)}</td>
                    <td class="py-2 text-right font-bold">₹${subtotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Totals -->
            <div class="py-3 border-b border-dashed border-slate-300 space-y-1 font-mono text-xs">
              <div class="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹ ${subtotal.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>CGST (6%):</span>
                <span>₹ ${(tax / 2).toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>SGST (6%):</span>
                <span>₹ ${(tax / 2).toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
                <span>NET AMOUNT RECEIVED:</span>
                <span>₹ ${totalBill.toFixed(2)}</span>
              </div>
            </div>

            <!-- Pharmacist Signature & Schedule Notice -->
            <div class="pt-4 flex items-end justify-between text-[10px] text-slate-600">
              <div class="max-w-[60%]">
                <p><strong>Section 42 Pharmacy Act Compliance:</strong></p>
                <p>Prescription retained and dispensed under direct personal supervision of UPPC Registered Pharmacist.</p>
              </div>
              <div class="text-center space-y-1 font-mono">
                <div class="h-8 border-b border-slate-400 flex items-end justify-center pb-1 text-[11px] font-bold text-slate-800">
                  ${chief ? chief.name : 'Authorized Pharmacist'}
                </div>
                <span>Reg: ${chief ? chief.uppcRegNo : 'UPPC-PH-Verified'}</span>
              </div>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="flex items-center justify-between pt-2">
            <span class="text-xs text-emerald-700 font-bold">
              <i class="fa fa-check"></i> Stock updated: ${med.quantity} ${med.unit} remaining.
            </span>
            <div class="flex items-center gap-2">
              <button onclick="window.print()" class="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow">
                <i class="fa fa-print"></i> Print Cash Memo
              </button>
              <button onclick="window.acsApp.closeModal(); window.acsApp.renderCurrentView()" class="px-4 py-2 bg-[#135c7e] hover:bg-[#0f4b67] text-white font-bold rounded-xl text-xs transition">
                Done
              </button>
            </div>
          </div>
        </div>
      `;
    }

    this.renderCurrentView();
    this.showToast(`Dispensed ${qty} units of ${med.name}. Stock decremented to ${med.quantity}.`, "success");
  }

  toggleStaffDuty(staffId) {
    const store = this.getCurrentStore();
    if (!store) return;

    const staff = store.staff.find((s) => s.id === staffId);
    if (!staff) return;

    staff.isOnDuty = !staff.isOnDuty;
    if (staff.isOnDuty) {
      staff.dutyCheckInTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      // Set others to off-duty so there is a clear active incharge
      store.staff.forEach((s) => {
        if (s.id !== staffId) s.isOnDuty = false;
      });
    }

    this.saveStores();
    this.renderCurrentView();
    this.showToast(
      `${staff.name} is now ${staff.isOnDuty ? "Present On Duty (Statutory Incharge)" : "Off Duty"}.`,
      "success"
    );
  }

  openReorderPoModal() {
    const store = this.getCurrentStore();
    if (!store) return;

    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal || !title || !body) return;

    // Items needing reorder: low stock or first 4 items for demo
    let lowStockItems = store.stocks.filter((m) => m.quantity <= (m.minAlertThreshold || 20));
    if (lowStockItems.length === 0) {
      lowStockItems = store.stocks.slice(0, 3);
    }

    const totalPoCost = lowStockItems.reduce((acc, curr) => acc + (50 * curr.purchaseRate), 0);
    const poNumber = `PO-UP-${store.district.substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const poDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    title.innerHTML = `<i class="fa fa-file-text-o text-indigo-600"></i> Supplier Purchase Order (PO) Requisition Draft`;
    body.innerHTML = `
      <div class="space-y-6 text-xs">
        <div class="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-indigo-950">
          <div>
            <strong class="text-sm font-black block">Automated Inventory Replenishment PO</strong>
            <span class="text-slate-600 text-xs">Calculated based on safety threshold minimums (&le; 20 units) and seasonal turnover.</span>
          </div>
          <div class="font-mono text-right text-xs">
            <span class="text-slate-500">PO Number:</span> <strong class="text-indigo-900">${poNumber}</strong><br/>
            <span class="text-slate-500">Date:</span> ${poDate}
          </div>
        </div>

        <!-- PO Destination / Vendor Header -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Consignee Pharmacy:</span>
            <strong class="text-slate-900 block font-bold">${store.name}</strong>
            <span class="text-slate-600 block text-[11px]">${store.address}</span>
            <span class="font-mono text-[10px] text-slate-500 block">Lic: ${store.license20} | GSTIN: ${store.gstin}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Authorized Wholesale Vendor / Depot:</span>
            <strong class="text-slate-900 block font-bold">Uttar Pradesh Pharma C&F Syndicate Depot</strong>
            <span class="text-slate-600 block text-[11px]">Central Drug Logistics Warehouse, Transport Nagar, Lucknow</span>
            <span class="font-mono text-[10px] text-slate-500 block">GSTIN: 09AAACU9182K1ZN</span>
          </div>
        </div>

        <!-- Itemized Reorder Table -->
        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <th class="py-2.5 px-3">Medicine Description</th>
                <th class="py-2.5 px-3">Current Qty</th>
                <th class="py-2.5 px-3">Reorder Qty</th>
                <th class="py-2.5 px-3 text-right">Wholesale Rate</th>
                <th class="py-2.5 px-3 text-right">Total Est. Cost</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-mono text-[11px]">
              ${lowStockItems.map((m) => {
                const reorderQty = 50;
                const cost = reorderQty * m.purchaseRate;
                return `
                  <tr>
                    <td class="py-2.5 px-3 font-sans">
                      <strong class="text-slate-900 block">${m.name}</strong>
                      <span class="text-[10px] text-slate-500">${m.saltName} [${m.schedule}]</span>
                    </td>
                    <td class="py-2.5 px-3 text-rose-600 font-bold">${m.quantity} ${m.unit}</td>
                    <td class="py-2.5 px-3 text-indigo-700 font-bold">+${reorderQty} ${m.unit}</td>
                    <td class="py-2.5 px-3 text-right">₹ ${m.purchaseRate.toFixed(2)}</td>
                    <td class="py-2.5 px-3 text-right font-bold text-slate-900">₹ ${cost.toFixed(2)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
            <tfoot>
              <tr class="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                <td colspan="4" class="py-2.5 px-3 text-right font-sans">TOTAL ESTIMATED PURCHASE REQUISITION:</td>
                <td class="py-2.5 px-3 text-right font-mono text-sm text-indigo-900">₹ ${totalPoCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div class="text-[11px] text-slate-500">
            <i class="fa fa-truck text-emerald-600"></i> Standard wholesale delivery lead time: 24 - 48 Hours.
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center gap-1.5">
              <i class="fa fa-print"></i> Print PO Requisition
            </button>
            <button onclick="window.acsApp.handlePoRestock()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow">
              <i class="fa fa-check-circle"></i> Simulate Stock Delivery & Restock (+50 Units)
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  handlePoRestock() {
    const store = this.getCurrentStore();
    if (!store) return;

    let lowStockItems = store.stocks.filter((m) => m.quantity <= (m.minAlertThreshold || 20));
    if (lowStockItems.length === 0) {
      lowStockItems = store.stocks.slice(0, 3);
    }

    lowStockItems.forEach((m) => {
      m.quantity += 50;
    });

    this.saveStores();
    this.closeModal();
    this.renderCurrentView();
    this.showToast(`Restocked ${lowStockItems.length} items with +50 units each! Database updated in real time.`, "success");
  }

  openBulkPriceModal() {
    const store = this.getCurrentStore();
    if (!store) return;

    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal || !title || !body) return;

    title.innerHTML = `<i class="fa fa-calculator text-amber-500"></i> Bulk Selling Price (MRP) Calculator`;
    body.innerHTML = `
      <form id="form-bulk-price" class="space-y-4 text-xs">
        <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-950">
          <strong class="block text-sm">Automated Wholesale to Retail Pricing</strong>
          <span class="text-xs text-slate-600">Calculate official selling prices (MRP) across your catalog using standard buying cost multipliers.</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Selling Price Multiplier *</label>
            <select id="bulk-price-factor" class="w-full px-3 py-2 border rounded-lg bg-white font-bold text-sm">
              <option value="1.15">1.15x Buying Cost (Standard Wholesale)</option>
              <option value="1.20">1.20x Buying Cost (Competitive Retail)</option>
              <option value="1.25" selected>1.25x Buying Cost (Standard Retail)</option>
              <option value="1.30">1.30x Buying Cost (Institutional / Remote)</option>
              <option value="1.35">1.35x Buying Cost (Specialty Formulation)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Target Medicine Category *</label>
            <select id="bulk-price-schedule" class="w-full px-3 py-2 border rounded-lg bg-white font-medium">
              <option value="ALL">All Medicines in Stock (${store.stocks.length} SKUs)</option>
              <option value="OTC">OTC / General Only</option>
              <option value="Schedule H">Schedule H (Prescription)</option>
            </select>
          </div>
        </div>

        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-slate-600">
          <strong class="text-slate-800 text-xs block">Pricing Formula Applied:</strong>
          <p class="font-mono text-[11px] text-teal-800">Selling Price (MRP) = Buying Cost (CP) × Selected Multiplier</p>
          <p class="text-[11px]">Complies with NPPA drug pricing guidelines and UP retail pharmacy standards.</p>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button type="button" onclick="window.acsApp.closeModal()" class="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-[#135c7e] hover:bg-[#0f4b67] text-white font-bold rounded-lg shadow transition">
            Apply Selling Prices Across Stock
          </button>
        </div>
      </form>
    `;

    modal.classList.remove("hidden");

    document.getElementById("form-bulk-price").onsubmit = (e) => {
      e.preventDefault();
      const factor = parseFloat(document.getElementById("bulk-price-factor").value) || 1.25;
      const sched = document.getElementById("bulk-price-schedule").value;
      this.applyBulkPrice(factor, sched);
    };
  }

  openBulkMarginModal() {
    this.openBulkPriceModal();
  }

  applyBulkPrice(multiplier, targetSchedule) {
    const store = this.getCurrentStore();
    if (!store) return;

    let count = 0;
    store.stocks.forEach((m) => {
      if (targetSchedule === "ALL" || m.schedule.includes(targetSchedule)) {
        const newMrp = Math.round(m.purchaseRate * multiplier * 10) / 10;
        m.mrp = Math.max(m.purchaseRate + 2, newMrp);
        count++;
      }
    });

    this.saveStores();
    this.closeModal();
    this.renderCurrentView();
    this.showToast(`Updated selling prices across ${count} medicines based on ${multiplier}x buying cost!`, "success");
  }

  applyBulkMargin(marginPercent, targetSchedule) {
    this.applyBulkPrice(1 + (marginPercent / 100), targetSchedule);
  }

  closeModal() {
    const modal = document.getElementById("modal-generic");
    if (modal) modal.classList.add("hidden");
  }

  resetToDefaultData() {
    if (confirm("Reset all pharmacies, stock, staff, and financial data back to official initial sample state?")) {
      localStorage.removeItem("ACS_STORES_DATA_V1");
      localStorage.removeItem("ACS_USER_SESSION_V1");
      this.stores = JSON.parse(JSON.stringify(INITIAL_STORES_DATA));
      this.currentStoreId = this.stores[0].id;
      this.currentUser = null;
      this.activeTab = "landing";
      this.saveStores();
      this.renderHeaderBar();
      this.renderCurrentView();
      this.showToast("Database reset to initial sample state!", "info");
    }
  }

  setupEventListeners() {
    // Cross-tab reactive synchronization
    window.addEventListener("storage", (e) => {
      if (e.key === "ACS_STORES_DATA_V1") {
        this.loadStores();
        this.renderCurrentView();
      }
    });

    // Header navigation clicks
    document.querySelectorAll(".nav-item-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });

    // Header store selector change
    const selector = document.getElementById("header-store-select");
    if (selector) {
      selector.addEventListener("change", (e) => {
        this.switchStore(e.target.value);
      });
    }

    // Modal background close
    const modal = document.getElementById("modal-generic");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.closeModal();
      });
    }
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  window.acsApp = new ACSApp();
});
