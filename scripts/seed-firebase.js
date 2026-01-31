/**
 * Firebase Firestore Data Seeding Script
 * Populates the Firestore database with sample order data
 * 
 * Usage:
 *   node scripts/seed-firebase.js
 * 
 * Prerequisites:
 *   1. firebase-admin installed (npm install firebase-admin)
 *   2. One of the following:
 *      a) Service account JSON file at src/app/config/service-account.json
 *      b) GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to service account file
 *      c) Firebase credentials in environment variables
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
function initializeFirebase() {
  const serviceAccountPath = path.join(__dirname, '../src/app/config/service-account.json');
  let initialized = false;
  
  // Try 1: Service account file
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      // Validate service account has required fields
      if (serviceAccount.type && serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
        console.log('✅ Firebase initialized with service account credentials');
        initialized = true;
      } else {
        console.warn('⚠️  Service account file missing required fields');
      }
    } catch (error) {
      console.warn('⚠️  Could not parse service account file:', error.message);
    }
  }
  
  // Try 2: Environment variable GOOGLE_APPLICATION_CREDENTIALS
  if (!initialized && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      admin.initializeApp({
        projectId: 'order-processing-system-619b4'
      });
      console.log('✅ Firebase initialized with GOOGLE_APPLICATION_CREDENTIALS');
      initialized = true;
    } catch (error) {
      console.warn('⚠️  Could not use GOOGLE_APPLICATION_CREDENTIALS:', error.message);
    }
  }
  
  // Try 3: Individual environment variables
  if (!initialized) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'order-processing-system-619b4';
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    
    if (privateKey && clientEmail) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            type: 'service_account',
            project_id: projectId,
            private_key: privateKey,
            client_email: clientEmail,
            client_id: process.env.FIREBASE_CLIENT_ID || '113736093111849839797'
          }),
          projectId: projectId
        });
        console.log('✅ Firebase initialized with environment variables');
        initialized = true;
      } catch (error) {
        console.warn('⚠️  Could not use environment variables:', error.message);
      }
    }
  }
  
  if (!initialized) {
    console.error('\n❌ ERROR: Could not initialize Firebase. Please provide credentials in one of these ways:\n');
    console.error('Option 1: Service Account File');
    console.error('  └─ Create: src/app/config/service-account.json');
    console.error('  └─ Get from: Firebase Console > Settings > Service Accounts > Generate New Private Key\n');
    console.error('Option 2: Environment Variable');
    console.error('  └─ Set: GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json\n');
    console.error('Option 3: Individual Environment Variables');
    console.error('  └─ Set: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_CLIENT_ID\n');
    console.error('More info: https://firebase.google.com/docs/admin/setup\n');
    process.exit(1);
  }
  
  return admin.firestore();
}

const db = initializeFirebase();

// Sample data matching order.service.ts mock data
const orders = [
  {
    id: 'ORD-1001',
    orderNumber: 'ORD-1001',
    salesOrderId: 'SO-2001',
    salesOrderNumber: 'SO-2001',
    itemDetails: {
      productType: 'CS',
      general: { symagPartNo: 'SP-001', moq: 100 },
      materialAndDimensions: { diameter: 10, height: 50, material: 'Steel' },
      loadsRatesDeflection: { load: 100, rate: 2.5, deflection: 5 }
    },
    jobCardId: 'JC-5001',
    quantity: 500,
    createdDate: new Date('2024-01-15'),
    status: 'COMPLETED'
  },
  {
    id: 'ORD-1002',
    orderNumber: 'ORD-1002',
    salesOrderId: 'SO-2001',
    salesOrderNumber: 'SO-2001',
    itemDetails: {
      productType: 'CCS',
      general: { symagPartNo: 'SP-002', moq: 150 },
      materialAndDimensions: { diameter: 12, height: 60, material: 'Stainless Steel' },
      loadsRatesDeflection: { load: 150, rate: 3.0, deflection: 6 }
    },
    jobCardId: 'JC-5002',
    quantity: 600,
    createdDate: new Date('2024-01-16'),
    status: 'COMPLETED'
  },
  {
    id: 'ORD-1003',
    orderNumber: 'ORD-1003',
    salesOrderId: 'SO-2002',
    salesOrderNumber: 'SO-2002',
    itemDetails: {
      productType: 'ES',
      general: { symagPartNo: 'SP-003', moq: 200 },
      materialAndDimensions: { diameter: 15, height: 70, material: 'Steel' },
      loadsRatesDeflection: { load: 200, rate: 3.5, deflection: 7 }
    },
    jobCardId: 'JC-5003',
    quantity: 700,
    createdDate: new Date('2024-01-17'),
    status: 'IN_PRODUCTION'
  },
  {
    id: 'ORD-1004',
    orderNumber: 'ORD-1004',
    salesOrderId: 'SO-2002',
    salesOrderNumber: 'SO-2002',
    itemDetails: {
      productType: 'TS',
      general: { symagPartNo: 'SP-004', moq: 100 },
      materialAndDimensions: { diameter: 8, height: 45, material: 'Titanium' },
      loadsRatesDeflection: { load: 80, rate: 2.0, deflection: 4 }
    },
    jobCardId: 'JC-5004',
    quantity: 400,
    createdDate: new Date('2024-01-18'),
    status: 'IN_PRODUCTION'
  },
  {
    id: 'ORD-1005',
    orderNumber: 'ORD-1005',
    salesOrderId: 'SO-2003',
    salesOrderNumber: 'SO-2003',
    itemDetails: {
      productType: 'DTS',
      general: { symagPartNo: 'SP-005', moq: 120 },
      materialAndDimensions: { diameter: 10, height: 55, material: 'Steel' },
      loadsRatesDeflection: { load: 110, rate: 2.8, deflection: 5.5 }
    },
    jobCardId: 'JC-5005',
    quantity: 550,
    createdDate: new Date('2024-01-19'),
    status: 'PENDING'
  },
  {
    id: 'ORD-1006',
    orderNumber: 'ORD-1006',
    salesOrderId: 'SO-2003',
    salesOrderNumber: 'SO-2003',
    itemDetails: {
      productType: 'WF',
      general: { symagPartNo: 'SP-006', moq: 180 },
      materialAndDimensions: { diameter: 14, height: 65, material: 'Stainless Steel' },
      loadsRatesDeflection: { load: 180, rate: 3.2, deflection: 6.5 }
    },
    jobCardId: 'JC-5006',
    quantity: 650,
    createdDate: new Date('2024-01-20'),
    status: 'PENDING'
  },
  {
    id: 'ORD-1007',
    orderNumber: 'ORD-1007',
    salesOrderId: 'SO-2004',
    salesOrderNumber: 'SO-2004',
    itemDetails: {
      productType: 'PP',
      general: { symagPartNo: 'SP-007', moq: 140 },
      materialAndDimensions: { diameter: 11, height: 58, material: 'Steel' },
      loadsRatesDeflection: { load: 130, rate: 2.9, deflection: 5.8 }
    },
    jobCardId: 'JC-5007',
    quantity: 580,
    createdDate: new Date('2024-01-21'),
    status: 'PENDING'
  },
  {
    id: 'ORD-1008',
    orderNumber: 'ORD-1008',
    salesOrderId: 'SO-2004',
    salesOrderNumber: 'SO-2004',
    itemDetails: {
      productType: 'CS',
      general: { symagPartNo: 'SP-008', moq: 110 },
      materialAndDimensions: { diameter: 9, height: 48, material: 'Aluminum' },
      loadsRatesDeflection: { load: 90, rate: 2.3, deflection: 4.8 }
    },
    jobCardId: 'JC-5008',
    quantity: 480,
    createdDate: new Date('2024-01-22'),
    status: 'PENDING'
  },
  {
    id: 'ORD-1009',
    orderNumber: 'ORD-1009',
    salesOrderId: 'SO-2005',
    salesOrderNumber: 'SO-2005',
    itemDetails: {
      productType: 'CCS',
      general: { symagPartNo: 'SP-009', moq: 170 },
      materialAndDimensions: { diameter: 13, height: 62, material: 'Stainless Steel' },
      loadsRatesDeflection: { load: 170, rate: 3.1, deflection: 6.3 }
    },
    jobCardId: 'JC-5009',
    quantity: 620,
    createdDate: new Date('2024-01-23'),
    status: 'PENDING'
  },
  {
    id: 'ORD-1010',
    orderNumber: 'ORD-1010',
    salesOrderId: 'SO-2005',
    salesOrderNumber: 'SO-2005',
    itemDetails: {
      productType: 'ES',
      general: { symagPartNo: 'SP-010', moq: 160 },
      materialAndDimensions: { diameter: 16, height: 72, material: 'Steel' },
      loadsRatesDeflection: { load: 210, rate: 3.7, deflection: 7.2 }
    },
    jobCardId: 'JC-5010',
    quantity: 720,
    createdDate: new Date('2024-01-24'),
    status: 'PENDING'
  }
];

const salesOrders = [
  {
    id: 'SO-2001',
    salesOrderNumber: 'SO-2001',
    customerCode: 'CUST-001',
    customerName: 'ABC Manufacturing',
    createdDate: new Date('2024-01-15'),
    status: 'COMPLETED',
    remarks: 'Completed ahead of schedule'
  },
  {
    id: 'SO-2002',
    salesOrderNumber: 'SO-2002',
    customerCode: 'CUST-002',
    customerName: 'XYZ Industries',
    createdDate: new Date('2024-01-17'),
    status: 'PROCESSING',
    remarks: 'In production'
  },
  {
    id: 'SO-2003',
    salesOrderNumber: 'SO-2003',
    customerCode: 'CUST-003',
    customerName: 'Global Springs Ltd',
    createdDate: new Date('2024-01-19'),
    status: 'PROCESSING',
    remarks: 'On track for delivery'
  },
  {
    id: 'SO-2004',
    salesOrderNumber: 'SO-2004',
    customerCode: 'CUST-004',
    customerName: 'Tech Components Inc',
    createdDate: new Date('2024-01-21'),
    status: 'OPEN',
    remarks: 'Awaiting production'
  },
  {
    id: 'SO-2005',
    salesOrderNumber: 'SO-2005',
    customerCode: 'CUST-005',
    customerName: 'Industrial Solutions',
    createdDate: new Date('2024-01-23'),
    status: 'OPEN',
    remarks: 'Recently received'
  },
  {
    id: 'SO-2006',
    salesOrderNumber: 'SO-2006',
    customerCode: 'CUST-006',
    customerName: 'Premium Manufacturing',
    createdDate: new Date('2024-01-10'),
    status: 'COMPLETED',
    remarks: 'Quality approved'
  },
  {
    id: 'SO-2007',
    salesOrderNumber: 'SO-2007',
    customerCode: 'CUST-007',
    customerName: 'Automotive Parts Co',
    createdDate: new Date('2024-01-12'),
    status: 'COMPLETED',
    remarks: 'Delivered to customer'
  },
  {
    id: 'SO-2008',
    salesOrderNumber: 'SO-2008',
    customerCode: 'CUST-008',
    customerName: 'Heavy Equipment Ltd',
    createdDate: new Date('2024-01-14'),
    status: 'PROCESSING',
    remarks: 'Mid-stage production'
  },
  {
    id: 'SO-2009',
    salesOrderNumber: 'SO-2009',
    customerCode: 'CUST-009',
    customerName: 'Precision Engineers',
    createdDate: new Date('2024-01-25'),
    status: 'OPEN',
    remarks: 'New order'
  },
  {
    id: 'SO-2010',
    salesOrderNumber: 'SO-2010',
    customerCode: 'CUST-010',
    customerName: 'Dynamics Corporation',
    createdDate: new Date('2024-01-26'),
    status: 'OPEN',
    remarks: 'Pending review'
  }
];

const jobCards = [
  {
    id: 'JC-5001',
    orderId: 'ORD-1001',
    orderNumber: 'ORD-1001',
    salesOrderId: 'SO-2001',
    partDetails: {
      productType: 'CS',
      general: { symagPartNo: 'SP-001', moq: 100 },
      materialAndDimensions: { diameter: 10, height: 50, material: 'Steel' },
      loadsRatesDeflection: { load: 100, rate: 2.5, deflection: 5 }
    },
    quantity: 500,
    createdDate: new Date('2024-01-15'),
    completionDate: new Date('2024-01-20'),
    status: 'COMPLETED'
  },
  {
    id: 'JC-5002',
    orderId: 'ORD-1002',
    orderNumber: 'ORD-1002',
    salesOrderId: 'SO-2001',
    partDetails: {
      productType: 'CCS',
      general: { symagPartNo: 'SP-002', moq: 150 },
      materialAndDimensions: { diameter: 12, height: 60, material: 'Stainless Steel' },
      loadsRatesDeflection: { load: 150, rate: 3.0, deflection: 6 }
    },
    quantity: 600,
    createdDate: new Date('2024-01-16'),
    completionDate: new Date('2024-01-21'),
    status: 'COMPLETED'
  },
  {
    id: 'JC-5003',
    orderId: 'ORD-1003',
    orderNumber: 'ORD-1003',
    salesOrderId: 'SO-2002',
    partDetails: {
      productType: 'ES',
      general: { symagPartNo: 'SP-003', moq: 200 },
      materialAndDimensions: { diameter: 15, height: 70, material: 'Steel' },
      loadsRatesDeflection: { load: 200, rate: 3.5, deflection: 7 }
    },
    quantity: 700,
    createdDate: new Date('2024-01-17'),
    startDate: new Date('2024-01-18'),
    status: 'IN_PROGRESS'
  },
  {
    id: 'JC-5004',
    orderId: 'ORD-1004',
    orderNumber: 'ORD-1004',
    salesOrderId: 'SO-2002',
    partDetails: {
      productType: 'TS',
      general: { symagPartNo: 'SP-004', moq: 100 },
      materialAndDimensions: { diameter: 8, height: 45, material: 'Titanium' },
      loadsRatesDeflection: { load: 80, rate: 2.0, deflection: 4 }
    },
    quantity: 400,
    createdDate: new Date('2024-01-18'),
    startDate: new Date('2024-01-19'),
    status: 'IN_PROGRESS'
  },
  {
    id: 'JC-5005',
    orderId: 'ORD-1005',
    orderNumber: 'ORD-1005',
    salesOrderId: 'SO-2003',
    partDetails: {
      productType: 'DTS',
      general: { symagPartNo: 'SP-005', moq: 120 },
      materialAndDimensions: { diameter: 10, height: 55, material: 'Steel' },
      loadsRatesDeflection: { load: 110, rate: 2.8, deflection: 5.5 }
    },
    quantity: 550,
    createdDate: new Date('2024-01-19'),
    status: 'PENDING'
  },
  {
    id: 'JC-5006',
    orderId: 'ORD-1006',
    orderNumber: 'ORD-1006',
    salesOrderId: 'SO-2003',
    partDetails: {
      productType: 'WF',
      general: { symagPartNo: 'SP-006', moq: 180 },
      materialAndDimensions: { diameter: 14, height: 65, material: 'Stainless Steel' },
      loadsRatesDeflection: { load: 180, rate: 3.2, deflection: 6.5 }
    },
    quantity: 650,
    createdDate: new Date('2024-01-20'),
    status: 'PENDING'
  },
  {
    id: 'JC-5007',
    orderId: 'ORD-1007',
    orderNumber: 'ORD-1007',
    salesOrderId: 'SO-2004',
    partDetails: {
      productType: 'PP',
      general: { symagPartNo: 'SP-007', moq: 140 },
      materialAndDimensions: { diameter: 11, height: 58, material: 'Steel' },
      loadsRatesDeflection: { load: 130, rate: 2.9, deflection: 5.8 }
    },
    quantity: 580,
    createdDate: new Date('2024-01-21'),
    status: 'PENDING'
  },
  {
    id: 'JC-5008',
    orderId: 'ORD-1008',
    orderNumber: 'ORD-1008',
    salesOrderId: 'SO-2004',
    partDetails: {
      productType: 'CS',
      general: { symagPartNo: 'SP-008', moq: 110 },
      materialAndDimensions: { diameter: 9, height: 48, material: 'Aluminum' },
      loadsRatesDeflection: { load: 90, rate: 2.3, deflection: 4.8 }
    },
    quantity: 480,
    createdDate: new Date('2024-01-22'),
    status: 'PENDING'
  },
  {
    id: 'JC-5009',
    orderId: 'ORD-1009',
    orderNumber: 'ORD-1009',
    salesOrderId: 'SO-2005',
    partDetails: {
      productType: 'CCS',
      general: { symagPartNo: 'SP-009', moq: 170 },
      materialAndDimensions: { diameter: 13, height: 62, material: 'Stainless Steel' },
      loadsRatesDeflection: { load: 170, rate: 3.1, deflection: 6.3 }
    },
    quantity: 620,
    createdDate: new Date('2024-01-23'),
    status: 'PENDING'
  },
  {
    id: 'JC-5010',
    orderId: 'ORD-1010',
    orderNumber: 'ORD-1010',
    salesOrderId: 'SO-2005',
    partDetails: {
      productType: 'ES',
      general: { symagPartNo: 'SP-010', moq: 160 },
      materialAndDimensions: { diameter: 16, height: 72, material: 'Steel' },
      loadsRatesDeflection: { load: 210, rate: 3.7, deflection: 7.2 }
    },
    quantity: 720,
    createdDate: new Date('2024-01-24'),
    status: 'PENDING'
  }
];

/**
 * Product Master data - Sample products for Product Master catalog
 */
