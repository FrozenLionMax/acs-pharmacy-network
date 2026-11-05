const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataPath = path.join(__dirname, '..', 'data.js');
let code = fs.readFileSync(dataPath, 'utf8');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code.replace('const INITIAL_STORES_DATA', 'var INITIAL_STORES_DATA'), sandbox);
const stores = sandbox.INITIAL_STORES_DATA;

const enrichments = {
  'store-up-002': {
    prescriptions: [
      {
        id: 'RX-MVM-2026-001',
        patientName: 'Anand Prakash Pandey',
        phone: '+91 94152 77810',
        notes: 'Prescribed Azithral 500 and Pantocid 40 for throat infection by Sadar Hospital Deoria.',
        fileName: 'Rx_Sadar_Hospital_Deoria.pdf',
        fileData: '',
        createdAt: '07 Oct 2026, 05:15 PM',
        timestamp: 1791392100000,
        status: 'Dispensed',
        storeId: 'store-up-002'
      },
      {
        id: 'RX-MVM-2026-002',
        patientName: 'Sunita Devi',
        phone: '+91 94508 12344',
        notes: 'Dolo 650 and Liv.52 DS Syrup prescribed for viral fever.',
        fileName: 'Rx_Dr_Mishra.jpg',
        fileData: '',
        createdAt: '08 Oct 2026, 11:00 AM',
        timestamp: 1791456000000,
        status: 'Pending',
        storeId: 'store-up-002'
      }
    ],
    scheduleH1Register: [
      {
        id: 'H1-MVM-2026-001',
        date: '07 Oct 2026, 05:15 PM',
        patientName: 'Anand Prakash Pandey',
        patientAge: '38',
        docName: 'Dr. R.K. Mishra, MD',
        docReg: 'UPMC-M-34190',
        rxId: 'RX-MVM-H1-4192',
        medId: 'med-mvm-01',
        medName: 'Azithral 500 Tablet',
        saltName: 'Azithromycin 500mg',
        batchNo: 'BAT-AZI-9901',
        expiryDate: '2027-06-30',
        schedule: 'Schedule H1',
        quantity: 2,
        unit: 'Strips (5 tabs)',
        mrp: 132.00,
        subtotal: 264.00,
        tax: 31.68,
        totalBill: 295.68,
        pharmacistName: 'Vivek Mishra',
        pharmacistReg: 'UPPC-PH-33120'
      }
    ],
    staffDutyLog: [
      {
        id: 'DUTY-MVM-901',
        timestamp: '08 Oct 2026, 08:30 AM',
        staffId: 'st-mvm-201',
        staffName: 'Vivek Mishra',
        uppcRegNo: 'UPPC-PH-33120',
        qualification: 'B.Pharm (UP Tech Univ)',
        action: 'CLOCK_IN',
        method: 'Aadhaar Biometric Match Verified',
        status: 'Present On Duty (Chief Pharmacist)'
      },
      {
        id: 'DUTY-MVM-902',
        timestamp: '07 Oct 2026, 04:00 PM',
        staffId: 'st-mvm-202',
        staffName: 'Sunil Kumar Tiwari',
        uppcRegNo: 'UPPC-PH-41902',
        qualification: 'D.Pharm (BTE UP)',
        action: 'CLOCK_IN',
        method: 'Aadhaar Biometric Match Verified',
        status: 'Evening Shift Duty Verified'
      }
    ],
    purchaseExpenses: [
      {
        id: 'PO-MVM-2026-101',
        date: '05 Oct 2026, 02:30 PM',
        vendor: 'Gorakhpur Regional Drug House',
        itemsCount: 4,
        unitsAdded: 280,
        totalAmount: 36400.00,
        status: 'Stock Received in Rack'
      }
    ],
    transactions: [
      {
        id: 'BILL-MVM-7701',
        date: '07 Oct 2026, 05:15 PM',
        patientName: 'Anand Prakash Pandey',
        patientAge: '38',
        docName: 'Dr. R.K. Mishra, MD',
        docReg: 'UPMC-M-34190',
        rxId: 'RX-MVM-H1-4192',
        medId: 'med-mvm-01',
        medName: 'Azithral 500 Tablet',
        saltName: 'Azithromycin 500mg',
        batchNo: 'BAT-AZI-9901',
        expiryDate: '2027-06-30',
        schedule: 'Schedule H1',
        quantity: 2,
        unit: 'Strips (5 tabs)',
        mrp: 132.00,
        totalBill: 295.68,
        mode: 'UPI',
        pharmacistName: 'Vivek Mishra'
      }
    ]
  },
  'store-up-003': {
    prescriptions: [
      {
        id: 'RX-KMS-2026-001',
        patientName: 'Virendra Pratap Yadav',
        phone: '+91 98391 44552',
        notes: 'Amoxicillin and Cefixime prescribed by Emergency Ward.',
        fileName: 'Emergency_Rx_Civil_Lines.pdf',
        fileData: '',
        createdAt: '08 Oct 2026, 01:20 PM',
        timestamp: 1791464400000,
        status: 'Dispensed',
        storeId: 'store-up-003'
      }
    ],
    scheduleH1Register: [
      {
        id: 'H1-KMS-2026-001',
        date: '08 Oct 2026, 01:20 PM',
        patientName: 'Virendra Pratap Yadav',
        patientAge: '52',
        docName: 'Dr. S.P. Singh, MS (Ortho)',
        docReg: 'UPMC-M-22104',
        rxId: 'RX-KMS-H1-1049',
        medId: 'med-kms-01',
        medName: 'Taxim-O 200 Tablet',
        saltName: 'Cefixime 200mg',
        batchNo: 'BAT-TAX-2201',
        expiryDate: '2027-09-15',
        schedule: 'Schedule H1',
        quantity: 2,
        unit: 'Strips (10 tabs)',
        mrp: 168.00,
        subtotal: 336.00,
        tax: 40.32,
        totalBill: 376.32,
        pharmacistName: 'Ramesh Chandra Kushwaha',
        pharmacistReg: 'UPPC-PH-28109'
      }
    ],
    staffDutyLog: [
      {
        id: 'DUTY-KMS-901',
        timestamp: '08 Oct 2026, 08:00 AM',
        staffId: 'st-kms-301',
        staffName: 'Ramesh Chandra Kushwaha',
        uppcRegNo: 'UPPC-PH-28109',
        qualification: 'B.Pharm (Deoria Tech)',
        action: 'CLOCK_IN',
        method: 'Aadhaar Biometric Match Verified',
        status: 'Present On Duty (24x7 Shift Lead)'
      }
    ],
    purchaseExpenses: [
      {
        id: 'PO-KMS-2026-101',
        date: '04 Oct 2026, 10:15 AM',
        vendor: 'Eastern UP Surgical & Pharma Agency',
        itemsCount: 6,
        unitsAdded: 410,
        totalAmount: 51200.00,
        status: 'Stock Received in Rack'
      }
    ],
    transactions: [
      {
        id: 'BILL-KMS-9901',
        date: '08 Oct 2026, 01:20 PM',
        patientName: 'Virendra Pratap Yadav',
        patientAge: '52',
        docName: 'Dr. S.P. Singh, MS',
        docReg: 'UPMC-M-22104',
        rxId: 'RX-KMS-H1-1049',
        medId: 'med-kms-01',
        medName: 'Taxim-O 200 Tablet',
        saltName: 'Cefixime 200mg',
        batchNo: 'BAT-TAX-2201',
        expiryDate: '2027-09-15',
        schedule: 'Schedule H1',
        quantity: 2,
        unit: 'Strips (10 tabs)',
        mrp: 168.00,
        totalBill: 376.32,
        mode: 'Cash',
        pharmacistName: 'Ramesh Chandra Kushwaha'
      }
    ]
  },
  'store-up-004': {
    prescriptions: [
      {
        id: 'RX-RAG-2026-001',
        patientName: 'Pooja Chaurasia',
        phone: '+91 94158 99012',
        notes: 'Pantocid 40 and Calpol 500 prescribed for gastroenteritis.',
        fileName: 'Rx_Dr_Gupta.pdf',
        fileData: '',
        createdAt: '07 Oct 2026, 06:45 PM',
        timestamp: 1791397500000,
        status: 'Dispensed',
        storeId: 'store-up-004'
      }
    ],
    scheduleH1Register: [
      {
        id: 'H1-RAG-2026-001',
        date: '07 Oct 2026, 06:45 PM',
        patientName: 'Pooja Chaurasia',
        patientAge: '29',
        docName: 'Dr. Anita Gupta, DGO',
        docReg: 'UPMC-M-44129',
        rxId: 'RX-RAG-H1-6621',
        medId: 'med-rcd-01',
        medName: 'Augmentin 625 Duo Tablet',
        saltName: 'Amoxicillin + Clavulanate',
        batchNo: 'BAT-AUG-7712',
        expiryDate: '2027-04-30',
        schedule: 'Schedule H',
        quantity: 1,
        unit: 'Strips (10 tabs)',
        mrp: 223.50,
        subtotal: 223.50,
        tax: 26.82,
        totalBill: 250.32,
        pharmacistName: 'Raghavendra Pratap Singh',
        pharmacistReg: 'UPPC-PH-41290'
      }
    ],
    staffDutyLog: [
      {
        id: 'DUTY-RAG-901',
        timestamp: '08 Oct 2026, 09:30 AM',
        staffId: 'st-rcd-401',
        staffName: 'Raghavendra Pratap Singh',
        uppcRegNo: 'UPPC-PH-41290',
        qualification: 'D.Pharm (BTEUP Lucknow)',
        action: 'CLOCK_IN',
        method: 'Aadhaar Biometric Match Verified',
        status: 'Present On Duty (Incharge)'
      }
    ],
    purchaseExpenses: [
      {
        id: 'PO-RAG-2026-101',
        date: '03 Oct 2026, 03:00 PM',
        vendor: 'Gorakhpur Depot C&F',
        itemsCount: 3,
        unitsAdded: 210,
        totalAmount: 28500.00,
        status: 'Stock Received in Rack'
      }
    ],
    transactions: [
      {
        id: 'BILL-RAG-5501',
        date: '07 Oct 2026, 06:45 PM',
        patientName: 'Pooja Chaurasia',
        patientAge: '29',
        docName: 'Dr. Anita Gupta, DGO',
        docReg: 'UPMC-M-44129',
        rxId: 'RX-RAG-H1-6621',
        medId: 'med-rcd-01',
        medName: 'Augmentin 625 Duo Tablet',
        saltName: 'Amoxicillin + Clavulanate',
        batchNo: 'BAT-AUG-7712',
        expiryDate: '2027-04-30',
        schedule: 'Schedule H',
        quantity: 1,
        unit: 'Strips (10 tabs)',
        mrp: 223.50,
        totalBill: 250.32,
        mode: 'UPI',
        pharmacistName: 'Raghavendra Pratap Singh'
      }
    ]
  },
  'store-up-005': {
    prescriptions: [
      {
        id: 'RX-GAN-2026-001',
        patientName: 'Harish Chandra Nigam',
        phone: '+91 94150 11982',
        notes: 'Cardiovascular maintenance medications prescribed by GSVM Medical College Kanpur.',
        fileName: 'Rx_GSVM_Kanpur.pdf',
        fileData: '',
        createdAt: '08 Oct 2026, 11:15 AM',
        timestamp: 1791456900000,
        status: 'Dispensed',
        storeId: 'store-up-005'
      }
    ],
    scheduleH1Register: [
      {
        id: 'H1-GAN-2026-001',
        date: '08 Oct 2026, 11:15 AM',
        patientName: 'Harish Chandra Nigam',
        patientAge: '61',
        docName: 'Dr. V.K. Agrawal, DM (Cardio)',
        docReg: 'UPMC-M-18721',
        rxId: 'RX-GAN-H1-3310',
        medId: 'med-gmh-01',
        medName: 'Telma-H 40mg/12.5mg',
        saltName: 'Telmisartan + Hydrochlorothiazide',
        batchNo: 'BAT-TEL-8819',
        expiryDate: '2027-08-31',
        schedule: 'Schedule H',
        quantity: 3,
        unit: 'Strips (15 tabs)',
        mrp: 245.00,
        subtotal: 735.00,
        tax: 88.20,
        totalBill: 823.20,
        pharmacistName: 'Alok Kumar Gupta',
        pharmacistReg: 'UPPC-PH-24156'
      }
    ],
    staffDutyLog: [
      {
        id: 'DUTY-GAN-901',
        timestamp: '08 Oct 2026, 08:30 AM',
        staffId: 'st-gmh-501',
        staffName: 'Alok Kumar Gupta',
        uppcRegNo: 'UPPC-PH-24156',
        qualification: 'B.Pharm (Kanpur Univ)',
        action: 'CLOCK_IN',
        method: 'Aadhaar Biometric Match Verified',
        status: 'Present On Duty (Chief Pharmacist)'
      }
    ],
    purchaseExpenses: [
      {
        id: 'PO-GAN-2026-101',
        date: '02 Oct 2026, 01:30 PM',
        vendor: 'Kanpur Central Wholesale Drug Syndicate',
        itemsCount: 8,
        unitsAdded: 600,
        totalAmount: 89000.00,
        status: 'Stock Received in Rack'
      }
    ],
    transactions: [
      {
        id: 'BILL-GAN-4401',
        date: '08 Oct 2026, 11:15 AM',
        patientName: 'Harish Chandra Nigam',
        patientAge: '61',
        docName: 'Dr. V.K. Agrawal, DM',
        docReg: 'UPMC-M-18721',
        rxId: 'RX-GAN-H1-3310',
        medId: 'med-gmh-01',
        medName: 'Telma-H 40mg/12.5mg',
        saltName: 'Telmisartan + Hydrochlorothiazide',
        batchNo: 'BAT-TEL-8819',
        expiryDate: '2027-08-31',
        schedule: 'Schedule H',
        quantity: 3,
        unit: 'Strips (15 tabs)',
        mrp: 245.00,
        totalBill: 823.20,
        mode: 'UPI',
        pharmacistName: 'Alok Kumar Gupta'
      }
    ]
  },
  'store-up-006': {
    prescriptions: [
      {
        id: 'RX-AWD-2026-001',
        patientName: 'Kavita Mehrotra',
        phone: '+91 98390 12099',
        notes: 'Prescribed by KGMU Lucknow for post-surgical recovery.',
        fileName: 'Rx_KGMU_Lucknow.pdf',
        fileData: '',
        createdAt: '08 Oct 2026, 12:40 PM',
        timestamp: 1791462000000,
        status: 'Dispensed',
        storeId: 'store-up-006'
      }
    ],
    scheduleH1Register: [
      {
        id: 'H1-AWD-2026-001',
        date: '08 Oct 2026, 12:40 PM',
        patientName: 'Kavita Mehrotra',
        patientAge: '42',
        docName: 'Dr. S.K. Bhargava, MCh',
        docReg: 'UPMC-M-15409',
        rxId: 'RX-AWD-H1-9018',
        medId: 'med-acc-01',
        medName: 'Monocef 1g Injection',
        saltName: 'Ceftriaxone Sodium Sterile 1000mg',
        batchNo: 'BAT-MON-4410',
        expiryDate: '2027-11-30',
        schedule: 'Schedule H1',
        quantity: 4,
        unit: 'Vials (1g)',
        mrp: 68.50,
        subtotal: 274.00,
        tax: 32.88,
        totalBill: 306.88,
        pharmacistName: 'Dr. Manvendra Pratap Singh',
        pharmacistReg: 'UPPC-PH-19842'
      }
    ],
    staffDutyLog: [
      {
        id: 'DUTY-AWD-901',
        timestamp: '08 Oct 2026, 08:45 AM',
        staffId: 'st-acc-601',
        staffName: 'Dr. Manvendra Pratap Singh',
        uppcRegNo: 'UPPC-PH-19842',
        qualification: 'Pharm.D, B.Pharm (KGMU Lucknow)',
        action: 'CLOCK_IN',
        method: 'Aadhaar Biometric Match Verified',
        status: 'Present On Duty (Director Pharmacist)'
      }
    ],
    purchaseExpenses: [
      {
        id: 'PO-AWD-2026-101',
        date: '01 Oct 2026, 11:00 AM',
        vendor: 'Lucknow State Drug Depot C&F',
        itemsCount: 10,
        unitsAdded: 750,
        totalAmount: 112000.00,
        status: 'Stock Received in Rack'
      }
    ],
    transactions: [
      {
        id: 'BILL-AWD-3301',
        date: '08 Oct 2026, 12:40 PM',
        patientName: 'Kavita Mehrotra',
        patientAge: '42',
        docName: 'Dr. S.K. Bhargava, MCh',
        docReg: 'UPMC-M-15409',
        rxId: 'RX-AWD-H1-9018',
        medId: 'med-acc-01',
        medName: 'Monocef 1g Injection',
        saltName: 'Ceftriaxone Sodium Sterile 1000mg',
        batchNo: 'BAT-MON-4410',
        expiryDate: '2027-11-30',
        schedule: 'Schedule H1',
        quantity: 4,
        unit: 'Vials (1g)',
        mrp: 68.50,
        totalBill: 306.88,
        mode: 'Card',
        pharmacistName: 'Dr. Manvendra Pratap Singh'
      }
    ]
  },
  'store-up-007': {
    prescriptions: [
      {
        id: 'RX-APT-2026-001',
        patientName: 'Chandra Shekhar Shukla',
        phone: '+91 80040 34320',
        notes: 'Prescribed Augmentin 625 and Pan-D 40 by District Hospital Deoria.',
        fileName: 'Rx_Sadar_Hospital_Deoria.pdf',
        fileData: '',
        createdAt: '08 Oct 2026, 03:10 PM',
        timestamp: 1791471000000,
        status: 'Dispensed',
        storeId: 'store-up-007'
      },
      {
        id: 'RX-APT-2026-002',
        patientName: 'Meena Devi',
        phone: '+91 94152 66781',
        notes: 'Paracetamol 650 and Azithral 500 for acute respiratory infection.',
        fileName: 'Rx_Clinic_Deoria.jpg',
        fileData: '',
        createdAt: '08 Oct 2026, 05:40 PM',
        timestamp: 1791480000000,
        status: 'Pending',
        storeId: 'store-up-007'
      }
    ],
    scheduleH1Register: [
      {
        id: 'H1-APT-2026-001',
        date: '08 Oct 2026, 03:10 PM',
        patientName: 'Chandra Shekhar Shukla',
        patientAge: '49',
        docName: 'Dr. Rajeshwar Mishra, MD',
        docReg: 'UPMC-M-28910',
        rxId: 'RX-APT-H1-1102',
        medId: 'med-apt-001',
        medName: 'Augmentin 625 Duo Tablet',
        saltName: 'Amoxicillin 500mg + Potassium Clavulanate 125mg',
        batchNo: 'BAT-AUG-9912',
        expiryDate: '2027-08-31',
        schedule: 'Schedule H',
        quantity: 2,
        unit: 'Strips (10 tabs)',
        mrp: 220.00,
        subtotal: 440.00,
        tax: 52.80,
        totalBill: 492.80,
        pharmacistName: 'Apoorva Tripathi',
        pharmacistReg: 'UPPC-PH-44219'
      }
    ],
    staffDutyLog: [
      {
        id: 'DUTY-APT-901',
        timestamp: '08 Oct 2026, 08:30 AM',
        staffId: 'st-apt-701',
        staffName: 'Apoorva Tripathi',
        uppcRegNo: 'UPPC-PH-44219',
        qualification: 'B.Pharm, R.Ph (UPPC)',
        action: 'CLOCK_IN',
        method: 'Aadhaar Biometric Match Verified',
        status: 'Present On Duty (Chief Pharmacist)'
      },
      {
        id: 'DUTY-APT-902',
        timestamp: '07 Oct 2026, 09:00 AM',
        staffId: 'st-apt-701',
        staffName: 'Apoorva Tripathi',
        uppcRegNo: 'UPPC-PH-44219',
        qualification: 'B.Pharm, R.Ph (UPPC)',
        action: 'CLOCK_IN',
        method: 'Aadhaar Biometric Match Verified',
        status: 'Shift Duty Verified'
      }
    ],
    purchaseExpenses: [
      {
        id: 'PO-APT-2026-101',
        date: '05 Oct 2026, 10:30 AM',
        vendor: 'Eastern UP Pharma C&F Syndicate, Gorakhpur',
        itemsCount: 4,
        unitsAdded: 300,
        totalAmount: 41200.00,
        status: 'Stock Received in Rack'
      }
    ],
    transactions: [
      {
        id: 'BILL-APT-1101',
        date: '08 Oct 2026, 03:10 PM',
        patientName: 'Chandra Shekhar Shukla',
        patientAge: '49',
        docName: 'Dr. Rajeshwar Mishra, MD',
        docReg: 'UPMC-M-28910',
        rxId: 'RX-APT-H1-1102',
        medId: 'med-apt-001',
        medName: 'Augmentin 625 Duo Tablet',
        saltName: 'Amoxicillin 500mg + Potassium Clavulanate 125mg',
        batchNo: 'BAT-AUG-9912',
        expiryDate: '2027-08-31',
        schedule: 'Schedule H',
        quantity: 2,
        unit: 'Strips (10 tabs)',
        mrp: 220.00,
        totalBill: 492.80,
        mode: 'UPI',
        pharmacistName: 'Apoorva Tripathi'
      }
    ]
  }
};

stores.forEach(s => {
  if (enrichments[s.id]) {
    const e = enrichments[s.id];
    s.prescriptions = e.prescriptions;
    s.scheduleH1Register = e.scheduleH1Register;
    s.staffDutyLog = e.staffDutyLog;
    s.purchaseExpenses = e.purchaseExpenses;
    if (!s.revenueData) s.revenueData = {};
    s.revenueData.transactions = e.transactions;
  }
});

const newCode = '/**\n * ACS (Akhil Consultancy Services) - Core Pharmacy & Medicine Dataset\n * Uttar Pradesh Pharmacy Network Registry\n */\n\nconst INITIAL_STORES_DATA = ' + JSON.stringify(stores, null, 2) + ';\n\nif (typeof module !== "undefined" && module.exports) {\n  module.exports = { INITIAL_STORES_DATA };\n}\n';

fs.writeFileSync(dataPath, newCode, 'utf8');
console.log('Successfully enriched all stores in data.js with authentic logs!');
