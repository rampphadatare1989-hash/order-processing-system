import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SalesOrderService } from '../../services/sales-order.service';
import { ProductService } from '../../services/product.service';
import { SalesOrder, SalesOrderItem } from '../../models/sales-order.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-sales-order-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sales-order-edit.component.html',
  styleUrls: ['./sales-order-edit.component.scss']
})
export class SalesOrderEditComponent implements OnInit {
  salesOrderForm!: FormGroup;
  items: SalesOrderItem[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Modal states
  showProductModal = false;
  searchTerm = '';
  productFilterType = '';
  
  // UI
  itemSerialCounter = 0;
  isSubmitting = false;
  isLoading = false;
  salesOrderId = '';

  statusOptions = ['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  constructor(
    private fb: FormBuilder,
    private salesOrderService: SalesOrderService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.salesOrderId = params['id'];
      if (this.salesOrderId) {
        this.loadSalesOrder();
      }
    });
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
   * Load sales order data
   */
  private loadSalesOrder(): void {
    this.isLoading = true;
    this.salesOrderService.getSalesOrderById(this.salesOrderId).subscribe(
      (order) => {
        if (order) {
          this.items = order.items || [];
          this.itemSerialCounter = this.items.length > 0 
            ? Math.max(...this.items.map(i => i.itemSerialNo))
            : 0;
          
          this.salesOrderForm.patchValue({
            salesOrderId: order.salesOrderId,
            customerName: order.customerName,
            customerId: order.customerId,
            createdDate: order.createdDate,
            completionTargetDate: order.completionTargetDate,
            status: order.status,
            remarks: order.remarks
          });
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading sales order:', error);
        alert('Failed to load sales order');
        this.isLoading = false;
      }
    );
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
      jobCardNumber: `${this.salesOrderForm.get('salesOrderId')?.value}/${this.itemSerialCounter}`,
      product: product
    };

    this.items.push(newItem);
    this.applyProductFilters();
    alert(`${product.productName} added to sales order`);
  }

  /**
   * Remove product from sales order
   */
  removeProductFromOrder(index: number): void {
    this.items.splice(index, 1);
    this.applyProductFilters();
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
   * Get total quantity
   */
  getTotalQuantity(): number {
    return this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
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
      id: this.salesOrderId,
      salesOrderId: this.salesOrderForm.get('salesOrderId')?.value,
      customerName: this.salesOrderForm.get('customerName')?.value,
      customerId: this.salesOrderForm.get('customerId')?.value,
      createdDate: this.salesOrderForm.get('createdDate')?.value,
      completionTargetDate: this.salesOrderForm.get('completionTargetDate')?.value,
      status: this.salesOrderForm.get('status')?.value,
      remarks: this.salesOrderForm.get('remarks')?.value,
      items: this.items,
      totalAmount: this.getTotalOrderAmount()
    };

    this.salesOrderService.updateSalesOrder(this.salesOrderId, salesOrder).subscribe(
      () => {
        alert('Sales Order updated successfully');
        this.isSubmitting = false;
        this.router.navigate(['/sales-order-master']);
      },
      (error) => {
        console.error('Error updating sales order:', error);
        alert('Failed to update sales order');
        this.isSubmitting = false;
      }
    );
  }

  /**
   * Cancel and go back to master
   */
  cancelSalesOrder(): void {
    if (confirm('Discard changes and go back to Sales Order Master?')) {
      this.router.navigate(['/sales-order-master']);
    }
  }
}
