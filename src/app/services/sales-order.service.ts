import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, orderBy, QuerySnapshot, DocumentData, provideFirestore, getFirestore } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { SalesOrder } from '../models/sales-order.model';

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
}