const products = [
  {
    id: 'PROD-001',
    productName: 'Standard Compression Spring - Steel',
    productType: 'CS',
    general: {
      symagPartNo: 'CS-001-STL',
      partWeightNet: 50,
      customerCode: 'CUST-001',
      customerPartNo: 'CP-001',
      customerPartNameNo: 'Spring Type A',
      moq: 100
    },
    materialAndDimensions: {
      materialType: 'Steel',
      mtlSpec: 'SAE 1070',
      wireDia: { value_mm: 2.0, tolerance_mm: 0.1 },
      outsideDia: { value_mm: 10.0, tolerance_mm: 0.2 },
      freeLength: { value_mm: 25.0, tolerance_mm: 0.5 },
      configuration: 'Closed and Ground'
    },
    loadsRatesDeflection: {
      springRate: { value_N_per_mm: 15.5, tolerance_N_per_mm: 0.5 },
      lengthAtLoad1_mm: 20,
      load1_N: 100,
      deflectionAtLoad1_mm: 5,
      operatingTemp_C: 80,
      cycles: 1000000,
      surfaceTreatment: 'Zinc',
      remark: 'Suitable for automotive applications'
    },
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'System',
    updatedBy: 'System'
  },
  {
    id: 'PROD-002',
    productName: 'Complex Coil Spring - Stainless Steel',
    productType: 'CCS',
    general: {
      symagPartNo: 'CCS-002-SS',
      partWeightNet: 75,
      customerCode: 'CUST-002',
      customerPartNo: 'CP-002',
      customerPartNameNo: 'Spring Type B',
      moq: 150
    },
    materialAndDimensions: {
      materialType: 'Stainless Steel',
      mtlSpec: 'ASTM A228',
      wireDia: { value_mm: 2.5, tolerance_mm: 0.15 },
      outsideDia: { value_mm: 12.0, tolerance_mm: 0.25 },
      freeLength: { value_mm: 30.0, tolerance_mm: 0.6 },
      configuration: 'Closed and Ground',
      totalCoils: 8,
      activeCoils: 6
    },
    loadsRatesDeflection: {
      springRate: { value_N_per_mm: 18.2, tolerance_N_per_mm: 0.6 },
      lengthAtLoad1_mm: 25,
      load1_N: 150,
      deflectionAtLoad1_mm: 6,
      operatingTemp_C: 120,
      cycles: 2000000,
      surfaceTreatment: 'Nickle',
      remark: 'Corrosion resistant for chemical industry'
    },
    status: 'ACTIVE',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    createdBy: 'System',
    updatedBy: 'System'
  },
  {
    id: 'PROD-003',
    productName: 'Extension Spring - Alloy Steel',
    productType: 'ES',
    general: {
      symagPartNo: 'ES-003-AS',
      partWeightNet: 40,
      customerCode: 'CUST-003',
      customerPartNo: 'CP-003',
      customerPartNameNo: 'Spring Type C',
      moq: 200
    },
    materialAndDimensions: {
      materialType: 'Alloy Steel',
      mtlSpec: 'SAE 1095',
      wireDia: { value_mm: 1.8, tolerance_mm: 0.08 },
      outsideDia: { value_mm: 9.0, tolerance_mm: 0.18 },
      freeLength: { value_mm: 50.0, tolerance_mm: 1.0 },
      configuration: 'Extended Length',
      endType: 'Open Loop'
    },
    loadsRatesDeflection: {
      springRate: { value_N_per_mm: 12.8, tolerance_N_per_mm: 0.4 },
      lengthAtLoad1_mm: 45,
      load1_N: 80,
      deflectionAtLoad1_mm: 4,
      operatingTemp_C: 100,
      cycles: 500000,
      surfaceTreatment: 'Powder Coating',
      remark: 'Used in machinery and mechanical systems'
    },
    status: 'ACTIVE',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    createdBy: 'System',
    updatedBy: 'System'
  },
  {
    id: 'PROD-004',
    productName: 'Torsion Spring - High Carbon Steel',
    productType: 'TS',
    general: {
      symagPartNo: 'TS-004-HCS',
      partWeightNet: 35,
      customerCode: 'CUST-004',
      customerPartNo: 'CP-004',
      customerPartNameNo: 'Spring Type D',
      moq: 120
    },
    materialAndDimensions: {
      materialType: 'High Carbon Steel',
      mtlSpec: 'ASTM A227',
      wireDia: { value_mm: 2.2, tolerance_mm: 0.12 },
      outsideDia: { value_mm: 11.0, tolerance_mm: 0.22 },
      freeLength: { value_mm: 28.0, tolerance_mm: 0.5 },
      configuration: 'Torque Spring',
      helix: 'RHS'
    },
    loadsRatesDeflection: {
      springRate: { value_N_per_mm: 14.5, tolerance_N_per_mm: 0.5 },
      operatingTemp_C: 90,
      cycles: 1500000,
      surfaceTreatment: 'Zinc',
      remark: 'Suitable for rotational applications'
    },
    status: 'ACTIVE',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
    createdBy: 'System',
    updatedBy: 'System'
  },
  {
    id: 'PROD-005',
    productName: 'Double Torsion Spring - Titanium',
    productType: 'DTS',
    general: {
      symagPartNo: 'DTS-005-TI',
      partWeightNet: 55,
      customerCode: 'CUST-005',
      customerPartNo: 'CP-005',
      customerPartNameNo: 'Spring Type E',
      moq: 80
    },
    materialAndDimensions: {
      materialType: 'Titanium Alloy',
      mtlSpec: 'ASTM B348',
      wireDia: { value_mm: 2.3, tolerance_mm: 0.12 },
      outsideDia: { value_mm: 10.5, tolerance_mm: 0.21 },
      freeLength: { value_mm: 32.0, tolerance_mm: 0.6 },
      configuration: 'Double Torsion'
    },
    loadsRatesDeflection: {
      springRate: { value_N_per_mm: 16.8, tolerance_N_per_mm: 0.5 },
      operatingTemp_C: 150,
      cycles: 3000000,
      surfaceTreatment: 'EP',
      remark: 'Premium material for aerospace applications'
    },
    status: 'ACTIVE',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    createdBy: 'System',
    updatedBy: 'System'
  },
  {
    id: 'PROD-006',
    productName: 'Wave Form Spring - Stainless',
    productType: 'WF',
    general: {
      symagPartNo: 'WF-006-SS',
      partWeightNet: 30,
      customerCode: 'CUST-006',
      customerPartNo: 'CP-006',
      customerPartNameNo: 'Spring Type F',
      moq: 250
    },
    materialAndDimensions: {
      materialType: 'Stainless Steel',
      mtlSpec: 'ASTM A313',
      wireDia: { value_mm: 1.5, tolerance_mm: 0.08 },
      outsideDia: { value_mm: 8.0, tolerance_mm: 0.15 },
      freeLength: { value_mm: 20.0, tolerance_mm: 0.4 },
      configuration: 'Wave Form'
    },
    loadsRatesDeflection: {
      springRate: { value_N_per_mm: 11.2, tolerance_N_per_mm: 0.4 },
      operatingTemp_C: 110,
      cycles: 2500000,
      surfaceTreatment: 'Nickle',
      remark: 'Compact design for space-constrained applications'
    },
    status: 'ACTIVE',
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
    createdBy: 'System',
    updatedBy: 'System'
  },
  {
    id: 'PROD-007',
    productName: 'Planar Spring - Chrome Steel',
    productType: 'PP',
    general: {
      symagPartNo: 'PP-007-CS',
      partWeightNet: 45,
      customerCode: 'CUST-007',
      customerPartNo: 'CP-007',
      customerPartNameNo: 'Spring Type G',
      moq: 100
    },
    materialAndDimensions: {
      materialType: 'Chrome Steel',
      mtlSpec: 'SAE 1060',
      wireDia: { value_mm: 2.1, tolerance_mm: 0.1 },
      outsideDia: { value_mm: 11.5, tolerance_mm: 0.23 },
      freeLength: { value_mm: 27.0, tolerance_mm: 0.5 },
      configuration: 'Planar Configuration'
    },
    loadsRatesDeflection: {
      springRate: { value_N_per_mm: 17.3, tolerance_N_per_mm: 0.5 },
      lengthAtLoad1_mm: 22,
      load1_N: 120,
      deflectionAtLoad1_mm: 5.5,
      operatingTemp_C: 95,
      cycles: 1800000,
      surfaceTreatment: 'Zinc',
      remark: 'High performance general-purpose spring'
    },
    status: 'ACTIVE',
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07'),
    createdBy: 'System',
    updatedBy: 'System'
  },
  {
    id: 'PROD-008',
    productName: 'Heavy Duty Compression Spring',
    productType: 'CS',
    general: {
      symagPartNo: 'CS-008-HD',
      partWeightNet: 120,
      customerCode: 'CUST-008',
      customerPartNo: 'CP-008',
      customerPartNameNo: 'Spring Type H',
      moq: 50
    },
    materialAndDimensions: {
      materialType: 'Steel',
      mtlSpec: 'SAE 1065',
      wireDia: { value_mm: 3.5, tolerance_mm: 0.2 },
      outsideDia: { value_mm: 18.0, tolerance_mm: 0.35 },
      freeLength: { value_mm: 45.0, tolerance_mm: 1.0 },
      configuration: 'Closed and Ground',
      totalCoils: 10,
      activeCoils: 8
    },
    loadsRatesDeflection: {
      springRate: { value_N_per_mm: 28.5, tolerance_N_per_mm: 1.0 },
      lengthAtLoad1_mm: 35,
      load1_N: 300,
      deflectionAtLoad1_mm: 10,
      operatingTemp_C: 85,
      cycles: 500000,
      surfaceTreatment: 'Zinc',
      remark: 'Heavy load industrial spring'
    },
    status: 'ACTIVE',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    createdBy: 'System',
    updatedBy: 'System'
  },
  {
    id: 'PROD-009',
    productName: 'Precision Spring - Medical Grade',
    productType: 'ES',
    general: {
      symagPartNo: 'ES-009-MED',
      partWeightNet: 12,
      customerCode: 'CUST-009',
      customerPartNo: 'CP-009',
      customerPartNameNo: 'Spring Type I',
      moq: 500
    },
    materialAndDimensions: {
      materialType: 'Stainless Steel',
      mtlSpec: 'ASTM F138',
      wireDia: { value_mm: 0.8, tolerance_mm: 0.05 },
      outsideDia: { value_mm: 5.0, tolerance_mm: 0.1 },
      freeLength: { value_mm: 15.0, tolerance_mm: 0.3 },
      configuration: 'Precision Coil'
    },
    loadsRatesDeflection: {
      springRate: { value_N_per_mm: 5.2, tolerance_N_per_mm: 0.2 },
      operatingTemp_C: 37,
      cycles: 10000000,
      surfaceTreatment: 'Nickle',
      remark: 'Medical/surgical device applications'
    },
    status: 'ACTIVE',
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09'),
    createdBy: 'System',
    updatedBy: 'System'
  },
  {
    id: 'PROD-010',
    productName: 'Custom Spring - Application Specific',
    productType: 'CCS',
    general: {
      symagPartNo: 'CCS-010-CUST',
      partWeightNet: 65,
      customerCode: 'CUST-010',
      customerPartNo: 'CP-010',
      customerPartNameNo: 'Spring Type J',
      moq: 100
    },
    materialAndDimensions: {
      materialType: 'Steel',
      mtlSpec: 'SAE 1074',
      wireDia: { value_mm: 2.8, tolerance_mm: 0.14 },
      outsideDia: { value_mm: 14.0, tolerance_mm: 0.28 },
      freeLength: { value_mm: 35.0, tolerance_mm: 0.7 },
      configuration: 'Custom Design'
    },
    loadsRatesDeflection: {
      springRate: { value_N_per_mm: 19.5, tolerance_N_per_mm: 0.7 },
      lengthAtLoad1_mm: 28,
      load1_N: 180,
      deflectionAtLoad1_mm: 7,
      operatingTemp_C: 105,
      cycles: 1200000,
      surfaceTreatment: 'Powder Coating',
      remark: 'Customized for specific application requirements'
    },
    status: 'ACTIVE',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    createdBy: 'System',
    updatedBy: 'System'
  }
];

