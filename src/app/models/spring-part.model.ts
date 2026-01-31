// Spring/Part Order Item Models based on JSON Schema

export interface DimensionWithTolerance {
  value_mm: number;
  tolerance_mm: number;
}

export interface WorksInside {
  holeDia_mm: number;
}

export interface WorksOver {
  shaftDia_mm: number;
}

export interface HeatTreat {
  degree_C: number;
  time_min: number;
}

export interface GeneralInfo {
  symagPartNo: string;
  partWeightNet?: number;
  customerCode?: string;
  customerPartNo?: string;
  customerPartNameNo?: string;
  moq?: number;
}

export interface MaterialAndDimensions {
  materialType?: string;
  mtlSpec?: string;
  wireDia?: DimensionWithTolerance;
  outsideDia?: DimensionWithTolerance;
  meanDia?: DimensionWithTolerance;
  insideDia?: DimensionWithTolerance;
  freeLength?: DimensionWithTolerance;
  configuration?: string;
  totalCoils?: number;
  helix?: 'RHS' | 'LHS';
  activeCoils?: number;
  endType?: string;
  pitch_mm?: number;
  preset?: boolean;
  worksInside?: WorksInside;
  worksOver?: WorksOver;
  heatTreat?: HeatTreat;
  // CCS specific fields
  bigOutsideDia?: DimensionWithTolerance;
  smallOutsideDia?: DimensionWithTolerance;
  bigInsideDia?: DimensionWithTolerance;
  smallInsideDia?: DimensionWithTolerance;
}

export interface SpringRate {
  value_N_per_mm: number;
  tolerance_N_per_mm: number;
}

export interface LoadsRatesDeflection {
  springRate?: SpringRate;
  lengthAtLoad1_mm?: number;
  load1_N?: number;
  deflectionAtLoad1_mm?: number;
  lengthAtLoad2_mm?: number;
  load2_N?: number;
  deflectionAtLoad2_mm?: number;
  solidHeight?: DimensionWithTolerance;
  operatingTemp_C?: number;
  cycles?: number;
  surfaceTreatment?: 'Zinc' | 'Nickle' | 'Powder Coating' | 'EP';
  remark?: string;
  date?: string; // ISO date format
  prepBy?: string;
}

export interface SpringPartOrder {
  id?: string; // Auto-generated
  productType: 'CS' | 'CCS' | 'ES' | 'TS' | 'DTS' | 'WF' | 'PP';
  general: GeneralInfo;
  materialAndDimensions: MaterialAndDimensions;
  loadsRatesDeflection: LoadsRatesDeflection;
  createdAt?: Date;
  updatedAt?: Date;
}

// Sales Order Line Item Model (references Product Master)
export interface SalesOrderLineItem {
  id?: string;
  productId: string; // Reference to Product Master
  productName: string; // Denormalized for quick display
  productType: string;
  quantity: number;
  remarks?: string;
}

// Sales Order Model (Updated to support multiple products from Product Master)
export interface SalesOrder {
  id: string;
  salesOrderNumber: string;
  customerCode: string;
  customerName: string;
  createdDate: Date;
  lineItems: SalesOrderLineItem[]; // Line items referencing products from Product Master
  items: Order[]; // Contains full Order objects with job card progress (generated from lineItems)
  status: 'OPEN' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  remarks?: string;
  jobOrdersGenerated?: boolean; // Flag to track if job orders have been generated
}

// Order Model (created from Sales Order items)
export interface Order {
  id: string; // Auto-generated Order ID
  orderNumber: string; // Auto-generated
  salesOrderId: string;
  salesOrderNumber: string;
  itemDetails: SpringPartOrder;
  jobCardId: string; // Auto-generated
  quantity: number;
  createdDate: Date;
  completionDate?: Date;
  status: 'PENDING' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: string;
  remarks?: string;
}

// Job Card Model
export interface JobCard {
  id: string; // Auto-generated
  orderId: string;
  orderNumber: string;
  salesOrderId: string;
  partDetails: SpringPartOrder;
  quantity: number;
  createdDate: Date;
  startDate?: Date;
  completionDate?: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  notes?: string;
}

// Dashboard Summary Model
export interface OrderSummary {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  inProductionOrders: number;
  cancelledOrders: number;
  ordersByStatus: { status: string; count: number }[];
  ordersByProductType: { productType: string; count: number }[];
  averageCompletionTime?: number; // in days
  monthlyOrderData?: { month: string; count: number }[];
}
