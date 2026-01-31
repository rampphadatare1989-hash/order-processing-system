import { Product } from './product.model';

export interface SalesOrderItem {
  itemSerialNo: number; // Sequential item number (1, 2, 3, ...)
  productId: string; // Reference to product ID
  productName: string;
  productType: string; // Product type (CS, CCS, ES, etc.)
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  jobCardNumber?: string; // Auto-generated: {salesOrderId}/{itemSerialNo}
  product?: Product; // Full product details
}

export interface SalesOrder {
  id?: string; // Firestore document ID
  salesOrderId: string; // Custom sales order ID (e.g., SO-001)
  customerId?: string; // Customer identifier
  customerName?: string; // Customer name
  createdDate: string; // YYYY-MM-DD
  completionTargetDate: string; // YYYY-MM-DD
  status: 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  items: SalesOrderItem[]; // Products in this sales order
  remarks?: string;
  totalAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobCard {
  jobCardNumber: string; // Format: {salesOrderId}/{itemSerialNo}
  salesOrderId: string;
  itemSerialNo: number;
  productDetails: Product;
  quantity: number;
  createdDate: string;
  completionTargetDate: string;
  customerName?: string;
  remarks?: string;
}
