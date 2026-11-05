/**
 * ACS (Akhil Consultancy Services) - Core Pharmacy & Medicine Dataset
 * Uttar Pradesh Pharmacy Network Registry
 */

const INITIAL_STORES_DATA = [
  {
    "id": "store-up-001",
    "slug": "deoria-drug-house",
    "slugAliases": [
      "deoria-drug-house",
      "deoria-drug",
      "akhil-deoria",
      "sanjeevani-medicos"
    ],
    "name": "Deoria Drug House",
    "district": "Deoria",
    "city": "Deoria",
    "address": "Subhash Chowk, Station Road, Deoria, Uttar Pradesh - 274001",
    "mapsUrl": "https://maps.app.goo.gl/CKJeaQEBoWBaTEPX7",
    "phone": "+91 94152 83910",
    "whatsapp": "+919415283910",
    "email": "akhil@acs.com",
    "ownerName": "Akhileshwar Tripathi",
    "license20": "UP/DEO/2022/20/1908",
    "license21": "UP/DEO/2022/21/1909",
    "gstin": "09AABFD3912K1Z9",
    "establishedYear": "1998",
    "operatingHours": "08:00 AM - 10:30 PM (Emergency 24x7)",
    "is24x7": true,
    "status": "Verified",
    "photoUrl": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80",
    "galleryPhotos": [
      {
        "id": "gal-ddh-01",
        "url": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80",
        "title": "Main Storefront & Dispensing Counter",
        "category": "Exterior & Front"
      },
      {
        "id": "gal-ddh-02",
        "url": "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80",
        "title": "Ethical & Prescription Medicine Bays",
        "category": "Medicine Racks"
      },
      {
        "id": "gal-ddh-03",
        "url": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1200&q=80",
        "title": "Cold Chain 2-8°C Biologicals & Insulin Vault",
        "category": "Cold Storage"
      },
      {
        "id": "gal-ddh-04",
        "url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80",
        "title": "Surgical Instruments & Orthopedic Care Counter",
        "category": "Surgical & Diagnostic"
      },
      {
        "id": "gal-ddh-05",
        "url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80",
        "title": "Pharmacist Consultation & Digital Billing Desk",
        "category": "Consultation & Billing"
      }
    ],
    "rating": 4.9,
    "staff": [
      {
        "id": "st-deo-101",
        "name": "Akhileshwar Tripathi",
        "role": "Chief Pharmacist & Store Owner",
        "uppcRegNo": "UPPC-PH-29841",
        "qualification": "B.Pharm (KGMU / UP Tech Univ)",
        "regDate": "2015-05-18",
        "validUpto": "2030-05-17",
        "phone": "+91 94152 83910",
        "shift": "Morning & General (09:00 AM - 05:00 PM)",
        "isAadhaarVerified": true,
        "isOnDuty": true,
        "status": "Active"
      },
      {
        "id": "st-deo-102",
        "name": "Rajeshwar Pandey",
        "role": "Duty Pharmacist",
        "uppcRegNo": "UPPC-PH-48912",
        "qualification": "D.Pharm (Board of Technical Education UP)",
        "regDate": "2020-08-14",
        "validUpto": "2028-08-13",
        "phone": "+91 98394 55102",
        "shift": "Evening (04:00 PM - 10:30 PM)",
        "isAadhaarVerified": true,
        "isOnDuty": true,
        "status": "Active"
      },
      {
        "id": "st-deo-103",
        "name": "Vikas Kumar Shukla",
        "role": "Inventory & Billing Associate",
        "uppcRegNo": "N/A (Non-Technical)",
        "qualification": "B.Com",
        "regDate": "N/A",
        "validUpto": "N/A",
        "phone": "+91 87650 91823",
        "shift": "Full Day (09:00 AM - 08:00 PM)",
        "isAadhaarVerified": true,
        "isOnDuty": false,
        "status": "Active"
      }
    ],
    "stocks": [
      {
        "id": "med-ddh-001",
        "name": "Augmentin 625 Duo Tablet",
        "saltName": "Amoxicillin 500mg + Potassium Clavulanate 125mg",
        "manufacturer": "GlaxoSmithKline Pharmaceuticals",
        "batchNo": "BAT-AUG-9120",
        "expiryDate": "2027-08-15",
        "quantity": 120,
        "unit": "Strips (10 tabs)",
        "mrp": 223.5,
        "purchaseRate": 168,
        "freeScheme": "+1",
        "schedule": "Schedule H",
        "rackLocation": "Rack A-01",
        "minAlertThreshold": 25
      },
      {
        "id": "med-ddh-002",
        "name": "Dolo 650 Tablet",
        "saltName": "Paracetamol 650mg",
        "manufacturer": "Micro Labs Ltd",
        "batchNo": "BAT-DOL-4811",
        "expiryDate": "2028-02-10",
        "quantity": 350,
        "unit": "Strips (15 tabs)",
        "mrp": 34,
        "purchaseRate": 23.5,
        "freeScheme": "",
        "schedule": "OTC",
        "rackLocation": "Rack B-01",
        "minAlertThreshold": 50
      },
      {
        "id": "med-ddh-003",
        "name": "Pan-D Capsule",
        "saltName": "Pantoprazole 40mg + Domperidone 30mg",
        "manufacturer": "Alkem Laboratories",
        "batchNo": "BAT-PAN-7712",
        "expiryDate": "2027-11-20",
        "quantity": 180,
        "unit": "Strips (15 caps)",
        "mrp": 215,
        "purchaseRate": 155,
        "freeScheme": "",
        "schedule": "Schedule H",
        "rackLocation": "Rack C-02",
        "minAlertThreshold": 40
      },
      {
        "id": "med-ddh-004",
        "name": "Hifen 200 DT Tablet",
        "saltName": "Cefixime 200mg Dispersible Tablet",
        "manufacturer": "Aristo Pharmaceuticals",
        "batchNo": "BAT-HIF-1092",
        "expiryDate": "2027-10-15",
        "quantity": 100,
        "unit": "Strips (10 tabs)",
        "mrp": 110,
        "purchaseRate": 78.5,
        "freeScheme": "+1",
        "schedule": "Schedule H1",
        "rackLocation": "Rack A-02",
        "minAlertThreshold": 20
      },
      {
        "id": "med-ddh-005",
        "name": "Telma 40 Tablet",
        "saltName": "Telmisartan 40mg",
        "manufacturer": "Glenmark Pharmaceuticals",
        "batchNo": "BAT-TEL-5102",
        "expiryDate": "2027-09-15",
        "quantity": 160,
        "unit": "Strips (15 tabs)",
        "mrp": 198,
        "purchaseRate": 142,
        "freeScheme": "",
        "schedule": "Schedule H",
        "rackLocation": "Rack D-01",
        "minAlertThreshold": 30
      },
      {
        "id": "med-ddh-006",
        "name": "Azithral 500 Tablet",
        "saltName": "Azithromycin 500mg",
        "manufacturer": "Alembic Pharmaceuticals",
        "batchNo": "BAT-AZI-8821",
        "expiryDate": "2027-05-10",
        "quantity": 45,
        "unit": "Strips (5 tabs)",
        "mrp": 132,
        "purchaseRate": 98,
        "freeScheme": "",
        "schedule": "Schedule H1",
        "rackLocation": "Rack A-04",
        "minAlertThreshold": 20
      },
      {
        "id": "med-ddh-007",
        "name": "Liv.52 DS Syrup",
        "saltName": "Ayurvedic Herbal Liver Formulation",
        "manufacturer": "Himalaya Wellness",
        "batchNo": "BAT-LIV-9821",
        "expiryDate": "2027-12-01",
        "quantity": 75,
        "unit": "Bottles (200ml)",
        "mrp": 175,
        "purchaseRate": 125,
        "freeScheme": "+1",
        "schedule": "Ayush / OTC",
        "rackLocation": "Rack E-02",
        "minAlertThreshold": 15
      }
    ],
    "prescriptions": [
      {
        "id": "RX-DEO-2026-001",
        "patientName": "Ramakant Upadhyay",
        "phone": "+91 94151 77319",
        "notes": "Prescribed 15-day course of Augmentin 625 Duo and Pan-D by District Hospital Deoria.",
        "fileName": "Dr_Sharma_District_Hospital_Deoria.pdf",
        "fileData": "",
        "createdAt": "08 Oct 2026, 05:30 PM",
        "timestamp": 1791479400000,
        "status": "Pending",
        "storeId": "store-up-001"
      },
      {
        "id": "RX-DEO-2026-002",
        "patientName": "Savita Srivastava",
        "phone": "+91 98390 41189",
        "notes": "Montair-LC and Azithral 500 prescribed for acute bronchial congestion.",
        "fileName": "Rx_Deoria_Sadar.jpg",
        "fileData": "",
        "createdAt": "07 Oct 2026, 03:15 PM",
        "timestamp": 1791384900000,
        "status": "Dispensed",
        "storeId": "store-up-001"
      }
    ],
    "scheduleH1Register": [
      {
        "id": "H1-DEO-2026-001",
        "date": "08 Oct 2026, 04:30 PM",
        "patientName": "Manoj Kumar Mishra",
        "patientAge": "45",
        "docName": "Dr. K.N. Pandey, MD (Medicine)",
        "docReg": "UPMC-M-29180",
        "rxId": "RX-DEO-H1-8812",
        "medId": "med-ddh-005",
        "medName": "Azithral 500 Tablet",
        "saltName": "Azithromycin 500mg",
        "batchNo": "BAT-AZI-8821",
        "expiryDate": "2027-05-10",
        "schedule": "Schedule H1",
        "quantity": 2,
        "unit": "Strips (5 tabs)",
        "mrp": 132,
        "subtotal": 264,
        "tax": 31.68,
        "totalBill": 295.68,
        "pharmacistName": "Akhileshwar Tripathi",
        "pharmacistReg": "UPPC-PH-29841"
      }
    ],
    "staffDutyLog": [
      {
        "id": "DUTY-DEO-901",
        "timestamp": "08 Oct 2026, 09:00 AM",
        "staffId": "st-deo-101",
        "staffName": "Akhileshwar Tripathi",
        "uppcRegNo": "UPPC-PH-29841",
        "qualification": "B.Pharm (KGMU / UP Tech Univ)",
        "action": "CLOCK_IN",
        "method": "Aadhaar Biometric Match Verified",
        "status": "Present On Duty (Chief Incharge)"
      },
      {
        "id": "DUTY-DEO-902",
        "timestamp": "07 Oct 2026, 04:00 PM",
        "staffId": "st-deo-102",
        "staffName": "Rajeshwar Pandey",
        "uppcRegNo": "UPPC-PH-48912",
        "qualification": "D.Pharm (Board of Technical Education UP)",
        "action": "CLOCK_IN",
        "method": "Aadhaar Biometric Match Verified",
        "status": "Evening Shift Duty Verified"
      }
    ],
    "purchaseExpenses": [
      {
        "id": "PO-DEO-2026-101",
        "date": "06 Oct 2026, 11:30 AM",
        "vendor": "Eastern UP Pharma C&F Syndicate, Gorakhpur Depot",
        "itemsCount": 5,
        "unitsAdded": 320,
        "totalAmount": 42800,
        "status": "Stock Received in Rack"
      },
      {
        "id": "PO-DEO-2026-102",
        "date": "28 Sep 2026, 02:45 PM",
        "vendor": "Varanasi Central Drug Logistics Warehouse",
        "itemsCount": 7,
        "unitsAdded": 450,
        "totalAmount": 58200,
        "status": "Stock Received in Rack"
      }
    ],
    "revenueData": {
      "todaySales": 34800,
      "monthlyGross": 985000,
      "lastMonthGross": 940000,
      "avgGrossMarginPercent": 22.5,
      "totalOrdersThisMonth": 1420,
      "digitalSplitPercent": 65,
      "cashSplitPercent": 35,
      "gstCollectedMonthly": 118200,
      "transactions": [
        {
          "id": "BILL-DEO-8801",
          "date": "08 Oct 2026, 04:30 PM",
          "patientName": "Manoj Kumar Mishra",
          "patientAge": "45",
          "docName": "Dr. K.N. Pandey, MD",
          "docReg": "UPMC-M-29180",
          "rxId": "RX-DEO-H1-8812",
          "medId": "med-ddh-005",
          "medName": "Azithral 500 Tablet",
          "saltName": "Azithromycin 500mg",
          "batchNo": "BAT-AZI-8821",
          "expiryDate": "2027-05-10",
          "schedule": "Schedule H1",
          "quantity": 2,
          "unit": "Strips (5 tabs)",
          "mrp": 132,
          "subtotal": 264,
          "tax": 31.68,
          "totalBill": 295.68,
          "pharmacistName": "Akhileshwar Tripathi",
          "pharmacistReg": "UPPC-PH-29841"
        },
        {
          "id": "BILL-DEO-8802",
          "date": "08 Oct 2026, 02:15 PM",
          "patientName": "Anand Verma",
          "patientAge": "32",
          "docName": "Walk-In Patient",
          "docReg": "N/A",
          "rxId": "OTC-WALK-IN",
          "medId": "med-ddh-002",
          "medName": "Dolo 650 Tablet",
          "saltName": "Paracetamol 650mg",
          "batchNo": "BAT-DOL-4811",
          "expiryDate": "2028-02-10",
          "schedule": "OTC",
          "quantity": 2,
          "unit": "Strips (15 tabs)",
          "mrp": 34,
          "subtotal": 68,
          "tax": 8.16,
          "totalBill": 76.16,
          "pharmacistName": "Akhileshwar Tripathi",
          "pharmacistReg": "UPPC-PH-29841"
        }
      ],
      "monthlyHistory": [
        {
          "month": "May",
          "revenue": 840000,
          "digital": 540000,
          "cash": 300000
        },
        {
          "month": "Jun",
          "revenue": 890000,
          "digital": 580000,
          "cash": 310000
        },
        {
          "month": "Jul",
          "revenue": 920000,
          "digital": 600000,
          "cash": 320000
        },
        {
          "month": "Aug",
          "revenue": 960000,
          "digital": 630000,
          "cash": 330000
        },
        {
          "month": "Sep",
          "revenue": 940000,
          "digital": 610000,
          "cash": 330000
        },
        {
          "month": "Oct (Current)",
          "revenue": 985000,
          "digital": 640250,
          "cash": 344750
        }
      ],
      "paymentChannels": {
        "upi": 52,
        "cards": 13,
        "cash": 35
      }
    }
  },
  {
    "id": "store-up-002",
    "slug": "maa-vindhyavasini-medicos-deoria",
    "name": "Maa Vindhyavasini Medicos & Healthcare",
    "district": "Deoria",
    "city": "Deoria",
    "address": "Shop No. 4, CC Road, Raghav Nagar, Deoria, Uttar Pradesh - 274001",
    "mapsUrl": "https://maps.google.com/?q=Raghav+Nagar+Deoria+Uttar+Pradesh",
    "phone": "+91 94502 18940",
    "whatsapp": "+919450218940",
    "email": "vindhyavasini.medicos@gmail.com",
    "ownerName": "Pandit Satish Chandra Shukla",
    "license20": "UP/DEO/2021/20/2410",
    "license21": "UP/DEO/2021/21/2411",
    "gstin": "09AALPS4419M1ZZ",
    "establishedYear": "2014",
    "operatingHours": "08:30 AM - 10:30 PM",
    "is24x7": false,
    "isViewOnly": true,
    "status": "Verified",
    "photoUrl": "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80",
    "galleryPhotos": [
      {
        "id": "gal-mvm-01",
        "url": "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80",
        "title": "Storefront & Patient Reception Area",
        "category": "Exterior & Front"
      },
      {
        "id": "gal-mvm-02",
        "url": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80",
        "title": "Organized Prescription Racks & Drawers",
        "category": "Medicine Racks"
      },
      {
        "id": "gal-mvm-03",
        "url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80",
        "title": "Health Supplements & Diagnostics Section",
        "category": "Healthcare & OTC"
      }
    ],
    "rating": 4.8,
    "staff": [
      {
        "id": "st-mvm-201",
        "name": "Satish Chandra Shukla",
        "role": "Chief Pharmacist & Store Owner",
        "uppcRegNo": "UPPC-PH-33108",
        "qualification": "B.Pharm (Gorakhpur Univ)",
        "regDate": "2016-07-22",
        "validUpto": "2026-07-21",
        "phone": "+91 94502 18940",
        "shift": "Day Shift (09:00 AM - 06:00 PM)",
        "isAadhaarVerified": true,
        "isOnDuty": true,
        "status": "Active"
      },
      {
        "id": "st-mvm-202",
        "name": "Abhishek Dwivedi",
        "role": "Pharmacist",
        "uppcRegNo": "UPPC-PH-51902",
        "qualification": "D.Pharm",
        "regDate": "2021-03-10",
        "validUpto": "2026-03-09",
        "phone": "+91 98380 19283",
        "shift": "Evening (02:00 PM - 10:30 PM)",
        "isAadhaarVerified": true,
        "isOnDuty": true,
        "status": "Active"
      }
    ],
    "stocks": [
      {
        "id": "med-mvm-01",
        "name": "Telma 40 Tablet",
        "saltName": "Telmisartan 40mg",
        "manufacturer": "Glenmark Pharmaceuticals",
        "batchNo": "BAT-TEL-5102",
        "expiryDate": "2027-09-15",
        "quantity": 110,
        "unit": "Strips (15 tabs)",
        "mrp": 198,
        "purchaseRate": 142,
        "schedule": "Schedule H",
        "rackLocation": "Rack A-02",
        "minAlertThreshold": 20
      },
      {
        "id": "med-mvm-02",
        "name": "Montek-LC Tablet",
        "saltName": "Montelukast 10mg + Levocetirizine 5mg",
        "manufacturer": "Sun Pharma",
        "batchNo": "BAT-MON-4412",
        "expiryDate": "2027-04-10",
        "quantity": 85,
        "unit": "Strips (10 tabs)",
        "mrp": 188,
        "purchaseRate": 134,
        "schedule": "Schedule H",
        "rackLocation": "Rack B-04",
        "minAlertThreshold": 25
      },
      {
        "id": "med-mvm-03",
        "name": "Liv.52 DS Syrup",
        "saltName": "Ayurvedic Herbal Liver Formulation",
        "manufacturer": "Himalaya Wellness",
        "batchNo": "BAT-LIV-9821",
        "expiryDate": "2027-12-01",
        "quantity": 90,
        "unit": "Bottles (200ml)",
        "mrp": 175,
        "purchaseRate": 125,
        "schedule": "Ayush / OTC",
        "rackLocation": "Rack C-01",
        "minAlertThreshold": 15
      },
      {
        "id": "med-mvm-04",
        "name": "Dolo 650 Tablet",
        "saltName": "Paracetamol 650mg",
        "manufacturer": "Micro Labs Ltd",
        "batchNo": "BAT-DOL-3312",
        "expiryDate": "2028-03-20",
        "quantity": 280,
        "unit": "Strips (15 tabs)",
        "mrp": 34,
        "purchaseRate": 23.5,
        "schedule": "OTC",
        "rackLocation": "Rack B-01",
        "minAlertThreshold": 40
      }
    ],
    "slugAliases": [
      "maa-vindhyavasini-medicos",
      "vindhyavasini-deoria"
    ],
    "prescriptions": [
      {
        "id": "RX-MVM-2026-001",
        "patientName": "Anand Prakash Pandey",
        "phone": "+91 94152 77810",
        "notes": "Prescribed Azithral 500 and Pantocid 40 for throat infection by Sadar Hospital Deoria.",
        "fileName": "Rx_Sadar_Hospital_Deoria.pdf",
        "fileData": "",
        "createdAt": "07 Oct 2026, 05:15 PM",
        "timestamp": 1791392100000,
        "status": "Dispensed",
        "storeId": "store-up-002"
      },
      {
        "id": "RX-MVM-2026-002",
        "patientName": "Sunita Devi",
        "phone": "+91 94508 12344",
        "notes": "Dolo 650 and Liv.52 DS Syrup prescribed for viral fever.",
        "fileName": "Rx_Dr_Mishra.jpg",
        "fileData": "",
        "createdAt": "08 Oct 2026, 11:00 AM",
        "timestamp": 1791456000000,
        "status": "Pending",
        "storeId": "store-up-002"
      }
    ],
    "scheduleH1Register": [
      {
        "id": "H1-MVM-2026-001",
        "date": "07 Oct 2026, 05:15 PM",
        "patientName": "Anand Prakash Pandey",
        "patientAge": "38",
        "docName": "Dr. R.K. Mishra, MD",
        "docReg": "UPMC-M-34190",
        "rxId": "RX-MVM-H1-4192",
        "medId": "med-mvm-01",
        "medName": "Azithral 500 Tablet",
        "saltName": "Azithromycin 500mg",
        "batchNo": "BAT-AZI-9901",
        "expiryDate": "2027-06-30",
        "schedule": "Schedule H1",
        "quantity": 2,
        "unit": "Strips (5 tabs)",
        "mrp": 132,
        "subtotal": 264,
        "tax": 31.68,
        "totalBill": 295.68,
        "pharmacistName": "Vivek Mishra",
        "pharmacistReg": "UPPC-PH-33120"
      }
    ],
    "staffDutyLog": [
      {
        "id": "DUTY-MVM-901",
        "timestamp": "08 Oct 2026, 08:30 AM",
        "staffId": "st-mvm-201",
        "staffName": "Vivek Mishra",
        "uppcRegNo": "UPPC-PH-33120",
        "qualification": "B.Pharm (UP Tech Univ)",
        "action": "CLOCK_IN",
        "method": "Aadhaar Biometric Match Verified",
        "status": "Present On Duty (Chief Pharmacist)"
      },
      {
        "id": "DUTY-MVM-902",
        "timestamp": "07 Oct 2026, 04:00 PM",
        "staffId": "st-mvm-202",
        "staffName": "Sunil Kumar Tiwari",
        "uppcRegNo": "UPPC-PH-41902",
        "qualification": "D.Pharm (BTE UP)",
        "action": "CLOCK_IN",
        "method": "Aadhaar Biometric Match Verified",
        "status": "Evening Shift Duty Verified"
      }
    ],
    "purchaseExpenses": [
      {
        "id": "PO-MVM-2026-101",
        "date": "05 Oct 2026, 02:30 PM",
        "vendor": "Gorakhpur Regional Drug House",
        "itemsCount": 4,
        "unitsAdded": 280,
        "totalAmount": 36400,
        "status": "Stock Received in Rack"
      }
    ],
    "revenueData": {
      "todaySales": 28400,
      "monthlyGross": 810000,
      "lastMonthGross": 780000,
      "avgGrossMarginPercent": 21.8,
      "totalOrdersThisMonth": 1180,
      "digitalSplitPercent": 58,
      "cashSplitPercent": 42,
      "gstCollectedMonthly": 97200,
      "transactions": [
        {
          "id": "BILL-MVM-7701",
          "date": "07 Oct 2026, 05:15 PM",
          "patientName": "Anand Prakash Pandey",
          "patientAge": "38",
          "docName": "Dr. R.K. Mishra, MD",
          "docReg": "UPMC-M-34190",
          "rxId": "RX-MVM-H1-4192",
          "medId": "med-mvm-01",
          "medName": "Azithral 500 Tablet",
          "saltName": "Azithromycin 500mg",
          "batchNo": "BAT-AZI-9901",
          "expiryDate": "2027-06-30",
          "schedule": "Schedule H1",
          "quantity": 2,
          "unit": "Strips (5 tabs)",
          "mrp": 132,
          "totalBill": 295.68,
          "mode": "UPI",
          "pharmacistName": "Vivek Mishra"
        }
      ],
      "monthlyHistory": [
        {
          "month": "May",
          "revenue": 710000,
          "digital": 410000,
          "cash": 300000
        },
        {
          "month": "Jun",
          "revenue": 740000,
          "digital": 430000,
          "cash": 310000
        },
        {
          "month": "Jul",
          "revenue": 770000,
          "digital": 450000,
          "cash": 320000
        },
        {
          "month": "Aug",
          "revenue": 800000,
          "digital": 460000,
          "cash": 340000
        },
        {
          "month": "Sep",
          "revenue": 780000,
          "digital": 450000,
          "cash": 330000
        },
        {
          "month": "Oct (Current)",
          "revenue": 810000,
          "digital": 470000,
          "cash": 340000
        }
      ],
      "paymentChannels": {
        "upi": 48,
        "cards": 10,
        "cash": 42
      }
    }
  },
  {
    "id": "store-up-003",
    "slug": "kushwaha-medical-store-deoria",
    "name": "Kushwaha Medical Store & Surgical",
    "district": "Deoria",
    "city": "Deoria",
    "address": "Civil Lines, Near Maharshi Devraha Baba Medical College / Sadar Hospital, Deoria - 274001",
    "mapsUrl": "https://maps.google.com/?q=Civil+Lines+Deoria+Hospital+Uttar+Pradesh",
    "phone": "+91 98391 20455",
    "whatsapp": "+919839120455",
    "email": "kushwaha.medicals.deoria@gmail.com",
    "ownerName": "Ramesh Chandra Kushwaha",
    "license20": "UP/DEO/2020/20/1882",
    "license21": "UP/DEO/2020/21/1883",
    "gstin": "09ABCK9901R1Z8",
    "establishedYear": "2011",
    "operatingHours": "24x7 Emergency Service",
    "is24x7": true,
    "isViewOnly": true,
    "status": "Verified",
    "photoUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80",
    "galleryPhotos": [
      {
        "id": "gal-kms-01",
        "url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80",
        "title": "24x7 Hospital Emergency Counter",
        "category": "Emergency Care"
      },
      {
        "id": "gal-kms-02",
        "url": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80",
        "title": "Life-Saving Antibiotics & IV Infusions Bay",
        "category": "Critical Medicines"
      }
    ],
    "rating": 4.7,
    "staff": [
      {
        "id": "st-kms-301",
        "name": "Ramesh Chandra Kushwaha",
        "role": "Chief Pharmacist",
        "uppcRegNo": "UPPC-PH-28109",
        "qualification": "B.Pharm (Deoria Tech)",
        "regDate": "2013-04-10",
        "validUpto": "2028-04-09",
        "phone": "+91 98391 20455",
        "shift": "Morning (08:00 AM - 04:00 PM)",
        "isAadhaarVerified": true,
        "isOnDuty": true,
        "status": "Active"
      },
      {
        "id": "st-kms-302",
        "name": "Sanjay Kushwaha",
        "role": "Night Incharge Pharmacist",
        "uppcRegNo": "UPPC-PH-59012",
        "qualification": "D.Pharm",
        "regDate": "2022-01-15",
        "validUpto": "2027-01-14",
        "phone": "+91 94158 99120",
        "shift": "Night Shift (10:00 PM - 08:00 AM)",
        "isAadhaarVerified": true,
        "isOnDuty": false,
        "status": "Active"
      }
    ],
    "stocks": [
      {
        "id": "med-kms-01",
        "name": "Augmentin 625 Duo Tablet",
        "saltName": "Amoxicillin 500mg + Potassium Clavulanate 125mg",
        "manufacturer": "GlaxoSmithKline Pharmaceuticals",
        "batchNo": "BAT-AUG-7812",
        "expiryDate": "2027-10-31",
        "quantity": 140,
        "unit": "Strips (10 tabs)",
        "mrp": 223.5,
        "purchaseRate": 168,
        "schedule": "Schedule H",
        "rackLocation": "Rack A-01",
        "minAlertThreshold": 30
      },
      {
        "id": "med-kms-02",
        "name": "Azithral 500 Tablet",
        "saltName": "Azithromycin 500mg",
        "manufacturer": "Alembic Pharmaceuticals",
        "batchNo": "BAT-AZI-4419",
        "expiryDate": "2027-06-25",
        "quantity": 60,
        "unit": "Strips (5 tabs)",
        "mrp": 132,
        "purchaseRate": 98,
        "schedule": "Schedule H1",
        "rackLocation": "Rack A-05",
        "minAlertThreshold": 20
      },
      {
        "id": "med-kms-03",
        "name": "Pan-D Capsule",
        "saltName": "Pantoprazole 40mg + Domperidone 30mg",
        "manufacturer": "Alkem Laboratories",
        "batchNo": "BAT-PAN-9102",
        "expiryDate": "2027-12-15",
        "quantity": 210,
        "unit": "Strips (15 caps)",
        "mrp": 215,
        "purchaseRate": 155,
        "schedule": "Schedule H",
        "rackLocation": "Rack B-02",
        "minAlertThreshold": 35
      }
    ],
    "slugAliases": [
      "kushwaha-medicals",
      "kushwaha-store-deoria"
    ],
    "prescriptions": [
      {
        "id": "RX-KMS-2026-001",
        "patientName": "Virendra Pratap Yadav",
        "phone": "+91 98391 44552",
        "notes": "Amoxicillin and Cefixime prescribed by Emergency Ward.",
        "fileName": "Emergency_Rx_Civil_Lines.pdf",
        "fileData": "",
        "createdAt": "08 Oct 2026, 01:20 PM",
        "timestamp": 1791464400000,
        "status": "Dispensed",
        "storeId": "store-up-003"
      }
    ],
    "scheduleH1Register": [
      {
        "id": "H1-KMS-2026-001",
        "date": "08 Oct 2026, 01:20 PM",
        "patientName": "Virendra Pratap Yadav",
        "patientAge": "52",
        "docName": "Dr. S.P. Singh, MS (Ortho)",
        "docReg": "UPMC-M-22104",
        "rxId": "RX-KMS-H1-1049",
        "medId": "med-kms-01",
        "medName": "Taxim-O 200 Tablet",
        "saltName": "Cefixime 200mg",
        "batchNo": "BAT-TAX-2201",
        "expiryDate": "2027-09-15",
        "schedule": "Schedule H1",
        "quantity": 2,
        "unit": "Strips (10 tabs)",
        "mrp": 168,
        "subtotal": 336,
        "tax": 40.32,
        "totalBill": 376.32,
        "pharmacistName": "Ramesh Chandra Kushwaha",
        "pharmacistReg": "UPPC-PH-28109"
      }
    ],
    "staffDutyLog": [
      {
        "id": "DUTY-KMS-901",
        "timestamp": "08 Oct 2026, 08:00 AM",
        "staffId": "st-kms-301",
        "staffName": "Ramesh Chandra Kushwaha",
        "uppcRegNo": "UPPC-PH-28109",
        "qualification": "B.Pharm (Deoria Tech)",
        "action": "CLOCK_IN",
        "method": "Aadhaar Biometric Match Verified",
        "status": "Present On Duty (24x7 Shift Lead)"
      }
    ],
    "purchaseExpenses": [
      {
        "id": "PO-KMS-2026-101",
        "date": "04 Oct 2026, 10:15 AM",
        "vendor": "Eastern UP Surgical & Pharma Agency",
        "itemsCount": 6,
        "unitsAdded": 410,
        "totalAmount": 51200,
        "status": "Stock Received in Rack"
      }
    ],
    "revenueData": {
      "todaySales": 39500,
      "monthlyGross": 1140000,
      "lastMonthGross": 1090000,
      "avgGrossMarginPercent": 22.1,
      "totalOrdersThisMonth": 1640,
      "digitalSplitPercent": 62,
      "cashSplitPercent": 38,
      "gstCollectedMonthly": 136800,
      "transactions": [
        {
          "id": "BILL-KMS-9901",
          "date": "08 Oct 2026, 01:20 PM",
          "patientName": "Virendra Pratap Yadav",
          "patientAge": "52",
          "docName": "Dr. S.P. Singh, MS",
          "docReg": "UPMC-M-22104",
          "rxId": "RX-KMS-H1-1049",
          "medId": "med-kms-01",
          "medName": "Taxim-O 200 Tablet",
          "saltName": "Cefixime 200mg",
          "batchNo": "BAT-TAX-2201",
          "expiryDate": "2027-09-15",
          "schedule": "Schedule H1",
          "quantity": 2,
          "unit": "Strips (10 tabs)",
          "mrp": 168,
          "totalBill": 376.32,
          "mode": "Cash",
          "pharmacistName": "Ramesh Chandra Kushwaha"
        }
      ],
      "monthlyHistory": [
        {
          "month": "May",
          "revenue": 980000,
          "digital": 600000,
          "cash": 380000
        },
        {
          "month": "Jun",
          "revenue": 1020000,
          "digital": 630000,
          "cash": 390000
        },
        {
          "month": "Jul",
          "revenue": 1070000,
          "digital": 660000,
          "cash": 410000
        },
        {
          "month": "Aug",
          "revenue": 1110000,
          "digital": 690000,
          "cash": 420000
        },
        {
          "month": "Sep",
          "revenue": 1090000,
          "digital": 680000,
          "cash": 410000
        },
        {
          "month": "Oct (Current)",
          "revenue": 1140000,
          "digital": 706800,
          "cash": 433200
        }
      ],
      "paymentChannels": {
        "upi": 54,
        "cards": 8,
        "cash": 38
      }
    }
  },
  {
    "id": "store-up-004",
    "slug": "raghav-chemist-deoria",
    "name": "Raghav Chemist & Druggists",
    "district": "Deoria",
    "city": "Deoria",
    "address": "Malviya Road, Ram Gulam Tola, Deoria, Uttar Pradesh - 274001",
    "mapsUrl": "https://maps.google.com/?q=Malviya+Road+Ram+Gulam+Tola+Deoria",
    "phone": "+91 94158 44321",
    "whatsapp": "+919415844321",
    "email": "raghav.chemist.deoria@gmail.com",
    "ownerName": "Raghavendra Nath Tiwari",
    "license20": "UP/DEO/2019/20/1429",
    "license21": "UP/DEO/2019/21/1430",
    "gstin": "09ACCPT8890K1ZY",
    "establishedYear": "2008",
    "operatingHours": "08:00 AM - 10:00 PM",
    "is24x7": false,
    "isViewOnly": true,
    "status": "Verified",
    "photoUrl": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80",
    "galleryPhotos": [
      {
        "id": "gal-rcd-01",
        "url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80",
        "title": "Malviya Road Retail Storefront",
        "category": "Exterior & Front"
      },
      {
        "id": "gal-rcd-02",
        "url": "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80",
        "title": "Complete Range of Pediatric & Senior Care Medicines",
        "category": "Family Health"
      }
    ],
    "rating": 4.8,
    "staff": [
      {
        "id": "st-rcd-401",
        "name": "Raghavendra Nath Tiwari",
        "role": "Chief Pharmacist & Owner",
        "uppcRegNo": "UPPC-PH-24510",
        "qualification": "B.Pharm (Gorakhpur)",
        "regDate": "2010-09-18",
        "validUpto": "2030-09-17",
        "phone": "+91 94158 44321",
        "shift": "Morning & Evening",
        "isAadhaarVerified": true,
        "isOnDuty": true,
        "status": "Active"
      }
    ],
    "stocks": [
      {
        "id": "med-rcd-01",
        "name": "Dolo 650 Tablet",
        "saltName": "Paracetamol 650mg",
        "manufacturer": "Micro Labs Ltd",
        "batchNo": "BAT-DOL-7719",
        "expiryDate": "2028-01-20",
        "quantity": 290,
        "unit": "Strips (15 tabs)",
        "mrp": 34,
        "purchaseRate": 23.5,
        "schedule": "OTC",
        "rackLocation": "Rack B-01",
        "minAlertThreshold": 45
      },
      {
        "id": "med-rcd-02",
        "name": "Liv.52 DS Syrup",
        "saltName": "Ayurvedic Herbal Liver Formulation",
        "manufacturer": "Himalaya Wellness",
        "batchNo": "BAT-LIV-8820",
        "expiryDate": "2027-11-15",
        "quantity": 65,
        "unit": "Bottles (200ml)",
        "mrp": 175,
        "purchaseRate": 125,
        "schedule": "Ayush / OTC",
        "rackLocation": "Rack C-02",
        "minAlertThreshold": 15
      },
      {
        "id": "med-rcd-03",
        "name": "Telma 40 Tablet",
        "saltName": "Telmisartan 40mg",
        "manufacturer": "Glenmark Pharmaceuticals",
        "batchNo": "BAT-TEL-8812",
        "expiryDate": "2027-08-10",
        "quantity": 120,
        "unit": "Strips (15 tabs)",
        "mrp": 198,
        "purchaseRate": 142,
        "schedule": "Schedule H",
        "rackLocation": "Rack D-02",
        "minAlertThreshold": 20
      }
    ],
    "slugAliases": [
      "raghav-chemist",
      "raghav-medicals-deoria"
    ],
    "prescriptions": [
      {
        "id": "RX-RAG-2026-001",
        "patientName": "Pooja Chaurasia",
        "phone": "+91 94158 99012",
        "notes": "Pantocid 40 and Calpol 500 prescribed for gastroenteritis.",
        "fileName": "Rx_Dr_Gupta.pdf",
        "fileData": "",
        "createdAt": "07 Oct 2026, 06:45 PM",
        "timestamp": 1791397500000,
        "status": "Dispensed",
        "storeId": "store-up-004"
      }
    ],
    "scheduleH1Register": [
      {
        "id": "H1-RAG-2026-001",
        "date": "07 Oct 2026, 06:45 PM",
        "patientName": "Pooja Chaurasia",
        "patientAge": "29",
        "docName": "Dr. Anita Gupta, DGO",
        "docReg": "UPMC-M-44129",
        "rxId": "RX-RAG-H1-6621",
        "medId": "med-rcd-01",
        "medName": "Augmentin 625 Duo Tablet",
        "saltName": "Amoxicillin + Clavulanate",
        "batchNo": "BAT-AUG-7712",
        "expiryDate": "2027-04-30",
        "schedule": "Schedule H",
        "quantity": 1,
        "unit": "Strips (10 tabs)",
        "mrp": 223.5,
        "subtotal": 223.5,
        "tax": 26.82,
        "totalBill": 250.32,
        "pharmacistName": "Raghavendra Pratap Singh",
        "pharmacistReg": "UPPC-PH-41290"
      }
    ],
    "staffDutyLog": [
      {
        "id": "DUTY-RAG-901",
        "timestamp": "08 Oct 2026, 09:30 AM",
        "staffId": "st-rcd-401",
        "staffName": "Raghavendra Pratap Singh",
        "uppcRegNo": "UPPC-PH-41290",
        "qualification": "D.Pharm (BTEUP Lucknow)",
        "action": "CLOCK_IN",
        "method": "Aadhaar Biometric Match Verified",
        "status": "Present On Duty (Incharge)"
      }
    ],
    "purchaseExpenses": [
      {
        "id": "PO-RAG-2026-101",
        "date": "03 Oct 2026, 03:00 PM",
        "vendor": "Gorakhpur Depot C&F",
        "itemsCount": 3,
        "unitsAdded": 210,
        "totalAmount": 28500,
        "status": "Stock Received in Rack"
      }
    ],
    "revenueData": {
      "todaySales": 22100,
      "monthlyGross": 670000,
      "lastMonthGross": 645000,
      "avgGrossMarginPercent": 21.4,
      "totalOrdersThisMonth": 980,
      "digitalSplitPercent": 55,
      "cashSplitPercent": 45,
      "gstCollectedMonthly": 80400,
      "transactions": [
        {
          "id": "BILL-RAG-5501",
          "date": "07 Oct 2026, 06:45 PM",
          "patientName": "Pooja Chaurasia",
          "patientAge": "29",
          "docName": "Dr. Anita Gupta, DGO",
          "docReg": "UPMC-M-44129",
          "rxId": "RX-RAG-H1-6621",
          "medId": "med-rcd-01",
          "medName": "Augmentin 625 Duo Tablet",
          "saltName": "Amoxicillin + Clavulanate",
          "batchNo": "BAT-AUG-7712",
          "expiryDate": "2027-04-30",
          "schedule": "Schedule H",
          "quantity": 1,
          "unit": "Strips (10 tabs)",
          "mrp": 223.5,
          "totalBill": 250.32,
          "mode": "UPI",
          "pharmacistName": "Raghavendra Pratap Singh"
        }
      ],
      "monthlyHistory": [
        {
          "month": "May",
          "revenue": 590000,
          "digital": 320000,
          "cash": 270000
        },
        {
          "month": "Jun",
          "revenue": 620000,
          "digital": 340000,
          "cash": 280000
        },
        {
          "month": "Jul",
          "revenue": 640000,
          "digital": 350000,
          "cash": 290000
        },
        {
          "month": "Aug",
          "revenue": 660000,
          "digital": 360000,
          "cash": 300000
        },
        {
          "month": "Sep",
          "revenue": 645000,
          "digital": 355000,
          "cash": 290000
        },
        {
          "month": "Oct (Current)",
          "revenue": 670000,
          "digital": 368500,
          "cash": 301500
        }
      ],
      "paymentChannels": {
        "upi": 46,
        "cards": 9,
        "cash": 45
      }
    }
  },
  {
    "id": "store-up-005",
    "slug": "ganga-medical-hall-kanpur",
    "name": "Ganga Medical Hall & Healthcare",
    "district": "Kanpur Nagar",
    "city": "Kanpur",
    "address": "14/112, Mall Road, Near Phoolbagh, Kanpur Nagar, Uttar Pradesh - 208001",
    "mapsUrl": "https://maps.google.com/?q=Mall+Road+Phoolbagh+Kanpur+Nagar",
    "phone": "+91 94150 49182",
    "whatsapp": "+919415049182",
    "email": "ganga.medical.kanpur@gmail.com",
    "ownerName": "Sunil Kumar Gupta",
    "license20": "UP/KNP/2018/20/3901",
    "license21": "UP/KNP/2018/21/3902",
    "gstin": "09AABCG8192F1Z4",
    "establishedYear": "2004",
    "operatingHours": "08:00 AM - 11:00 PM",
    "is24x7": false,
    "isViewOnly": true,
    "status": "Verified",
    "photoUrl": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1200&q=80",
    "galleryPhotos": [
      {
        "id": "gal-gmh-01",
        "url": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1200&q=80",
        "title": "Mall Road Storefront Facade",
        "category": "Exterior & Front"
      },
      {
        "id": "gal-gmh-02",
        "url": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80",
        "title": "Cardiovascular & Chronic Therapy Section",
        "category": "Chronic Care"
      }
    ],
    "rating": 4.9,
    "staff": [
      {
        "id": "st-gmh-501",
        "name": "Sunil Kumar Gupta",
        "role": "Chief Pharmacist & Proprietor",
        "uppcRegNo": "UPPC-PH-21094",
        "qualification": "B.Pharm (GSVM Medical College Kanpur)",
        "regDate": "2006-05-12",
        "validUpto": "2026-05-11",
        "phone": "+91 94150 49182",
        "shift": "Day Shift (08:30 AM - 05:00 PM)",
        "isAadhaarVerified": true,
        "isOnDuty": true,
        "status": "Active"
      },
      {
        "id": "st-gmh-502",
        "name": "Pawan Agnihotri",
        "role": "Pharmacist",
        "uppcRegNo": "UPPC-PH-49811",
        "qualification": "D.Pharm",
        "regDate": "2019-10-02",
        "validUpto": "2029-10-01",
        "phone": "+91 98390 12781",
        "shift": "Evening (04:00 PM - 11:00 PM)",
        "isAadhaarVerified": true,
        "isOnDuty": true,
        "status": "Active"
      }
    ],
    "stocks": [
      {
        "id": "med-gmh-01",
        "name": "Augmentin 625 Duo Tablet",
        "saltName": "Amoxicillin 500mg + Potassium Clavulanate 125mg",
        "manufacturer": "GlaxoSmithKline Pharmaceuticals",
        "batchNo": "BAT-AUG-8802",
        "expiryDate": "2027-09-30",
        "quantity": 130,
        "unit": "Strips (10 tabs)",
        "mrp": 223.5,
        "purchaseRate": 168,
        "schedule": "Schedule H",
        "rackLocation": "Rack A-01",
        "minAlertThreshold": 25
      },
      {
        "id": "med-gmh-02",
        "name": "Pan-D Capsule",
        "saltName": "Pantoprazole 40mg + Domperidone 30mg",
        "manufacturer": "Alkem Laboratories",
        "batchNo": "BAT-PAN-8812",
        "expiryDate": "2027-10-20",
        "quantity": 160,
        "unit": "Strips (15 caps)",
        "mrp": 215,
        "purchaseRate": 155,
        "schedule": "Schedule H",
        "rackLocation": "Rack C-02",
        "minAlertThreshold": 30
      },
      {
        "id": "med-gmh-03",
        "name": "Azithral 500 Tablet",
        "saltName": "Azithromycin 500mg",
        "manufacturer": "Alembic Pharmaceuticals",
        "batchNo": "BAT-AZI-6102",
        "expiryDate": "2027-06-10",
        "quantity": 45,
        "unit": "Strips (5 tabs)",
        "mrp": 132,
        "purchaseRate": 98,
        "schedule": "Schedule H1",
        "rackLocation": "Rack A-05",
        "minAlertThreshold": 20
      }
    ],
    "slugAliases": [
      "ganga-medicals",
      "ganga-chemist-kanpur"
    ],
    "prescriptions": [
      {
        "id": "RX-GAN-2026-001",
        "patientName": "Harish Chandra Nigam",
        "phone": "+91 94150 11982",
        "notes": "Cardiovascular maintenance medications prescribed by GSVM Medical College Kanpur.",
        "fileName": "Rx_GSVM_Kanpur.pdf",
        "fileData": "",
        "createdAt": "08 Oct 2026, 11:15 AM",
        "timestamp": 1791456900000,
        "status": "Dispensed",
        "storeId": "store-up-005"
      }
    ],
    "scheduleH1Register": [
      {
        "id": "H1-GAN-2026-001",
        "date": "08 Oct 2026, 11:15 AM",
        "patientName": "Harish Chandra Nigam",
        "patientAge": "61",
        "docName": "Dr. V.K. Agrawal, DM (Cardio)",
        "docReg": "UPMC-M-18721",
        "rxId": "RX-GAN-H1-3310",
        "medId": "med-gmh-01",
        "medName": "Telma-H 40mg/12.5mg",
        "saltName": "Telmisartan + Hydrochlorothiazide",
        "batchNo": "BAT-TEL-8819",
        "expiryDate": "2027-08-31",
        "schedule": "Schedule H",
        "quantity": 3,
        "unit": "Strips (15 tabs)",
        "mrp": 245,
        "subtotal": 735,
        "tax": 88.2,
        "totalBill": 823.2,
        "pharmacistName": "Alok Kumar Gupta",
        "pharmacistReg": "UPPC-PH-24156"
      }
    ],
    "staffDutyLog": [
      {
        "id": "DUTY-GAN-901",
        "timestamp": "08 Oct 2026, 08:30 AM",
        "staffId": "st-gmh-501",
        "staffName": "Alok Kumar Gupta",
        "uppcRegNo": "UPPC-PH-24156",
        "qualification": "B.Pharm (Kanpur Univ)",
        "action": "CLOCK_IN",
        "method": "Aadhaar Biometric Match Verified",
        "status": "Present On Duty (Chief Pharmacist)"
      }
    ],
    "purchaseExpenses": [
      {
        "id": "PO-GAN-2026-101",
        "date": "02 Oct 2026, 01:30 PM",
        "vendor": "Kanpur Central Wholesale Drug Syndicate",
        "itemsCount": 8,
        "unitsAdded": 600,
        "totalAmount": 89000,
        "status": "Stock Received in Rack"
      }
    ],
    "revenueData": {
      "todaySales": 45200,
      "monthlyGross": 1320000,
      "lastMonthGross": 1250000,
      "avgGrossMarginPercent": 22.8,
      "totalOrdersThisMonth": 1840,
      "digitalSplitPercent": 72,
      "cashSplitPercent": 28,
      "gstCollectedMonthly": 158400,
      "transactions": [
        {
          "id": "BILL-GAN-4401",
          "date": "08 Oct 2026, 11:15 AM",
          "patientName": "Harish Chandra Nigam",
          "patientAge": "61",
          "docName": "Dr. V.K. Agrawal, DM",
          "docReg": "UPMC-M-18721",
          "rxId": "RX-GAN-H1-3310",
          "medId": "med-gmh-01",
          "medName": "Telma-H 40mg/12.5mg",
          "saltName": "Telmisartan + Hydrochlorothiazide",
          "batchNo": "BAT-TEL-8819",
          "expiryDate": "2027-08-31",
          "schedule": "Schedule H",
          "quantity": 3,
          "unit": "Strips (15 tabs)",
          "mrp": 245,
          "totalBill": 823.2,
          "mode": "UPI",
          "pharmacistName": "Alok Kumar Gupta"
        }
      ],
      "monthlyHistory": [
        {
          "month": "May",
          "revenue": 1120000,
          "digital": 800000,
          "cash": 320000
        },
        {
          "month": "Jun",
          "revenue": 1180000,
          "digital": 850000,
          "cash": 330000
        },
        {
          "month": "Jul",
          "revenue": 1220000,
          "digital": 880000,
          "cash": 340000
        },
        {
          "month": "Aug",
          "revenue": 1280000,
          "digital": 920000,
          "cash": 360000
        },
        {
          "month": "Sep",
          "revenue": 1250000,
          "digital": 900000,
          "cash": 350000
        },
        {
          "month": "Oct (Current)",
          "revenue": 1320000,
          "digital": 950400,
          "cash": 369600
        }
      ],
      "paymentChannels": {
        "upi": 58,
        "cards": 14,
        "cash": 28
      }
    }
  },
  {
    "id": "store-up-006",
    "slug": "awadh-care-chemist-lucknow",
    "name": "Awadh Care Chemist & Surgical",
    "district": "Lucknow",
    "city": "Lucknow",
    "address": "Shop 18, Near Civil Hospital, Hazratganj, Lucknow, Uttar Pradesh - 226001",
    "mapsUrl": "https://maps.google.com/?q=Civil+Hospital+Hazratganj+Lucknow",
    "phone": "+91 94150 28419",
    "whatsapp": "+919415028419",
    "email": "awadhcare.hazratganj@gmail.com",
    "ownerName": "Dr. Manvendra Pratap Singh",
    "license20": "UP/LKO/2021/20/4891",
    "license21": "UP/LKO/2021/21/4892",
    "gstin": "09AABCS1429P1ZK",
    "establishedYear": "2012",
    "operatingHours": "24x7 Emergency Service",
    "is24x7": true,
    "isViewOnly": true,
    "status": "Verified",
    "photoUrl": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80",
    "galleryPhotos": [
      {
        "id": "gal-acc-01",
        "url": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80",
        "title": "Hazratganj Main Dispensary",
        "category": "Exterior & Front"
      },
      {
        "id": "gal-acc-02",
        "url": "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80",
        "title": "Emergency Care & Critical Injectables Racks",
        "category": "Emergency & Racks"
      }
    ],
    "rating": 4.8,
    "staff": [
      {
        "id": "st-acc-601",
        "name": "Deepak Verma",
        "role": "Chief Pharmacist",
        "uppcRegNo": "UPPC-PH-41290",
        "qualification": "B.Pharm (KGMU Lucknow)",
        "regDate": "2018-06-15",
        "validUpto": "2028-06-14",
        "phone": "+91 98390 12894",
        "shift": "Morning (08:00 AM - 04:00 PM)",
        "isAadhaarVerified": true,
        "isOnDuty": true,
        "status": "Active"
      },
      {
        "id": "st-acc-602",
        "name": "Pooja Mishra",
        "role": "Assistant Pharmacist",
        "uppcRegNo": "UPPC-PH-58932",
        "qualification": "D.Pharm (UP Board of Tech)",
        "regDate": "2021-09-10",
        "validUpto": "2026-09-09",
        "phone": "+91 94500 48211",
        "shift": "Evening (04:00 PM - 12:00 AM)",
        "isAadhaarVerified": true,
        "isOnDuty": true,
        "status": "Active"
      }
    ],
    "stocks": [
      {
        "id": "med-acc-01",
        "name": "Augmentin 625 Duo Tablet",
        "saltName": "Amoxicillin 500mg + Potassium Clavulanate 125mg",
        "manufacturer": "GlaxoSmithKline Pharmaceuticals",
        "batchNo": "BAT-AUG-9912",
        "expiryDate": "2027-08-31",
        "quantity": 140,
        "unit": "Strips (10 tabs)",
        "mrp": 223.5,
        "purchaseRate": 168,
        "schedule": "Schedule H",
        "rackLocation": "Rack A-04",
        "minAlertThreshold": 25
      },
      {
        "id": "med-acc-02",
        "name": "Dolo 650 Tablet",
        "saltName": "Paracetamol 650mg",
        "manufacturer": "Micro Labs Ltd",
        "batchNo": "BAT-DOL-4102",
        "expiryDate": "2028-01-15",
        "quantity": 320,
        "unit": "Strips (15 tabs)",
        "mrp": 34,
        "purchaseRate": 23.5,
        "schedule": "OTC",
        "rackLocation": "Rack B-01",
        "minAlertThreshold": 50
      },
      {
        "id": "med-acc-03",
        "name": "Pan-D Capsule",
        "saltName": "Pantoprazole 40mg + Domperidone 30mg",
        "manufacturer": "Alkem Laboratories",
        "batchNo": "BAT-PAN-6014",
        "expiryDate": "2027-11-20",
        "quantity": 210,
        "unit": "Strips (15 caps)",
        "mrp": 215,
        "purchaseRate": 155,
        "schedule": "Schedule H",
        "rackLocation": "Rack C-02",
        "minAlertThreshold": 40
      }
    ],
    "slugAliases": [
      "awadh-care-chemist",
      "awadh-lucknow",
      "sanjeevani-lucknow"
    ],
    "prescriptions": [
      {
        "id": "RX-AWD-2026-001",
        "patientName": "Kavita Mehrotra",
        "phone": "+91 98390 12099",
        "notes": "Prescribed by KGMU Lucknow for post-surgical recovery.",
        "fileName": "Rx_KGMU_Lucknow.pdf",
        "fileData": "",
        "createdAt": "08 Oct 2026, 12:40 PM",
        "timestamp": 1791462000000,
        "status": "Dispensed",
        "storeId": "store-up-006"
      }
    ],
    "scheduleH1Register": [
      {
        "id": "H1-AWD-2026-001",
        "date": "08 Oct 2026, 12:40 PM",
        "patientName": "Kavita Mehrotra",
        "patientAge": "42",
        "docName": "Dr. S.K. Bhargava, MCh",
        "docReg": "UPMC-M-15409",
        "rxId": "RX-AWD-H1-9018",
        "medId": "med-acc-01",
        "medName": "Monocef 1g Injection",
        "saltName": "Ceftriaxone Sodium Sterile 1000mg",
        "batchNo": "BAT-MON-4410",
        "expiryDate": "2027-11-30",
        "schedule": "Schedule H1",
        "quantity": 4,
        "unit": "Vials (1g)",
        "mrp": 68.5,
        "subtotal": 274,
        "tax": 32.88,
        "totalBill": 306.88,
        "pharmacistName": "Dr. Manvendra Pratap Singh",
        "pharmacistReg": "UPPC-PH-19842"
      }
    ],
    "staffDutyLog": [
      {
        "id": "DUTY-AWD-901",
        "timestamp": "08 Oct 2026, 08:45 AM",
        "staffId": "st-acc-601",
        "staffName": "Dr. Manvendra Pratap Singh",
        "uppcRegNo": "UPPC-PH-19842",
        "qualification": "Pharm.D, B.Pharm (KGMU Lucknow)",
        "action": "CLOCK_IN",
        "method": "Aadhaar Biometric Match Verified",
        "status": "Present On Duty (Director Pharmacist)"
      }
    ],
    "purchaseExpenses": [
      {
        "id": "PO-AWD-2026-101",
        "date": "01 Oct 2026, 11:00 AM",
        "vendor": "Lucknow State Drug Depot C&F",
        "itemsCount": 10,
        "unitsAdded": 750,
        "totalAmount": 112000,
        "status": "Stock Received in Rack"
      }
    ],
    "revenueData": {
      "todaySales": 48520,
      "monthlyGross": 1485600,
      "lastMonthGross": 1392000,
      "avgGrossMarginPercent": 21.4,
      "totalOrdersThisMonth": 1940,
      "digitalSplitPercent": 68,
      "cashSplitPercent": 32,
      "gstCollectedMonthly": 178272,
      "transactions": [
        {
          "id": "BILL-AWD-3301",
          "date": "08 Oct 2026, 12:40 PM",
          "patientName": "Kavita Mehrotra",
          "patientAge": "42",
          "docName": "Dr. S.K. Bhargava, MCh",
          "docReg": "UPMC-M-15409",
          "rxId": "RX-AWD-H1-9018",
          "medId": "med-acc-01",
          "medName": "Monocef 1g Injection",
          "saltName": "Ceftriaxone Sodium Sterile 1000mg",
          "batchNo": "BAT-MON-4410",
          "expiryDate": "2027-11-30",
          "schedule": "Schedule H1",
          "quantity": 4,
          "unit": "Vials (1g)",
          "mrp": 68.5,
          "totalBill": 306.88,
          "mode": "Card",
          "pharmacistName": "Dr. Manvendra Pratap Singh"
        }
      ],
      "monthlyHistory": [
        {
          "month": "May",
          "revenue": 1240000,
          "digital": 790000,
          "cash": 450000
        },
        {
          "month": "Jun",
          "revenue": 1310000,
          "digital": 860000,
          "cash": 450000
        },
        {
          "month": "Jul",
          "revenue": 1380000,
          "digital": 920000,
          "cash": 460000
        },
        {
          "month": "Aug",
          "revenue": 1420000,
          "digital": 950000,
          "cash": 470000
        },
        {
          "month": "Sep",
          "revenue": 1392000,
          "digital": 940000,
          "cash": 452000
        },
        {
          "month": "Oct (Current)",
          "revenue": 1485600,
          "digital": 1010000,
          "cash": 475600
        }
      ],
      "paymentChannels": {
        "upi": 54,
        "cards": 14,
        "cash": 32
      }
    }
  },
  {
    "id": "store-up-007",
    "slug": "apoorva-tripathi-medicos-deoria",
    "slugAliases": [
      "apoorva-tripathi-medicos",
      "aporvaa-tripathi-medicos",
      "apoorva-tripathi-deoria",
      "aporvaa-tripathi-medicos-deoria",
      "apoorva-medicos-deoria"
    ],
    "name": "Apoorva Tripathi Medicos",
    "alternateNames": [
      "Aporvaa Tripathi Medicos",
      "अपूर्वा त्रिपाठी मेडिकोज",
      "अपूर्वा त्रिपाठी देवरिया",
      "Apoorva Tripathi Chemist",
      "Apoorva Medicos Deoria"
    ],
    "district": "Deoria",
    "city": "Deoria",
    "address": "Saket Nagar, Station Road, Deoria, Uttar Pradesh - 274001",
    "license20": "UP/DEO/2023/20/3142",
    "license21": "UP/DEO/2023/21/3134",
    "ownerName": "Apoorva Tripathi",
    "phone": "+91 80040 34320",
    "whatsapp": "918004034320",
    "email": "contact@apoorvatripathimedicos.com",
    "gstin": "09AABCT8192M1Z5",
    "establishedYear": "2023",
    "operatingHours": "08:00 AM - 10:30 PM",
    "is24x7": true,
    "status": "Verified",
    "rating": 4.9,
    "photoUrl": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80",
    "adminUsername": "apoorva-tripathi",
    "adminPassword": "Pharma@8004",
    "isViewOnly": false,
    "staff": [
      {
        "id": "st-007-1",
        "name": "Apoorva Tripathi",
        "role": "Proprietor & Registered Pharmacist",
        "uppcRegNo": "UPPC-PH-49218",
        "qualification": "B.Pharm, R.Ph (UP)",
        "regDate": "2021-04-12",
        "validUpto": "2031-12-31",
        "phone": "+91 80040 34320",
        "shift": "General Shift / 24x7 Emergency",
        "isAadhaarVerified": true,
        "isOnDuty": true,
        "status": "Active"
      }
    ],
    "stocks": [
      {
        "id": "med-atm-01",
        "name": "Augmentin 625 Duo Tablet",
        "saltName": "Amoxicillin 500mg + Potassium Clavulanate 125mg",
        "manufacturer": "GlaxoSmithKline Pharmaceuticals",
        "batchNo": "BAT-AUG-5501",
        "expiryDate": "2027-08-31",
        "quantity": 80,
        "unit": "Strips (10 tabs)",
        "mrp": 220,
        "purchaseRate": 165,
        "schedule": "Schedule H",
        "rackLocation": "Rack A-01",
        "minAlertThreshold": 25
      },
      {
        "id": "med-atm-02",
        "name": "Paracetamol 650mg",
        "saltName": "Paracetamol IP 650mg",
        "manufacturer": "Micro Labs Ltd",
        "batchNo": "BAT-GEN-101",
        "expiryDate": "2028-12-31",
        "quantity": 100,
        "unit": "Strips (10 tabs)",
        "mrp": 30,
        "purchaseRate": 20,
        "schedule": "OTC",
        "rackLocation": "Rack A-02",
        "minAlertThreshold": 20
      },
      {
        "id": "med-atm-03",
        "name": "Azithral 500 Tablet",
        "saltName": "Azithromycin 500mg",
        "manufacturer": "Alembic Pharmaceuticals",
        "batchNo": "AZ-8812",
        "expiryDate": "2027-06-30",
        "quantity": 60,
        "unit": "Strips (5 tabs)",
        "mrp": 132,
        "purchaseRate": 98,
        "schedule": "Schedule H1",
        "rackLocation": "Rack B-01",
        "minAlertThreshold": 15
      },
      {
        "id": "med-atm-04",
        "name": "Pan-D Capsule",
        "saltName": "Pantoprazole 40mg + Domperidone 30mg",
        "manufacturer": "Alkem Laboratories",
        "batchNo": "PAN-4412",
        "expiryDate": "2027-11-30",
        "quantity": 90,
        "unit": "Strips (15 caps)",
        "mrp": 215,
        "purchaseRate": 155,
        "schedule": "Schedule H",
        "rackLocation": "Rack B-02",
        "minAlertThreshold": 20
      }
    ],
    "galleryPhotos": [
      {
        "id": "gp-store-up-007-1",
        "tag": "Store Front",
        "url": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80",
        "title": "Storefront & Main Signboard",
        "caption": "Apoorva Tripathi Medicos, Saket Nagar, Station Road, Deoria",
        "isPrimary": true
      },
      {
        "id": "gp-store-up-007-2",
        "tag": "Dispensing",
        "url": "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80",
        "title": "Medicine Racks & Dispensing Desk",
        "caption": "Statutory medicine storage with UPPC pharmacist consultation counter",
        "isPrimary": false
      }
    ],
    "prescriptions": [
      {
        "id": "RX-APT-2026-001",
        "patientName": "Chandra Shekhar Shukla",
        "phone": "+91 80040 34320",
        "notes": "Prescribed Augmentin 625 and Pan-D 40 by District Hospital Deoria.",
        "fileName": "Rx_Sadar_Hospital_Deoria.pdf",
        "fileData": "",
        "createdAt": "08 Oct 2026, 03:10 PM",
        "timestamp": 1791471000000,
        "status": "Dispensed",
        "storeId": "store-up-007"
      },
      {
        "id": "RX-APT-2026-002",
        "patientName": "Meena Devi",
        "phone": "+91 94152 66781",
        "notes": "Paracetamol 650 and Azithral 500 for acute respiratory infection.",
        "fileName": "Rx_Clinic_Deoria.jpg",
        "fileData": "",
        "createdAt": "08 Oct 2026, 05:40 PM",
        "timestamp": 1791480000000,
        "status": "Pending",
        "storeId": "store-up-007"
      }
    ],
    "scheduleH1Register": [
      {
        "id": "H1-APT-2026-001",
        "date": "08 Oct 2026, 03:10 PM",
        "patientName": "Chandra Shekhar Shukla",
        "patientAge": "49",
        "docName": "Dr. Rajeshwar Mishra, MD",
        "docReg": "UPMC-M-28910",
        "rxId": "RX-APT-H1-1102",
        "medId": "med-apt-001",
        "medName": "Augmentin 625 Duo Tablet",
        "saltName": "Amoxicillin 500mg + Potassium Clavulanate 125mg",
        "batchNo": "BAT-AUG-9912",
        "expiryDate": "2027-08-31",
        "schedule": "Schedule H",
        "quantity": 2,
        "unit": "Strips (10 tabs)",
        "mrp": 220,
        "subtotal": 440,
        "tax": 52.8,
        "totalBill": 492.8,
        "pharmacistName": "Apoorva Tripathi",
        "pharmacistReg": "UPPC-PH-44219"
      }
    ],
    "staffDutyLog": [
      {
        "id": "DUTY-APT-901",
        "timestamp": "08 Oct 2026, 08:30 AM",
        "staffId": "st-apt-701",
        "staffName": "Apoorva Tripathi",
        "uppcRegNo": "UPPC-PH-44219",
        "qualification": "B.Pharm, R.Ph (UPPC)",
        "action": "CLOCK_IN",
        "method": "Aadhaar Biometric Match Verified",
        "status": "Present On Duty (Chief Pharmacist)"
      },
      {
        "id": "DUTY-APT-902",
        "timestamp": "07 Oct 2026, 09:00 AM",
        "staffId": "st-apt-701",
        "staffName": "Apoorva Tripathi",
        "uppcRegNo": "UPPC-PH-44219",
        "qualification": "B.Pharm, R.Ph (UPPC)",
        "action": "CLOCK_IN",
        "method": "Aadhaar Biometric Match Verified",
        "status": "Shift Duty Verified"
      }
    ],
    "purchaseExpenses": [
      {
        "id": "PO-APT-2026-101",
        "date": "05 Oct 2026, 10:30 AM",
        "vendor": "Eastern UP Pharma C&F Syndicate, Gorakhpur",
        "itemsCount": 4,
        "unitsAdded": 300,
        "totalAmount": 41200,
        "status": "Stock Received in Rack"
      }
    ],
    "revenueData": {
      "todaySales": 16500,
      "monthlyGross": 480000,
      "lastMonthGross": 440000,
      "avgGrossMarginPercent": 22,
      "totalOrdersThisMonth": 580,
      "digitalSplitPercent": 70,
      "cashSplitPercent": 30,
      "gstCollectedMonthly": 57600,
      "monthlyHistory": [
        {
          "month": "Aug",
          "revenue": 410000,
          "digital": 270000,
          "cash": 140000
        },
        {
          "month": "Sep",
          "revenue": 440000,
          "digital": 295000,
          "cash": 145000
        },
        {
          "month": "Oct (Current)",
          "revenue": 480000,
          "digital": 336000,
          "cash": 144000
        }
      ],
      "paymentChannels": {
        "upi": 60,
        "cards": 10,
        "cash": 30
      },
      "transactions": [
        {
          "id": "BILL-APT-1101",
          "date": "08 Oct 2026, 03:10 PM",
          "patientName": "Chandra Shekhar Shukla",
          "patientAge": "49",
          "docName": "Dr. Rajeshwar Mishra, MD",
          "docReg": "UPMC-M-28910",
          "rxId": "RX-APT-H1-1102",
          "medId": "med-apt-001",
          "medName": "Augmentin 625 Duo Tablet",
          "saltName": "Amoxicillin 500mg + Potassium Clavulanate 125mg",
          "batchNo": "BAT-AUG-9912",
          "expiryDate": "2027-08-31",
          "schedule": "Schedule H",
          "quantity": 2,
          "unit": "Strips (10 tabs)",
          "mrp": 220,
          "totalBill": 492.8,
          "mode": "UPI",
          "pharmacistName": "Apoorva Tripathi"
        }
      ]
    }
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { INITIAL_STORES_DATA };
}
