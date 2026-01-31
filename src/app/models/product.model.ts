// Product/Part Master Model based on SpringPartOrder structure

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
  degree_C?: number;
  time_min?: number;
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
  // ES specific fields
  hookType?: string;
  orientation?: string;
  gap_mm?: number;
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

/**
 * Product Master Model - Represents a product/part master record
 * Contains all specifications like CC (Compression Spring), CCS (Complex Coil Spring), etc.
 */
export interface Product {
  id?: string; // Auto-generated
  productName: string; // User-friendly product name
  productType: 'CS' | 'CCS' | 'ES' | 'TS' | 'DTS' | 'WF' | 'PP'; // Spring/Part Type
  general: GeneralInfo;
  materialAndDimensions: MaterialAndDimensions;
  loadsRatesDeflection: LoadsRatesDeflection;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  images?: string[]; // Array of image URLs or base64 strings (max 6)
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Product line item for Sales Order
 * References a Product and specifies quantity
 */
export interface SalesOrderLineItem {
  id?: string;
  productId: string;
  product?: Product; // Populated from Product Master
  quantity: number;
  remarks?: string;
}
