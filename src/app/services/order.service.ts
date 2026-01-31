import { Injectable, OnDestroy } from '@angular/core';
import { Order, JobCard, SalesOrder, OrderSummary } from '../models/spring-part.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { FirebaseService } from './firebase-db.service';

/**
 * Service for managing Orders, Job Cards, and Sales Orders
 * Supports both Firebase and mock data
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService implements OnDestroy {
  private orders$ = new BehaviorSubject<Order[]>([]);
  private jobCards$ = new BehaviorSubject<JobCard[]>([]);
  private salesOrders$ = new BehaviorSubject<SalesOrder[]>([]);
  private orderSummary$ = new BehaviorSubject<OrderSummary | null>(null);

  // Auto-increment counters
  private orderCounter = 1000;
  private jobCardCounter = 5000;

  // Firebase collections names
  private readonly ORDERS_COLLECTION = 'orders';
  private readonly JOB_CARDS_COLLECTION = 'jobCards';
  private readonly SALES_ORDERS_COLLECTION = 'salesOrders';

  // Use Firebase flag
  private useFirebase = true;
  private firebaseInitialized = false;

  constructor(private firebaseService: FirebaseService) {
    this.initializeService();
  }

  /**
   * Implement OnDestroy lifecycle
   */
  ngOnDestroy(): void {
    this.orders$.complete();
    this.jobCards$.complete();
    this.salesOrders$.complete();
    this.orderSummary$.complete();
  }

  /**
   * Helper method to convert various date formats to Date object
   */
  private convertToDate(value: any): Date {
    if (!value) return new Date();
    
    // If already a Date object, return it
    if (value instanceof Date) {
      return value;
    }
    
    // If it's a Firestore Timestamp object with toDate method
    if (typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
      return value.toDate();
    }
    
    // If it's a string or number, try to parse it
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      // Check if the date is valid
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    // Default fallback to current date
    console.warn('Could not convert value to date:', value);
    return new Date();
  }

  /**
   * Initialize the service - load data from Firebase or mock
   */
  private initializeService(): void {
    try {
      this.loadDataFromFirebase();
    } catch (error) {
      console.warn('Firebase initialization failed, using mock data:', error);
      this.useFirebase = false;
      this.loadMockData();
    }
  }

  /**
   * Load data from Firebase
   */
  private loadDataFromFirebase(): void {
    try {
      // Listen to orders in real-time
      this.firebaseService.listenToCollection<Order>(
        this.ORDERS_COLLECTION,
        undefined,
        (orders) => {
          try {
            // Convert date strings to Date objects
            const processedOrders = (Array.isArray(orders) ? orders : []).map(order => ({
              ...order,
              createdDate: order?.createdDate ? this.convertToDate(order.createdDate) : new Date(),
              completionDate: order?.completionDate ? this.convertToDate(order.completionDate) : undefined
            }));
            this.orders$.next(processedOrders);
            this.calculateSummary();
            this.firebaseInitialized = true;
          } catch (error) {
            console.error('Error processing orders:', error);
            this.orders$.next([]);
            this.useFirebase = false;
            this.loadMockData();
          }
        },
        (error) => {
          console.error('Error loading orders from Firebase:', error);
          this.useFirebase = false;
          this.loadMockData();
        }
      );

      // Listen to job cards in real-time
      this.firebaseService.listenToCollection<JobCard>(
        this.JOB_CARDS_COLLECTION,
        undefined,
        (jobCards) => {
          try {
            const processedJobCards = (Array.isArray(jobCards) ? jobCards : []).map(card => ({
              ...card,
              createdDate: card?.createdDate ? this.convertToDate(card.createdDate) : new Date(),
              startDate: card?.startDate ? this.convertToDate(card.startDate) : undefined,
              completionDate: card?.completionDate ? this.convertToDate(card.completionDate) : undefined
            }));
            this.jobCards$.next(processedJobCards);
          } catch (error) {
            console.error('Error processing job cards:', error);
            this.jobCards$.next([]);
          }
        },
        (error) => {
          console.error('Error loading job cards from Firebase:', error);
          this.jobCards$.next([]);
        }
      );

      // Listen to sales orders in real-time
      this.firebaseService.listenToCollection<SalesOrder>(
        this.SALES_ORDERS_COLLECTION,
        undefined,
        (salesOrders) => {
          try {
            const processedSalesOrders = salesOrders.map(so => {
              // Safely handle items array which may not exist
              const items = Array.isArray(so.items) ? so.items : [];
              
              return {
                ...so,
                createdDate: this.convertToDate(so.createdDate),
                items: items.map((item: any) => ({
                  ...item,
                  createdDate: item?.createdDate ? this.convertToDate(item.createdDate) : new Date(),
                  completionDate: item?.completionDate ? this.convertToDate(item.completionDate) : undefined
                }))
              };
            });
            this.salesOrders$.next(processedSalesOrders);
          } catch (error) {
            console.error('Error processing sales orders:', error);
            this.salesOrders$.next([]);
          }
        },
        (error) => {
          console.error('Error loading sales orders from Firebase:', error);
          this.salesOrders$.next([]);
        }
      );
    } catch (error) {
      console.error('Error initializing Firebase listeners:', error);
      throw error;
    }
  }

  /**
   * Load mock data for demonstration
   */
  private loadMockData(): void {
    // This will be replaced with Firebase queries
    const mockOrders: Order[] = [
      {
        id: 'ORD-1704067200000-abc123def',
        orderNumber: 'ORD-1001',
        salesOrderId: 'SO-2001',
        salesOrderNumber: 'SO-2001',
        itemDetails: {
          productType: 'CS',
          general: { symagPartNo: 'SP-CS-001', customerCode: 'CUST-001', moq: 100 },
          materialAndDimensions: {
            materialType: 'Steel',
            wireDia: { value_mm: 2.5, tolerance_mm: 0.1 },
            outsideDia: { value_mm: 20, tolerance_mm: 0.2 },
            totalCoils: 10,
            activeCoils: 8,
            helix: 'RHS'
          },
          loadsRatesDeflection: {
            springRate: { value_N_per_mm: 15, tolerance_N_per_mm: 0.5 },
            operatingTemp_C: 80,
            cycles: 1000000
          }
        },
        jobCardId: 'JC-5001',
        quantity: 500,
        createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        completionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED'
      },
      {
        id: 'ORD-1704153600000-xyz789pqr',
        orderNumber: 'ORD-1002',
        salesOrderId: 'SO-2002',
        salesOrderNumber: 'SO-2002',
        itemDetails: {
          productType: 'CCS',
          general: { symagPartNo: 'SP-CCS-002', customerCode: 'CUST-002', moq: 200 },
          materialAndDimensions: {
            materialType: 'Stainless Steel',
            wireDia: { value_mm: 3.0, tolerance_mm: 0.15 },
            outsideDia: { value_mm: 25, tolerance_mm: 0.3 },
            totalCoils: 12,
            activeCoils: 10,
            helix: 'RHS'
          },
          loadsRatesDeflection: {
            springRate: { value_N_per_mm: 20, tolerance_N_per_mm: 0.6 },
            operatingTemp_C: 100,
            cycles: 2000000
          }
        },
        jobCardId: 'JC-5002',
        quantity: 300,
        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'IN_PRODUCTION'
      },
      {
        id: 'ORD-1704240000000-mno456stu',
        orderNumber: 'ORD-1003',
        salesOrderId: 'SO-2003',
        salesOrderNumber: 'SO-2003',
        itemDetails: {
          productType: 'ES',
          general: { symagPartNo: 'SP-ES-003', customerCode: 'CUST-003', moq: 150 },
          materialAndDimensions: {
            materialType: 'Music Wire',
            wireDia: { value_mm: 1.8, tolerance_mm: 0.08 },
            outsideDia: { value_mm: 18, tolerance_mm: 0.15 },
            totalCoils: 15,
            activeCoils: 13,
            helix: 'LHS'
          },
          loadsRatesDeflection: {
            springRate: { value_N_per_mm: 12, tolerance_N_per_mm: 0.4 },
            operatingTemp_C: 60,
            cycles: 5000000
          }
        },
        jobCardId: 'JC-5003',
        quantity: 1000,
        createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'PENDING'
      },
      {
        id: 'ORD-1704326400000-vwx123yza',
        orderNumber: 'ORD-1004',
        salesOrderId: 'SO-2004',
        salesOrderNumber: 'SO-2004',
        itemDetails: {
          productType: 'TS',
          general: { symagPartNo: 'SP-TS-004', customerCode: 'CUST-001', moq: 100 },
          materialAndDimensions: {
            materialType: 'Alloy Steel',
            wireDia: { value_mm: 4.0, tolerance_mm: 0.2 },
            outsideDia: { value_mm: 30, tolerance_mm: 0.4 },
            totalCoils: 8,
            activeCoils: 6,
            helix: 'RHS'
          },
          loadsRatesDeflection: {
            springRate: { value_N_per_mm: 25, tolerance_N_per_mm: 0.8 },
            operatingTemp_C: 120,
            cycles: 3000000
          }
        },
        jobCardId: 'JC-5004',
        quantity: 250,
        createdDate: new Date(),
        status: 'PENDING'
      },
      {
        id: 'ORD-1704412800000-bcd789efg',
        orderNumber: 'ORD-1005',
        salesOrderId: 'SO-2005',
        salesOrderNumber: 'SO-2005',
        itemDetails: {
          productType: 'DTS',
          general: { symagPartNo: 'SP-DTS-005', customerCode: 'CUST-004', moq: 80 },
          materialAndDimensions: {
            materialType: 'Titanium',
            wireDia: { value_mm: 2.2, tolerance_mm: 0.1 },
            outsideDia: { value_mm: 22, tolerance_mm: 0.2 },
            totalCoils: 11,
            activeCoils: 9,
            helix: 'RHS'
          },
          loadsRatesDeflection: {
            springRate: { value_N_per_mm: 18, tolerance_N_per_mm: 0.5 },
            operatingTemp_C: 150,
            cycles: 10000000
          }
        },
        jobCardId: 'JC-5005',
        quantity: 600,
        createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        completionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED'
      },
      {
        id: 'ORD-1704499200000-hij456klm',
        orderNumber: 'ORD-1006',
        salesOrderId: 'SO-2006',
        salesOrderNumber: 'SO-2006',
        itemDetails: {
          productType: 'WF',
          general: { symagPartNo: 'SP-WF-006', customerCode: 'CUST-005', moq: 50 },
          materialAndDimensions: {
            materialType: 'Bronze',
            wireDia: { value_mm: 3.5, tolerance_mm: 0.15 },
            outsideDia: { value_mm: 28, tolerance_mm: 0.3 },
            totalCoils: 9,
            activeCoils: 7,
            helix: 'LHS'
          },
          loadsRatesDeflection: {
            springRate: { value_N_per_mm: 22, tolerance_N_per_mm: 0.7 },
            operatingTemp_C: 90,
            cycles: 1500000
          }
        },
        jobCardId: 'JC-5006',
        quantity: 400,
        createdDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        status: 'IN_PRODUCTION'
      },
      {
        id: 'ORD-1704585600000-nop789qrs',
        orderNumber: 'ORD-1007',
        salesOrderId: 'SO-2007',
        salesOrderNumber: 'SO-2007',
        itemDetails: {
          productType: 'PP',
          general: { symagPartNo: 'SP-PP-007', customerCode: 'CUST-006', moq: 120 },
          materialAndDimensions: {
            materialType: 'Stainless Steel 316',
            wireDia: { value_mm: 2.8, tolerance_mm: 0.12 },
            outsideDia: { value_mm: 24, tolerance_mm: 0.25 },
            totalCoils: 14,
            activeCoils: 12,
            helix: 'RHS'
          },
          loadsRatesDeflection: {
            springRate: { value_N_per_mm: 16, tolerance_N_per_mm: 0.5 },
            operatingTemp_C: 110,
            cycles: 4000000
          }
        },
        jobCardId: 'JC-5007',
        quantity: 800,
        createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'PENDING'
      },
      {
        id: 'ORD-1704672000000-tuv012wxy',
        orderNumber: 'ORD-1008',
        salesOrderId: 'SO-2008',
        salesOrderNumber: 'SO-2008',
        itemDetails: {
          productType: 'CS',
          general: { symagPartNo: 'SP-CS-008', customerCode: 'CUST-007', moq: 90 },
          materialAndDimensions: {
            materialType: 'High Carbon Steel',
            wireDia: { value_mm: 2.0, tolerance_mm: 0.08 },
            outsideDia: { value_mm: 16, tolerance_mm: 0.15 },
            totalCoils: 20,
            activeCoils: 18,
            helix: 'RHS'
          },
          loadsRatesDeflection: {
            springRate: { value_N_per_mm: 10, tolerance_N_per_mm: 0.3 },
            operatingTemp_C: 70,
            cycles: 2500000
          }
        },
        jobCardId: 'JC-5008',
        quantity: 450,
        createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'IN_PRODUCTION'
      },
      {
        id: 'ORD-1704758400000-zab345cde',
        orderNumber: 'ORD-1009',
        salesOrderId: 'SO-2009',
        salesOrderNumber: 'SO-2009',
        itemDetails: {
          productType: 'ES',
          general: { symagPartNo: 'SP-ES-009', customerCode: 'CUST-008', moq: 110 },
          materialAndDimensions: {
            materialType: 'Chromium Wire',
            wireDia: { value_mm: 2.5, tolerance_mm: 0.1 },
            outsideDia: { value_mm: 21, tolerance_mm: 0.2 },
            totalCoils: 16,
            activeCoils: 14,
            helix: 'LHS'
          },
          loadsRatesDeflection: {
            springRate: { value_N_per_mm: 14, tolerance_N_per_mm: 0.45 },
            operatingTemp_C: 85,
            cycles: 3500000
          }
        },
        jobCardId: 'JC-5009',
        quantity: 550,
        createdDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: 'PENDING'
      },
      {
        id: 'ORD-1704844800000-fgh678ijk',
        orderNumber: 'ORD-1010',
        salesOrderId: 'SO-2010',
        salesOrderNumber: 'SO-2010',
        itemDetails: {
          productType: 'TS',
          general: { symagPartNo: 'SP-TS-010', customerCode: 'CUST-009', moq: 70 },
          materialAndDimensions: {
            materialType: 'Spring Steel',
            wireDia: { value_mm: 3.5, tolerance_mm: 0.15 },
            outsideDia: { value_mm: 29, tolerance_mm: 0.35 },
            totalCoils: 10,
            activeCoils: 8,
            helix: 'RHS'
          },
          loadsRatesDeflection: {
            springRate: { value_N_per_mm: 24, tolerance_N_per_mm: 0.75 },
            operatingTemp_C: 115,
            cycles: 2800000
          }
        },
        jobCardId: 'JC-5010',
        quantity: 320,
        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'PENDING'
      }
    ];

    const mockJobCards: JobCard[] = mockOrders.map(order => ({
      id: order.jobCardId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      salesOrderId: order.salesOrderId,
      partDetails: order.itemDetails,
      quantity: order.quantity,
      createdDate: order.createdDate,
      startDate: order.status === 'IN_PRODUCTION' ? new Date(order.createdDate.getTime() + 24 * 60 * 60 * 1000) : undefined,
      completionDate: order.completionDate,
      status: order.status === 'COMPLETED' ? 'COMPLETED' : order.status === 'IN_PRODUCTION' ? 'IN_PROGRESS' : 'PENDING'
    }));

    const mockSalesOrders: SalesOrder[] = [
      {
        id: 'SO-2001',
        salesOrderNumber: 'SO-2001',
        customerCode: 'CUST-001',
        customerName: 'ABC Manufacturing',
        createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        lineItems: [],
        items: mockOrders.filter(o => o.salesOrderId === 'SO-2001'),
        status: 'COMPLETED'
      },
      {
        id: 'SO-2002',
        salesOrderNumber: 'SO-2002',
        customerCode: 'CUST-002',
        customerName: 'XYZ Industries',
        createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lineItems: [],
        items: mockOrders.filter(o => o.salesOrderId === 'SO-2002'),
        status: 'PROCESSING'
      },
      {
        id: 'SO-2003',
        salesOrderNumber: 'SO-2003',
        customerCode: 'CUST-003',
        customerName: 'Tech Solutions Ltd',
        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        lineItems: [],
        items: mockOrders.filter(o => o.salesOrderId === 'SO-2003'),
        status: 'PROCESSING'
      },
      {
        id: 'SO-2004',
        salesOrderNumber: 'SO-2004',
        customerCode: 'CUST-001',
        customerName: 'ABC Manufacturing',
        createdDate: new Date(),
        lineItems: [],
        items: mockOrders.filter(o => o.salesOrderId === 'SO-2004'),
        status: 'OPEN'
      },
      {
        id: 'SO-2005',
        salesOrderNumber: 'SO-2005',
        customerCode: 'CUST-004',
        customerName: 'Global Parts Co',
        createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lineItems: [],
        items: mockOrders.filter(o => o.salesOrderId === 'SO-2005'),
        status: 'COMPLETED'
      },
      {
        id: 'SO-2006',
        salesOrderNumber: 'SO-2006',
        customerCode: 'CUST-005',
        customerName: 'Precision Engineering',
        createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        lineItems: [],
        items: mockOrders.filter(o => o.salesOrderId === 'SO-2006'),
        status: 'PROCESSING'
      },
      {
        id: 'SO-2007',
        salesOrderNumber: 'SO-2007',
        customerCode: 'CUST-006',
        customerName: 'Premium Components',
        createdDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        lineItems: [],
        items: mockOrders.filter(o => o.salesOrderId === 'SO-2007'),
        status: 'PROCESSING'
      },
      {
        id: 'SO-2008',
        salesOrderNumber: 'SO-2008',
        customerCode: 'CUST-007',
        customerName: 'Industrial Springs',
        createdDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        lineItems: [],
        items: mockOrders.filter(o => o.salesOrderId === 'SO-2008'),
        status: 'PROCESSING'
      },
      {
        id: 'SO-2009',
        salesOrderNumber: 'SO-2009',
        customerCode: 'CUST-008',
        customerName: 'Advanced Mechanics',
        createdDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        lineItems: [],
        items: mockOrders.filter(o => o.salesOrderId === 'SO-2009'),
        status: 'COMPLETED'
      },
      {
        id: 'SO-2010',
        salesOrderNumber: 'SO-2010',
        customerCode: 'CUST-009',
        customerName: 'Automotive Systems',
        createdDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        lineItems: [],
        items: mockOrders.filter(o => o.salesOrderId === 'SO-2010'),
        status: 'PROCESSING'
      }
    ];

    this.orders$.next(mockOrders);
    this.jobCards$.next(mockJobCards);
    this.salesOrders$.next(mockSalesOrders);
    this.calculateSummary();
  }

  /**
   * Get all orders
   */
  getOrders(): Observable<Order[]> {
    return this.orders$.asObservable();
  }

  /**
   * Create a new order
   */
  createOrder(salesOrderId: string, quantity: number, itemDetails: any): Observable<Order> {
    return new Observable(observer => {
      const newOrder: Order = {
        id: this.generateOrderId(),
        orderNumber: `ORD-${++this.orderCounter}`,
        salesOrderId,
        salesOrderNumber: '',
        itemDetails,
        jobCardId: `JC-${++this.jobCardCounter}`,
        quantity,
        createdDate: new Date(),
        status: 'PENDING'
      };

      if (this.useFirebase) {
        this.firebaseService.addDocument(this.ORDERS_COLLECTION, newOrder)
          .then(() => {
            this.createJobCard(newOrder);
            observer.next(newOrder);
            observer.complete();
          })
          .catch(error => {
            observer.error(error);
          });
      } else {
        const currentOrders = this.orders$.value;
        currentOrders.push(newOrder);
        this.orders$.next(currentOrders);
        this.createJobCard(newOrder);
        this.calculateSummary();
        observer.next(newOrder);
        observer.complete();
      }
    });
  }

  /**
   * Create job card for an order
   */
  private createJobCard(order: Order): void {
    const newJobCard: JobCard = {
      id: order.jobCardId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      salesOrderId: order.salesOrderId,
      partDetails: order.itemDetails,
      quantity: order.quantity,
      createdDate: order.createdDate,
      status: 'PENDING'
    };

    if (this.useFirebase) {
      this.firebaseService.addDocument(this.JOB_CARDS_COLLECTION, newJobCard)
        .catch(error => console.error('Error creating job card:', error));
    } else {
      const currentJobCards = this.jobCards$.value;
      currentJobCards.push(newJobCard);
      this.jobCards$.next(currentJobCards);
    }
  }

  /**
   * Get all job cards
   */
  getJobCards(): Observable<JobCard[]> {
    return this.jobCards$.asObservable();
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: Order['status']): Observable<Order | null> {
    return new Observable(observer => {
      const orders = this.orders$.value;
      const order = orders.find(o => o.id === orderId);

      if (order) {
        order.status = status;
        
        // Prepare update object
        const updateData: any = { status };
        
        if (status === 'COMPLETED') {
          order.completionDate = new Date();
          updateData.completionDate = order.completionDate;
        }

        if (this.useFirebase) {
          this.firebaseService.updateDocument(this.ORDERS_COLLECTION, orderId, updateData)
            .then(() => {
              observer.next(order);
              observer.complete();
            })
            .catch(error => observer.error(error));
        } else {
          this.orders$.next([...orders]);
          this.calculateSummary();
          observer.next(order);
          observer.complete();
        }
      } else {
        observer.next(null);
        observer.complete();
      }
    });
  }

  /**
   * Get orders with filters
   */
  getOrdersWithFilters(filters: {
    status?: Order['status'];
    createdDate?: { from: Date; to: Date };
    completionDate?: { from: Date; to: Date };
    orderId?: string;
    salesOrderId?: string;
    jobCardId?: string;
  }): Observable<Order[]> {
    return new Observable(observer => {
      let filtered = [...this.orders$.value];

      if (filters.status) {
        filtered = filtered.filter(o => o.status === filters.status);
      }

      if (filters.createdDate) {
        filtered = filtered.filter(
          o => o.createdDate >= filters.createdDate!.from && 
               o.createdDate <= filters.createdDate!.to
        );
      }

      if (filters.completionDate) {
        filtered = filtered.filter(
          o => o.completionDate && 
               o.completionDate >= filters.completionDate!.from && 
               o.completionDate <= filters.completionDate!.to
        );
      }

      if (filters.orderId) {
        filtered = filtered.filter(o => o.id.includes(filters.orderId!));
      }

      if (filters.salesOrderId) {
        filtered = filtered.filter(o => o.salesOrderId.includes(filters.salesOrderId!));
      }

      if (filters.jobCardId) {
        filtered = filtered.filter(o => o.jobCardId.includes(filters.jobCardId!));
      }

      observer.next(filtered);
      observer.complete();
    });
  }

  /**
   * Get order summary for dashboard
   */
  getOrderSummary(): Observable<OrderSummary | null> {
    return this.orderSummary$.asObservable();
  }

  /**
   * Calculate order summary
   */
  private calculateSummary(): void {
    const orders = this.orders$.value;

    const summary: OrderSummary = {
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
      pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      inProductionOrders: orders.filter(o => o.status === 'IN_PRODUCTION').length,
      cancelledOrders: orders.filter(o => o.status === 'CANCELLED').length,
      ordersByStatus: this.groupByStatus(orders),
      ordersByProductType: this.groupByProductType(orders)
    };

    this.orderSummary$.next(summary);
  }

  /**
   * Group orders by status
   */
  private groupByStatus(orders: Order[]): { status: string; count: number }[] {
    const statusMap = new Map<string, number>();
    
    orders.forEach(order => {
      const count = statusMap.get(order.status) || 0;
      statusMap.set(order.status, count + 1);
    });

    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count
    }));
  }

  /**
   * Group orders by product type
   */
  private groupByProductType(orders: Order[]): { productType: string; count: number }[] {
    const typeMap = new Map<string, number>();

    orders.forEach(order => {
      const type = order.itemDetails.productType;
      const count = typeMap.get(type) || 0;
      typeMap.set(type, count + 1);
    });

    return Array.from(typeMap.entries()).map(([productType, count]) => ({
      productType,
      count
    }));
  }

  /**
   * Generate unique order ID
   */
  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add sales order
   */
  addSalesOrder(salesOrder: SalesOrder): Observable<SalesOrder> {
    return new Observable(observer => {
      if (this.useFirebase) {
        this.firebaseService.addDocument(this.SALES_ORDERS_COLLECTION, salesOrder)
          .then(() => {
            observer.next(salesOrder);
            observer.complete();
          })
          .catch(error => observer.error(error));
      } else {
        const currentSalesOrders = this.salesOrders$.value;
        currentSalesOrders.push(salesOrder);
        this.salesOrders$.next(currentSalesOrders);
        observer.next(salesOrder);
        observer.complete();
      }
    });
  }

  /**
   * Get all sales orders
   */
  getSalesOrders(): Observable<SalesOrder[]> {
    return this.salesOrders$.asObservable();
  }

  /**
   * Create a new sales order with line items and generate job orders
   */
  createSalesOrder(salesOrder: SalesOrder): Observable<SalesOrder> {
    return new Observable(observer => {
      try {
        // Ensure salesOrder has required fields
        const newSalesOrder: SalesOrder = {
          ...salesOrder,
          items: salesOrder.items || [],
          jobOrdersGenerated: false
        };

        if (this.useFirebase) {
          this.firebaseService.addDocument(this.SALES_ORDERS_COLLECTION, newSalesOrder)
            .then(() => {
              // Generate job orders for each line item
              this.generateJobOrdersForSalesOrder(newSalesOrder).subscribe(
                (updatedSalesOrder) => {
                  observer.next(updatedSalesOrder);
                  observer.complete();
                },
                (error) => {
                  observer.error(error);
                }
              );
            })
            .catch(error => observer.error(error));
        } else {
          const currentSalesOrders = this.salesOrders$.value;
          currentSalesOrders.push(newSalesOrder);
          this.salesOrders$.next(currentSalesOrders);

          // Generate job orders for each line item
          this.generateJobOrdersForSalesOrder(newSalesOrder).subscribe(
            (updatedSalesOrder) => {
              observer.next(updatedSalesOrder);
              observer.complete();
            },
            (error) => {
              observer.error(error);
            }
          );
        }
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Generate job orders for each product line item in the sales order
   * This creates one job order (and corresponding order) for each line item
   */
  private generateJobOrdersForSalesOrder(salesOrder: SalesOrder): Observable<SalesOrder> {
    return new Observable(observer => {
      try {
        // For now, we'll use mock product data for demonstration
        // In production, you would fetch this from the ProductService
        const orders: Order[] = [];
        const jobCards: JobCard[] = [];

        // Generate orders and job cards for each line item
        for (const lineItem of salesOrder.lineItems || []) {
          const orderNumber = `ORD-${++this.orderCounter}`;
          const jobCardId = `JC-${++this.jobCardCounter}`;

          // Create a mock product details object based on line item
          const mockItemDetails = {
            id: lineItem.productId,
            productType: lineItem.productType as 'CS' | 'CCS' | 'ES' | 'TS' | 'DTS' | 'WF' | 'PP',
            general: {
              symagPartNo: lineItem.productId,
              customerCode: salesOrder.customerCode,
              moq: 100
            },
            materialAndDimensions: {},
            loadsRatesDeflection: {}
          };

          // Create order
          const order: Order = {
            id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            orderNumber,
            salesOrderId: salesOrder.id,
            salesOrderNumber: salesOrder.salesOrderNumber,
            itemDetails: mockItemDetails,
            jobCardId,
            quantity: lineItem.quantity,
            createdDate: new Date(),
            status: 'PENDING',
            remarks: lineItem.remarks
          };

          // Create job card
          const jobCard: JobCard = {
            id: jobCardId,
            orderId: order.id,
            orderNumber,
            salesOrderId: salesOrder.id,
            partDetails: mockItemDetails,
            quantity: lineItem.quantity,
            createdDate: new Date(),
            status: 'PENDING',
            notes: lineItem.remarks
          };

          orders.push(order);
          jobCards.push(jobCard);
        }

        // Save orders and job cards to the service
        const currentOrders = this.orders$.value;
        const currentJobCards = this.jobCards$.value;
        
        this.orders$.next([...currentOrders, ...orders]);
        this.jobCards$.next([...currentJobCards, ...jobCards]);

        // Save to Firebase if available
        if (this.useFirebase) {
          for (const order of orders) {
            this.firebaseService.addDocument(this.ORDERS_COLLECTION, order).catch(err =>
              console.error('Error saving order to Firebase:', err)
            );
          }
          for (const jobCard of jobCards) {
            this.firebaseService.addDocument(this.JOB_CARDS_COLLECTION, jobCard).catch(err =>
              console.error('Error saving job card to Firebase:', err)
            );
          }
        }

        // Update sales order to mark job orders as generated
        const updatedSalesOrder: SalesOrder = {
          ...salesOrder,
          items: orders,
          jobOrdersGenerated: true
        };

        // Update in local store
        const currentSalesOrders = this.salesOrders$.value;
        const updatedSalesOrders = currentSalesOrders.map(so =>
          so.id === salesOrder.id ? updatedSalesOrder : so
        );
        this.salesOrders$.next(updatedSalesOrders);

        // Update in Firebase
        if (this.useFirebase) {
          this.firebaseService.updateDocument(this.SALES_ORDERS_COLLECTION, salesOrder.id, updatedSalesOrder)
            .catch(err => console.error('Error updating sales order in Firebase:', err));
        }

        this.calculateSummary();
        observer.next(updatedSalesOrder);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Check if Firebase is being used
   */
  isUsingFirebase(): boolean {
    return this.useFirebase && this.firebaseInitialized;
  }

  /**
   * Sync mock data to Firebase for first-time setup
   */
  private async syncMockDataToFirebase(
    orders: Order[],
    jobCards: JobCard[],
    salesOrders: SalesOrder[]
  ): Promise<void> {
    try {
      // Check if data already exists, if not, add mock data
      const existingOrders = await this.firebaseService.getDocuments<Order>(this.ORDERS_COLLECTION);
      if (existingOrders.length === 0) {
        for (const order of orders) {
          await this.firebaseService.addDocument(this.ORDERS_COLLECTION, order);
        }
        for (const jobCard of jobCards) {
          await this.firebaseService.addDocument(this.JOB_CARDS_COLLECTION, jobCard);
        }
        for (const salesOrder of salesOrders) {
          await this.firebaseService.addDocument(this.SALES_ORDERS_COLLECTION, salesOrder);
        }
        console.log('Mock data synced to Firebase');
      }
    } catch (error) {
      console.warn('Could not sync mock data to Firebase:', error);
    }
  }

}
