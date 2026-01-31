import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SalesOrderService } from '../../services/sales-order.service';
import { SalesOrder, SalesOrderItem } from '../../models/sales-order.model';
import { JobCardDetailComponent } from './job-card-detail.component';

@Component({
  selector: 'app-sales-order-master',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, JobCardDetailComponent],
  templateUrl: './sales-order-master.component.html',
  styleUrls: ['./sales-order-master.component.scss']
})
export class SalesOrderMasterComponent implements OnInit {
  salesOrders: SalesOrder[] = [];
  filteredSalesOrders: SalesOrder[] = [];
  searchTerm = '';
  filterStatus = '';
  isLoading = false;
  showViewModal = false;
  showDeleteConfirm = false;
  showJobCardDetail = false;
  selectedOrder: SalesOrder | null = null;
  selectedOrderItem: SalesOrderItem | null = null;
  orderToDelete: SalesOrder | null = null;

  statusOptions = ['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  sortBy = 'createdDate';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private salesOrderService: SalesOrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSalesOrders();
  }

  /**
   * Load all sales orders from service
   */
  loadSalesOrders(): void {
    this.isLoading = true;
    this.salesOrderService.getSalesOrders().subscribe(
      (orders) => {
        this.salesOrders = orders || [];
        // Ensure all data is shown by applying sort and filter immediately
        this.applySortAndFilter();
        this.isLoading = false;
        // Trigger change detection to update the template
        this.cdr.markForCheck();
      },
      (error) => {
        console.error('Error loading sales orders:', error);
        this.salesOrders = [];
        this.filteredSalesOrders = [];
        this.isLoading = false;
        this.cdr.markForCheck();
        alert('Failed to load sales orders');
      }
    );
  }

  /**
   * Apply search, filter, and sort
   */
  applySortAndFilter(): void {
    this.filteredSalesOrders = this.salesOrders.filter(order => {
      const matchesSearch =
        order.salesOrderId?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.filterStatus || order.status === this.filterStatus;

      return matchesSearch && matchesStatus;
    });

    this.sortSalesOrders();
  }

  /**
   * Sort sales orders
   */
  sortSalesOrders(): void {
    this.filteredSalesOrders.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortBy) {
        case 'salesOrderId':
          aValue = a.salesOrderId || '';
          bValue = b.salesOrderId || '';
          break;
        case 'customerName':
          aValue = a.customerName || '';
          bValue = b.customerName || '';
          break;
        case 'totalAmount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'createdDate':
        default:
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  /**
   * Trigger search
   */
  onSearch(): void {
    this.applySortAndFilter();
  }

  /**
   * Trigger filter
   */
  onFilterChange(): void {
    this.applySortAndFilter();
  }

  /**
   * Change sort
   */
  onSortChange(): void {
    this.sortSalesOrders();
  }

  /**
   * Toggle sort order
   */
  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortSalesOrders();
  }

  /**
   * View sales order details
   */
  viewOrder(order: SalesOrder): void {
    this.selectedOrder = order;
    this.showViewModal = true;
  }

  /**
   * Close view modal
   */
  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedOrder = null;
  }

  /**
   * View job card details for an order item
   */
  viewJobCardDetail(item: SalesOrderItem): void {
    this.selectedOrderItem = item;
    this.showJobCardDetail = true;
  }

  /**
   * Close job card detail modal
   */
  closeJobCardDetail(): void {
    this.showJobCardDetail = false;
    this.selectedOrderItem = null;
  }

  /**
   * Edit sales order
   */
  editOrder(order: SalesOrder): void {
    if (order.id) {
      this.router.navigate(['/sales-order-edit', order.id]);
    }
  }

  /**
   * Open delete confirmation
   */
  confirmDelete(order: SalesOrder): void {
    this.orderToDelete = order;
    this.showDeleteConfirm = true;
  }

  /**
   * Delete sales order
   */
  deleteSalesOrder(): void {
    if (this.orderToDelete?.id) {
      this.salesOrderService.deleteSalesOrder(this.orderToDelete.id).subscribe(
        () => {
          alert('Sales order deleted successfully');
          this.showDeleteConfirm = false;
          this.orderToDelete = null;
          this.loadSalesOrders();
        },
        (error) => {
          console.error('Error deleting sales order:', error);
          alert('Failed to delete sales order');
        }
      );
    }
  }

  /**
   * Cancel delete
   */
  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.orderToDelete = null;
  }

  /**
   * Create new sales order
   */
  createNewOrder(): void {
    this.router.navigate(['/sales-order-create']);
  }

  /**
   * Format date for display
   */
  formatDate(date: any): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'DRAFT': '#FFC107',
      'CONFIRMED': '#2196F3',
      'IN_PROGRESS': '#FF9800',
      'COMPLETED': '#4CAF50',
      'CANCELLED': '#f44336'
    };
    return colors[status] || '#999';
  }
}