/**
 * Seed the Firestore database with sample data
 */
async function seedDatabase() {
  try {
    console.log('🚀 Starting Firebase Firestore data seeding...\n');

    // Clear existing data (optional - comment out to preserve existing data)
    // await clearCollections();

    // Seed orders
    console.log('📝 Seeding orders collection...');
    for (const order of orders) {
      await db.collection('orders').doc(order.id).set(order);
    }
    console.log(`✅ Successfully added ${orders.length} orders\n`);

    // Seed sales orders
    console.log('📝 Seeding salesOrders collection...');
    for (const salesOrder of salesOrders) {
      await db.collection('salesOrders').doc(salesOrder.id).set(salesOrder);
    }
    console.log(`✅ Successfully added ${salesOrders.length} sales orders\n`);

    // Seed job cards
    console.log('📝 Seeding jobCards collection...');
    for (const jobCard of jobCards) {
      await db.collection('jobCards').doc(jobCard.id).set(jobCard);
    }
    console.log(`✅ Successfully added ${jobCards.length} job cards\n`);

    // Seed products
    console.log('📝 Seeding products collection...');
    for (const product of products) {
      await db.collection('products').doc(product.id).set(product);
    }
    console.log(`✅ Successfully added ${products.length} products\n`);

    console.log('🎉 Firebase Firestore seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Orders: ${orders.length}`);
    console.log(`   • Sales Orders: ${salesOrders.length}`);
    console.log(`   • Job Cards: ${jobCards.length}`);
    console.log(`   • Products: ${products.length}`);
    console.log(`   • Total Documents: ${orders.length + salesOrders.length + jobCards.length + products.length}`);
    console.log('\n✨ Your Firestore database is now populated with sample data!');
    console.log('   Start the application with: npm start\n');

    await admin.app().delete();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

/**
 * Optional: Clear existing collections
 */
async function clearCollections() {
  console.log('🗑️  Clearing existing data...');
  const collections = ['orders', 'salesOrders', 'jobCards', 'products'];

  for (const collectionName of collections) {
    const querySnapshot = await db.collection(collectionName).get();
    for (const doc of querySnapshot.docs) {
      await doc.ref.delete();
    }
  }
  console.log('✅ Collections cleared\n');
}

// Run the seeding script
seedDatabase();
