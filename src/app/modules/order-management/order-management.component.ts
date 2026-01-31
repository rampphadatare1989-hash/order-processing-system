import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/spring-part.model';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({
        opacity: 1,
        transform: 'scale(1)'
      })),
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'scale(0.95)'
        }),
        animate('300ms ease-in')
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({
          opacity: 0,
          transform: 'scale(0.95)'
        }))
      ])
    ])
  ]
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  
  // Filter properties
  statusFilter: string = '';
  orderIdFilter: string = '';
  salesOrderIdFilter: string = '';
  jobCardIdFilter: string = '';
  createdDateFromFilter: string = '';
  createdDateToFilter: string = '';
  completionDateFromFilter: string = '';
  completionDateToFilter: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Modal properties
  showDetailModal = false;
  selectedOrder: Order | null = null;
  showEditModal = false;

  statusOptions = ['PENDING', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED'];
  productTypeOptions = ['CS', 'CCS', 'ES', 'TS', 'DTS', 'WF', 'PP'];

  constructor(private orderService: OrderService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  /**
   * Load orders from service
   */
  private loadOrders(): void {
    this.orderService.getOrders().subscribe(orders => {
      this.orders = orders;
      this.applyFilters();
      // Trigger change detection to update the template
      this.cdr.markForCheck();
    });
  }

  /**
   * Apply all filters
   */
  applyFilters(): void {
    let filtered = [...this.orders];

    // Filter by status
    if (this.statusFilter) {
      filtered = filtered.filter(o => o.status === this.statusFilter);
    }

    // Filter by order ID
    if (this.orderIdFilter) {
      filtered = filtered.filter(o =>
        o.id.toLowerCase().includes(this.orderIdFilter.toLowerCase())
      );
    }

    // Filter by sales order ID
    if (this.salesOrderIdFilter) {
      filtered = filtered.filter(o =>
        o.salesOrderId.toLowerCase().includes(this.salesOrderIdFilter.toLowerCase())
      );
    }

    // Filter by job card ID
    if (this.jobCardIdFilter) {
      filtered = filtered.filter(o =>
        o.jobCardId.toLowerCase().includes(this.jobCardIdFilter.toLowerCase())
      );
    }

    // Filter by created date range
    if (this.createdDateFromFilter && this.createdDateToFilter) {
      const fromDate = new Date(this.createdDateFromFilter);
      const toDate = new Date(this.createdDateToFilter);
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.createdDate);
        return orderDate >= fromDate && orderDate <= toDate;
      });
    }

    // Filter by completion date range
    if (this.completionDateFromFilter && this.completionDateToFilter) {
      const fromDate = new Date(this.completionDateFromFilter);
      const toDate = new Date(this.completionDateToFilter);
      filtered = filtered.filter(o => {
        if (!o.completionDate) return false;
        const orderDate = new Date(o.completionDate);
        return orderDate >= fromDate && orderDate <= toDate;
      });
    }

    this.filteredOrders = filtered;
    this.calculatePagination();
  }

  /**
   * Calculate pagination
   */
  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  /**
   * Get orders for current page
   */
  getPaginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.statusFilter = '';
    this.orderIdFilter = '';
    this.salesOrderIdFilter = '';
    this.jobCardIdFilter = '';
    this.createdDateFromFilter = '';
    this.createdDateToFilter = '';
    this.completionDateFromFilter = '';
    this.completionDateToFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   * View order details
   */
  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showDetailModal = true;
  }

  /**
   * Close detail modal
   */
  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedOrder = null;
  }

  /**
   * Edit order status
   */
  editOrderStatus(order: Order): void {
    this.selectedOrder = order;
    this.showEditModal = true;
  }

  /**
   * Close edit modal
   */
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedOrder = null;
  }

  /**
   * Update order status
   */
  updateOrderStatus(newStatus: Order['status']): void {
    if (!this.selectedOrder) {
      console.error('No order selected for update');
      return;
    }
    this.orderService.updateOrderStatus(this.selectedOrder.id, newStatus).subscribe(() => {
      this.closeEditModal();
      this.loadOrders();
    });
  }

  /**
   * Delete order
   */
  deleteOrder(orderId: string): void {
    if (confirm('Are you sure you want to delete this order?')) {
      // Implement delete functionality in service
      this.loadOrders();
    }
  }

  /**
   * Export to CSV
   */
  exportToCSV(): void {
    const headers = ['Order ID', 'Sales Order ID', 'Job Card ID', 'Product Type', 'Quantity', 'Created Date', 'Status'];
    let csv = headers.join(',') + '\n';

    this.filteredOrders.forEach(order => {
      csv += [
        order.id,
        order.salesOrderId,
        order.jobCardId,
        order.itemDetails.productType,
        order.quantity,
        new Date(order.createdDate).toISOString().split('T')[0],
        order.status
      ].join(',') + '\n';
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `orders-${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      COMPLETED: '#4CAF50',
      PENDING: '#FF9800',
      IN_PRODUCTION: '#2196F3',
      CANCELLED: '#F44336'
    };
    return colors[status] || '#999999';
  }

  /**
   * Next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  /**
   * Previous page
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  /**
   * Safe date conversion - ensures we always have a valid Date object
   */
  safeDate(date: any): Date | null {
    if (!date) return null;
    
    if (date instanceof Date) {
      return isNaN(date.getTime()) ? null : date;
    }
    
    if (typeof date === 'object' && date.toDate) {
      try {
        return date.toDate();
      } catch {
        return null;
      }
    }
    
    try {
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  }
}
