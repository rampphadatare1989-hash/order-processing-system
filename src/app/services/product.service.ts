import { Injectable, OnDestroy } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { FirebaseService } from './firebase-db.service';

/**
 * Service for managing Products/Parts Master data
 * Supports CRUD operations for products
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService implements OnDestroy {
  private products$ = new BehaviorSubject<Product[]>([]);
  private productCounter = 2000;

  // Firebase collection name
  private readonly PRODUCTS_COLLECTION = 'products';

  // Use Firebase flag
  private useFirebase = true;

  constructor(private firebaseService: FirebaseService) {
    this.initializeService();
  }

  /**
   * Implement OnDestroy lifecycle
   */
  ngOnDestroy(): void {
    this.products$.complete();
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
      // Listen to products in real-time
      this.firebaseService.listenToCollection<Product>(
        this.PRODUCTS_COLLECTION,
        undefined,
        (products) => {
          try {
            const convertedProducts = products.map(product => this.convertProductDates(product));
            this.products$.next(convertedProducts);
            
            // If no products exist, seed with mock data
            if (convertedProducts.length === 0) {
              this.seedMockDataToFirebase();
            }
          } catch (error) {
            console.error('Error converting product data:', error);
          }
        },
        (error) => {
          console.error('Error loading products from Firebase:', error);
          this.loadMockData();
        }
      );
    } catch (error) {
      console.warn('Firebase listenToCollection failed:', error);
      this.loadMockData();
    }
  }

  /**
   * Convert various date formats to Date objects
   */
  private convertProductDates(product: any): Product {
    return {
      ...product,
      createdAt: this.convertToDate(product.createdAt),
      updatedAt: this.convertToDate(product.updatedAt)
    };
  }

  /**
   * Helper method to convert various date formats to Date object
   */
  private convertToDate(value: any): Date {
    if (!value) return new Date();
    
    if (value instanceof Date) {
      return value;
    }
    
    if (typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
      return value.toDate();
    }
    
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    console.warn('Could not convert value to date:', value);
    return new Date();
  }

  /**
   * Load mock data
   */
  private loadMockData(): void {
    const mockProducts: Product[] = [
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
          freeLength: { value_mm: 25.0, tolerance_mm: 0.5 }
        },
        loadsRatesDeflection: {
          springRate: { value_N_per_mm: 15.5, tolerance_N_per_mm: 0.5 },
          lengthAtLoad1_mm: 20,
          load1_N: 100,
          deflectionAtLoad1_mm: 5,
          operatingTemp_C: 80,
          cycles: 1000000,
          surfaceTreatment: 'Zinc'
        },
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
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
          freeLength: { value_mm: 30.0, tolerance_mm: 0.6 }
        },
        loadsRatesDeflection: {
          springRate: { value_N_per_mm: 18.2, tolerance_N_per_mm: 0.6 },
          lengthAtLoad1_mm: 25,
          load1_N: 150,
          deflectionAtLoad1_mm: 6,
          operatingTemp_C: 120,
          cycles: 2000000,
          surfaceTreatment: 'Nickle'
        },
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
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
          freeLength: { value_mm: 50.0, tolerance_mm: 1.0 }
        },
        loadsRatesDeflection: {
          springRate: { value_N_per_mm: 12.8, tolerance_N_per_mm: 0.4 },
          lengthAtLoad1_mm: 45,
          load1_N: 80,
          deflectionAtLoad1_mm: 4,
          operatingTemp_C: 100,
          cycles: 500000,
          surfaceTreatment: 'Powder Coating'
        },
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
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
          helix: 'RHS'
        },
        loadsRatesDeflection: {
          springRate: { value_N_per_mm: 14.5, tolerance_N_per_mm: 0.5 },
          operatingTemp_C: 90,
          cycles: 1500000,
          surfaceTreatment: 'Zinc'
        },
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'System',
        updatedBy: 'System'
      },
      {
        id: 'PROD-005',
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
          freeLength: { value_mm: 20.0, tolerance_mm: 0.4 }
        },
        loadsRatesDeflection: {
          springRate: { value_N_per_mm: 11.2, tolerance_N_per_mm: 0.4 },
          operatingTemp_C: 110,
          cycles: 2500000,
          surfaceTreatment: 'Nickle'
        },
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'System',
        updatedBy: 'System'
      },
      {
        id: 'PROD-006',
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
          freeLength: { value_mm: 27.0, tolerance_mm: 0.5 }
        },
        loadsRatesDeflection: {
          springRate: { value_N_per_mm: 17.3, tolerance_N_per_mm: 0.5 },
          lengthAtLoad1_mm: 22,
          load1_N: 120,
          deflectionAtLoad1_mm: 5.5,
          operatingTemp_C: 95,
          cycles: 1800000,
          surfaceTreatment: 'Zinc'
        },
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'System',
        updatedBy: 'System'
      },
      {
        id: 'PROD-007',
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
          freeLength: { value_mm: 45.0, tolerance_mm: 1.0 }
        },
        loadsRatesDeflection: {
          springRate: { value_N_per_mm: 28.5, tolerance_N_per_mm: 1.0 },
          lengthAtLoad1_mm: 35,
          load1_N: 300,
          deflectionAtLoad1_mm: 10,
          operatingTemp_C: 85,
          cycles: 500000,
          surfaceTreatment: 'Zinc'
        },
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'System',
        updatedBy: 'System'
      },
      {
        id: 'PROD-008',
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
          freeLength: { value_mm: 15.0, tolerance_mm: 0.3 }
        },
        loadsRatesDeflection: {
          springRate: { value_N_per_mm: 5.2, tolerance_N_per_mm: 0.2 },
          operatingTemp_C: 37,
          cycles: 10000000,
          surfaceTreatment: 'Nickle'
        },
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'System',
        updatedBy: 'System'
      },
      {
        id: 'PROD-009',
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
          freeLength: { value_mm: 32.0, tolerance_mm: 0.6 }
        },
        loadsRatesDeflection: {
          springRate: { value_N_per_mm: 16.8, tolerance_N_per_mm: 0.5 },
          operatingTemp_C: 150,
          cycles: 3000000,
          surfaceTreatment: 'EP'
        },
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'System',
        updatedBy: 'System'
      }
    ];
    
    this.products$.next(mockProducts);
  }

  /**
   * Get all products as Observable
   */
  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  /**
   * Get all products as current value
   */
  getProductsSync(): Product[] {
    return this.products$.value;
  }

  /**
   * Get product by ID
   */
  getProductById(productId: string): Observable<Product | undefined> {
    return new Observable((observer) => {
      const product = this.products$.value.find(p => p.id === productId);
      observer.next(product);
      observer.complete();
    });
  }

  /**
   * Create a new product
   */
  createProduct(product: Product): Observable<Product> {
    return new Observable((observer) => {
      try {
        // Auto-generate ID if not provided
        const newProduct: Product = {
          ...product,
          id: product.id || `PROD-${++this.productCounter}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'ACTIVE'
        };

        if (this.useFirebase) {
          this.firebaseService.addDocument(this.PRODUCTS_COLLECTION, newProduct)
            .then((documentId: string) => {
              newProduct.id = documentId;
              const updatedProducts = [...this.products$.value, newProduct];
              this.products$.next(updatedProducts);
              observer.next(newProduct);
              observer.complete();
            })
            .catch((error: any) => {
              console.error('Error creating product in Firebase:', error);
              observer.error(error);
            });
        } else {
          const updatedProducts = [...this.products$.value, newProduct];
          this.products$.next(updatedProducts);
          observer.next(newProduct);
          observer.complete();
        }
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Update an existing product
   */
  updateProduct(productId: string, productData: Partial<Product>): Observable<Product> {
    return new Observable((observer) => {
      try {
        const existingProduct = this.products$.value.find(p => p.id === productId);
        
        if (!existingProduct) {
          observer.error(new Error(`Product with ID ${productId} not found`));
          return;
        }

        const updatedProduct: Product = {
          ...existingProduct,
          ...productData,
          id: productId,
          updatedAt: new Date()
        };

        if (this.useFirebase) {
          this.firebaseService.updateDocument(this.PRODUCTS_COLLECTION, productId, updatedProduct)
            .then(() => {
              const updatedProducts = this.products$.value.map(p =>
                p.id === productId ? updatedProduct : p
              );
              this.products$.next(updatedProducts);
              observer.next(updatedProduct);
              observer.complete();
            })
            .catch((error: any) => {
              console.error('Error updating product in Firebase:', error);
              observer.error(error);
            });
        } else {
          const updatedProducts = this.products$.value.map(p =>
            p.id === productId ? updatedProduct : p
          );
          this.products$.next(updatedProducts);
          observer.next(updatedProduct);
          observer.complete();
        }
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Delete/Archive a product
   */
  deleteProduct(productId: string): Observable<void> {
    return new Observable((observer) => {
      try {
        const existingProduct = this.products$.value.find(p => p.id === productId);
        
        if (!existingProduct) {
          observer.error(new Error(`Product with ID ${productId} not found`));
          return;
        }

        if (this.useFirebase) {
          this.firebaseService.deleteDocument(this.PRODUCTS_COLLECTION, productId)
            .then(() => {
              const updatedProducts = this.products$.value.filter(p => p.id !== productId);
              this.products$.next(updatedProducts);
              observer.next();
              observer.complete();
            })
            .catch((error: any) => {
              console.error('Error deleting product from Firebase:', error);
              observer.error(error);
            });
        } else {
          const updatedProducts = this.products$.value.filter(p => p.id !== productId);
          this.products$.next(updatedProducts);
          observer.next();
          observer.complete();
        }
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Archive a product (mark as inactive)
   */
  archiveProduct(productId: string): Observable<Product> {
    return this.updateProduct(productId, { status: 'ARCHIVED' });
  }

  /**
   * Get active products only
   */
  getActiveProducts(): Observable<Product[]> {
    return new Observable((observer) => {
      this.products$.subscribe(
        (products) => {
          observer.next(products.filter(p => p.status === 'ACTIVE'));
          observer.complete();
        }
      );
    });
  }

  /**
   * Search products by name or part number
   */
  searchProducts(searchTerm: string): Observable<Product[]> {
    return new Observable((observer) => {
      this.products$.subscribe(
        (products) => {
          const filtered = products.filter(p =>
            p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.general.symagPartNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.general.customerPartNo && p.general.customerPartNo.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          observer.next(filtered);
          observer.complete();
        }
      );
    });
  }

  /**
   * Seed mock data to Firebase (called when collection is empty)
   */
  private seedMockDataToFirebase(): void {
    if (!this.useFirebase) return;

    const mockProducts: Product[] = this.products$.value;
    
    if (mockProducts.length === 0) {
      console.log('ℹ️ No products to seed');
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;

      mockProducts.forEach(product => {
        this.firebaseService.addDocument(this.PRODUCTS_COLLECTION, product)
          .then(() => {
            successCount++;
            console.log(`✅ Seeded product: ${product.productName}`);
          })
          .catch((error: any) => {
            errorCount++;
            console.error(`❌ Error seeding product ${product.productName}:`, error.message);
          });
      });

      // Log summary after a short delay to ensure all operations start
      setTimeout(() => {
        console.log(`📊 Product Seeding Summary: ${successCount} succeeded, ${errorCount} failed`);
      }, 1000);
    } catch (error) {
      console.error('❌ Error during product seeding:', error);
    }
  }
}

