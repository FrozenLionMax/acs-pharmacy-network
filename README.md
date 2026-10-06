# ACS - All Chemists & Stores Registry
### Uttar Pradesh Pharmacy & Medicine Inventory Central Portal
Inspired by the **Uttar Pradesh Pharmacy Council (UPPC)** design aesthetics (`#135c7e`, `#2c5895`, and warm gold `#f5a623`) and state statutory compliance standards.

---

## 🌟 Key Features & Capabilities

1. **Multi-Store Hosting & Public Directory:**
   - Host profiles for various pharmacy store owners across UP districts (Lucknow, Varanasi, Kanpur, Gautam Buddha Nagar / Noida, etc.).
   - Full store data: Front storefront photos, street address, Form 20/21 drug licenses, GSTIN, operating hours (with 24x7 emergency badges), and owner contact info.
   - Live district filters and search engine.
   - 1-click **"Host New Pharmacy"** onboarding workflow.

2. **Registered Pharmacist & Staff Vault:**
   - Compliant with Section 42 of the Pharmacy Act, 1948.
   - Staff profiles with verified **UPPC Registration Numbers** (e.g. `UPPC-PH-41290`), qualification (B.Pharm, D.Pharm, Pharm.D), validity expiry dates, assigned shift timings, and Aadhaar-link verification status.
   - Add/Remove staff members with instant validation.

3. **Medicine Stock & Batch Inventory Register:**
   - Real-time stock registry tracking brand names, generic salt/chemical compositions, manufacturers, batch numbers, and expiry dates.
   - Statutory schedule tagging: **Schedule H**, **Schedule H1** (high-alert antibiotic warning badges), **OTC**, and **Schedule X**.
   - Dynamic threshold alerts for low stock levels and items expiring within 90 days.
   - Interactive quantity counter (`+` / `-`).
   - **Export to CSV** and **Bulk CSV Import** with automatic header parsing.

4. **Financial Ledger & Revenue Intelligence:**
   - Gross turnover tracking: Daily sales counter, monthly totals, and historical 6-month turnover trends.
   - Breakdown of Digital modes (UPI, QR, POS Cards) vs. Cash counter transactions.
   - Estimated Gross Margin % and Pharma GST liability calculations.
   - **Interactive Charts (Chart.js)**: Monthly growth stacked bar chart and payment channel doughnut distribution.
   - **Privacy Mode (Eye Toggle)**: Obscures sensitive revenue figures with blur filters when in public view, easily toggled by the owner.
   - Daily sales entry modal to post sales into the ledger.

5. **Statutory UPPC License & Reg Number Verifier:**
   - Dedicated lookup tool to verify any Pharmacist UPPC ID or Form 20/21 Drug License against the portal records with authentic verification badges.

6. **Inspection Dossier Print Format:**
   - Ready for official drug inspection visits: click "Print Inspection Dossier" for a clean, paper-formatted store compliance sheet.

---

## 🚀 How to Run the Website

### Method 1: Using Python (Recommended)
Open a terminal in this folder and run:
```bash
python server.py
```
This automatically starts the server at `http://localhost:8000/index.html` and opens your default browser.

### Method 2: Direct Browser Opening
Simply double-click [`index.html`](file:///c:/Users/Acer/Desktop/medical%20data/index.html) in Windows File Explorer or open it in Google Chrome, Microsoft Edge, or Mozilla Firefox. No installation required.

---

## 🎨 Design Philosophy
* **Colors:** UPPC Official Teal (`#135c7e`), Council Blue (`#2c5895`), Alert Gold (`#f5a623`), Canvas Soft Gray (`#f4f7fa`).
* **Storage:** Data is reactively stored in your browser's `localStorage` so changes persist across refreshes. A "Reset Sample Pharmacy Database" button is provided in the footer if you ever want to reload the default UP stores.
