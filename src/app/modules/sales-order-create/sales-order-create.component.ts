import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SalesOrderService } from '../../services/sales-order.service';
import { ProductService } from '../../services/product.service';
import { SalesOrder, SalesOrderItem } from '../../models/sales-order.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-sales-order-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sales-order-create.component.html',
  styleUrls: ['./sales-order-create.component.scss']
})
export class SalesOrderCreateComponent implements OnInit {
    /**
     * Get total quantity of all items
     */
    getTotalQuantity(): number {
      return this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
  salesOrderForm!: FormGroup;
  items: SalesOrderItem[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Modal states
  showProductModal = false;
  searchTerm = '';
  productFilterType = '';
  productFilterCustomer = '';
  
  // UI
  nextSalesOrderId = '';
  itemSerialCounter = 0;
  isSubmitting = false;

  statusOptions = ['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  constructor(
    private fb: FormBuilder,
    private salesOrderService: SalesOrderService,
    private productService: ProductService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadNextSalesOrderId();
    this.loadProducts();
  }

  /**
   * Initialize sales order form
   */
  private initializeForm(): void {
    this.salesOrderForm = this.fb.group({
      salesOrderId: [{ value: '', disabled: true }],
      customerName: ['', Validators.required],
      customerId: [''],
      createdDate: [this.getTodayDate(), Validators.required],
      completionTargetDate: [this.getTodayDate(), Validators.required],
      status: ['DRAFT', Validators.required],
      remarks: ['']
    });
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Load next sales order ID
   */
  private loadNextSalesOrderId(): void {
    this.salesOrderService.getNextSalesOrderId().then(id => {
      this.nextSalesOrderId = id;
      this.salesOrderForm.patchValue({ salesOrderId: id });
    });
  }

  /**
   * Load products from service
   */
  private loadProducts(): void {
    this.productService.getProducts().subscribe(
      (products) => {
        this.products = products || [];
        this.filteredProducts = this.products;
      },
      (error) => {
        console.error('Error loading products:', error);
        alert('Failed to load products');
      }
    );
  }

  /**
   * Open product selection modal
   */
  openProductModal(): void {
    this.showProductModal = true;
    this.searchTerm = '';
    this.productFilterType = '';
    this.productFilterCustomer = '';
    this.applyProductFilters();
  }

  /**
   * Close product selection modal
   */
  closeProductModal(): void {
    this.showProductModal = false;
  }

  /**
   * Apply filters to products
   */
  applyProductFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch =
        product.productName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.general.symagPartNo.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.productFilterType || product.productType === this.productFilterType;
      
      // Check if product is already added (avoid duplicates)
      const isAlreadyAdded = this.items.some(item => item.productId === product.id);
      
      return matchesSearch && matchesType && !isAlreadyAdded;
    });
  }

  /**
   * Add product to sales order
   */
  addProductToOrder(product: Product): void {
    if (!product.id) {
      alert('Product ID is missing');
      return;
    }

    this.itemSerialCounter++;
    const newItem: SalesOrderItem = {
      itemSerialNo: this.itemSerialCounter,
      productId: product.id,
      productName: product.productName,
      productType: product.productType,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      jobCardNumber: `${this.nextSalesOrderId}/${this.itemSerialCounter}`,
      product: product
    };

    this.items.push(newItem);
    this.applyProductFilters(); // Refresh filtered list to remove added product
    alert(`${product.productName} added to sales order`);
  }

  /**
   * Remove product from sales order
   */
  removeProductFromOrder(index: number): void {
    this.items.splice(index, 1);
    this.applyProductFilters(); // Refresh to show removed product again
  }

  /**
   * Update item quantity
   */
  updateItemQuantity(index: number, quantity: number): void {
    if (quantity > 0) {
      this.items[index].quantity = quantity;
      this.updateItemTotal(index);
    }
  }

  /**
   * Update item unit price
   */
  updateItemPrice(index: number, price: number): void {
    this.items[index].unitPrice = price;
    this.updateItemTotal(index);
  }

  /**
   * Update item total price
   */
  private updateItemTotal(index: number): void {
    const item = this.items[index];
    item.totalPrice = (item.quantity || 0) * (item.unitPrice || 0);
  }

  /**
   * Get total order amount
   */
  getTotalOrderAmount(): number {
    return this.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }

  /**
   * Get unique product types for filter
   */
  getProductTypes(): string[] {
    return Array.from(new Set(this.products.map(p => p.productType)));
  }

  /**
   * Get product type full name
   */
  getProductTypeFullName(type: string): string {
    const names: { [key: string]: string } = {
      'CS': 'Compression Spring',
      'CCS': 'Conical Compression Spring',
      'ES': 'Extension Spring',
      'TS': 'Torsion Spring',
      'DTS': 'Double Torsion Spring',
      'WF': 'WireForm',
      'PP': 'Press Part'
    };
    return names[type] || type;
  }

  /**
   * Validate and save sales order
   */
  saveSalesOrder(): void {
    if (!this.salesOrderForm.valid) {
      alert('Please fill all required fields');
      return;
    }

    if (this.items.length === 0) {
      alert('Please add at least one product to the sales order');
      return;
    }

    this.isSubmitting = true;

    const salesOrder: SalesOrder = {
      salesOrderId: this.nextSalesOrderId,
      customerName: this.salesOrderForm.get('customerName')?.value,
      customerId: this.salesOrderForm.get('customerId')?.value,
      createdDate: this.salesOrderForm.get('createdDate')?.value,
      completionTargetDate: this.salesOrderForm.get('completionTargetDate')?.value,
      status: this.salesOrderForm.get('status')?.value,
      remarks: this.salesOrderForm.get('remarks')?.value,
      items: this.items,
      totalAmount: this.getTotalOrderAmount()
    };

    this.salesOrderService.createSalesOrder(salesOrder).subscribe(
      (id) => {
        alert(`Sales Order created successfully (ID: ${id})`);
        this.isSubmitting = false;
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Error creating sales order:', error);
        alert('Failed to create sales order');
        this.isSubmitting = false;
      }
    );
  }

  /**
   * Cancel and go back to dashboard
   */
  cancelSalesOrder(): void {
    if (confirm('Discard changes and go back to dashboard?')) {
      this.router.navigate(['/dashboard']);
    }
  }
}
