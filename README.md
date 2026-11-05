# ACS (All Chemists & Stores) — Uttar Pradesh Pharmacy Network

ACS is a specialized pharmacy compliance, statutory registry, and real-time inventory management platform tailored for licensed retail chemists and drug stores operating across Uttar Pradesh (UP), India.

The platform provides regulatory compliance monitoring under Section 42 of the Pharmacy Act, 1948, Form 20 & 21 drug license management, Schedule H/H1 registers, biometric staff duty logs, point-of-sale dispensing, and public medicine availability search engines.

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                            Client Interfaces (PWA / Web)                          |
+-----------------------------------------------------------------------------------+
|  1. Public UP Pharmacy Registry (/pharmacy, /)                                    |
|  2. Pre-rendered SEO Storefronts (/pharmacy/[slug], /[slug])                       |
|  3. Pharmacy Owner Portal (Inventory, Billing/POS, Staff, Statutory Registers)   |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                            Application Logic Layer (app.js)                       |
+-----------------------------------------------------------------------------------+
|  - Router & Route Dispatcher (SPA + SSG Hydration)                                |
|  - State Manager & Local Storage Persistence Layer (ACS_STORES_DATA_V2)           |
|  - Bidirectional Real-Time Multi-Device Sync Engine (6s Polling & Push-on-Edit)   |
|  - Prescription OCR Parser & Inventory Auto-Matcher                               |
|  - Statutory Dossier Print Engine & Schema.org Knowledge Graph Generator          |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                            Persistence & Cloud Sync Layer                         |
+-----------------------------------------------------------------------------------+
|  - Local Storage (Immediate offline persistence)                                  |
|  - Vercel Serverless Sync Proxy (/api/stores)                                     |
|  - Cloud JSON Synchronization Endpoint (SuperJSONBlob Master Store)               |
+-----------------------------------------------------------------------------------+
```

---

## Core Capabilities

### 1. Statutory Compliance & Regulatory Registers
- **Form 20 & 21 License Management**: Maintains active drug licenses, valid renewal horizons, and statutory inspection dossiers.
- **UPPC Registered Pharmacist Verification**: Tracks Uttar Pradesh Pharmacy Council (UPPC) registration numbers, qualifications (B.Pharm, D.Pharm, Pharm.D), and biometric duty logs.
- **Schedule H & H1 Registers**: Dedicated tracking of restricted drugs, prescribing physician details, patient records, and dispensing batch numbers.

### 2. Live Inventory & POS Dispensing
- **Medicine SKU Catalog**: Brand name, generic/salt formulation, manufacturer, batch number, MRP, cost price, and shelf rack locations.
- **Expiry Horizon & Low Stock Warnings**: Categorizes inventory into safe, expiring (<90 days), and depleted items.
- **Dispensing Workflow**: Prescription receipt matching, barcode lookup, invoice generation, and real-time batch deductions.

### 3. Public Storefronts & SEO Infrastructure
- **SSG Pre-rendering**: Pre-compiled static HTML pages for all enrolled pharmacies ensuring instant load times and Google crawlability.
- **Structured Data**: Schema.org `Pharmacy` and `MedicalBusiness` Knowledge Graphs (`@graph`) for Google Rich Results.
- **Automated Google Indexing**: Direct integration with Google Indexing API (`indexing.googleapis.com`) and IndexNow for real-time URL push on build.

---

## Project Structure

```
├── api/
│   └── stores.js               # Vercel serverless function for cloud synchronization
├── scripts/
│   ├── sync_cloud_db.js        # Script to synchronize master dataset with cloud endpoints
│   ├── create_production_blob.js # Initial cloud blob provisioning utility
│   └── enrich_logs.js          # Audit log enrichment utility
├── pharmacy/                   # Pre-rendered static SEO directory pages
├── app.js                      # Core application controller & user interface logic
├── data.js                     # Master pharmacy dataset & initial configuration
├── build_static_seo.js         # Static site generator & dynamic sitemap compiler
├── google_indexing.js          # Google Search Console Indexing API automation
├── test_app_views.js           # Comprehensive automated regression & integration test suite
├── index.html                  # Central application entry point
├── styles.css                  # Custom styling & responsive utility classes
├── vercel.json                 # Vercel deployment routing configuration
└── package.json                # Project dependencies and operational scripts
```

---

## Getting Started

### Prerequisites
- Node.js (v18.x or later)
- Python 3.x (optional, for local development server)

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/FrozenLionMax/acs-pharmacy-network.git
cd acs-pharmacy-network
npm install
```

### Development Server
Start the local development server:
```bash
npm start
```
This launches a local HTTP server at `http://localhost:8000`.

### Build & Pre-rendering
Generate static HTML SEO pages, dynamic sitemaps, and trigger search indexing:
```bash
npm run build
```

### Running Test Suite
Execute the full automated regression and end-to-end integration test suite:
```bash
npm test
```

---

## Operational Credentials

For system access within the owner portal:
- **Default Network Administrator**: `akhil@acs.com` / `akhil123`
- **Store-specific Owner Login**: Store Slug / Phone Number with store administrator password (`Pharma@8004`)

---

## License

Confidential — Internal proprietary healthcare platform for authorized Uttar Pradesh pharmacy networks.
