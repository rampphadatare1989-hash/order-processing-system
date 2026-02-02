import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, orderBy, QuerySnapshot, DocumentData, provideFirestore, getFirestore } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { SalesOrder, SalesOrderItem } from '../models/sales-order.model';

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {
  private salesOrdersCollection = 'sales_orders';

  constructor(private firestore: Firestore) {}

  /**
   * Create a new sales order
   */
  createSalesOrder(salesOrder: SalesOrder): Observable<string> {
    return from(
      addDoc(collection(this.firestore, this.salesOrdersCollection), {
        ...salesOrder,
        createdAt: new Date(),
        updatedAt: new Date()
      }).then(docRef => docRef.id)
    );
  }

  /**
   * Get all sales orders
   */
  getSalesOrders(): Observable<SalesOrder[]> {
    return from(
      getDocs(collection(this.firestore, this.salesOrdersCollection)).then((snapshot: QuerySnapshot<DocumentData>) => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as SalesOrder)
        }));
      })
    );
  }

  /**
   * Get sales order by ID
   */
  getSalesOrderById(id: string): Observable<SalesOrder | null> {
    return from(
      getDocs(
        query(
          collection(this.firestore, this.salesOrdersCollection),
          where('__name__', '==', id)
        )
      ).then((snapshot: QuerySnapshot<DocumentData>) => {
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...(doc.data() as SalesOrder) };
      })
    );
  }

  /**
   * Get sales orders by customer name
   */
  getSalesOrdersByCustomer(customerName: string): Observable<SalesOrder[]> {
    return from(
      getDocs(
        query(
          collection(this.firestore, this.salesOrdersCollection),
          where('customerName', '==', customerName)
        )
      ).then((snapshot: QuerySnapshot<DocumentData>) => {
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as SalesOrder)
        }));
      })
    );
  }

  /**
   * Update sales order
   */
  updateSalesOrder(id: string, salesOrder: Partial<SalesOrder>): Observable<void> {
    return from(
      updateDoc(doc(this.firestore, this.salesOrdersCollection, id), {
        ...salesOrder,
        updatedAt: new Date()
      })
    );
  }

  /**
   * Delete sales order
   */
  deleteSalesOrder(id: string): Observable<void> {
    return from(deleteDoc(doc(this.firestore, this.salesOrdersCollection, id)));
  }

  /**
   * Generate next sales order ID
   */
  async getNextSalesOrderId(): Promise<string> {
    const snapshot = await getDocs(collection(this.firestore, this.salesOrdersCollection));
    const count = snapshot.size + 1;
    return `SO-${String(count).padStart(4, '0')}`;
  }

  /**
   * Search for job card by job card number
   * Job card format: {salesOrderId}/{itemSerialNo} (e.g., "SO-001/1")
   */
  searchJobCardById(jobCardNumber: string): Observable<{salesOrder: SalesOrder, item: SalesOrderItem} | null> {
    return from(
      (async () => {
        // Parse job card number (format: SO-XXX/YY)
        const parts = jobCardNumber.split('/');
        if (parts.length !== 2) {
          return null;
        }

        const salesOrderId = parts[0];
        const itemSerialNo = parseInt(parts[1], 10);

        if (isNaN(itemSerialNo)) {
          return null;
        }

        // Find the sales order
        const salesOrderSnapshot = await getDocs(
          query(
            collection(this.firestore, this.salesOrdersCollection),
            where('salesOrderId', '==', salesOrderId)
          )
        );

        if (salesOrderSnapshot.empty) {
          return null;
        }

        const salesOrderDoc = salesOrderSnapshot.docs[0];
        const salesOrder: SalesOrder = {
          id: salesOrderDoc.id,
          ...(salesOrderDoc.data() as SalesOrder)
        };

        // Find the specific item in the sales order
        const item = salesOrder.items?.find(item => item.itemSerialNo === itemSerialNo);

        if (!item) {
          return null;
        }

        return { salesOrder, item };
      })()
    );
  }
}
