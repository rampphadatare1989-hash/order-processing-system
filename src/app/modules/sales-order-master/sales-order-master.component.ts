import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SalesOrderService } from '../../services/sales-order.service';
import { SalesOrder, SalesOrderItem } from '../../models/sales-order.model';
import { JobCardDetailComponent } from './job-card-detail.component';
import { PDIReportComponent } from './pdi-report.component';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-sales-order-master',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, JobCardDetailComponent, PDIReportComponent],
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
  showPDIReport = false;

  statusOptions = ['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  sortBy = 'createdDate';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private salesOrderService: SalesOrderService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSalesOrders();

    // Check for job card search parameters
    this.route.queryParams.subscribe(params => {
      if (params['orderId'] && params['itemSerialNo']) {
        this.handleJobCardSearch(params['orderId'], parseInt(params['itemSerialNo'], 10), params['highlightJobCard']);
      }
    });
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
   * Handle open PDI report request from job card detail
   */
  onOpenPDIReport(): void {
    this.closeJobCardDetail();
    // Open PDI report after a short delay to ensure modal closes first
    setTimeout(() => {
      this.showPDIReport = true;
    }, 100);
  }

  /**
   * Close PDI report modal
   */
  closePDIReport(): void {
    this.showPDIReport = false;
    this.closeJobCardDetail();
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

  /**
   * Handle job card search from dashboard
   */
  private handleJobCardSearch(orderId: string, itemSerialNo: number, highlightJobCard?: string): void {
    // Wait for sales orders to load, then find and open the specific job card
    const checkOrdersLoaded = () => {
      const targetOrder = this.salesOrders.find(order => order.id === orderId);
      if (targetOrder) {
        const targetItem = targetOrder.items?.find(item => item.itemSerialNo === itemSerialNo);
        if (targetItem) {
          // Clear query parameters
          this.router.navigate([], { queryParams: {} });

          // Open the job card detail
          this.selectedOrder = targetOrder;
          this.selectedOrderItem = targetItem;
          this.showJobCardDetail = true;

          // Scroll to the job card section if highlightJobCard is provided
          if (highlightJobCard) {
            setTimeout(() => {
              const jobCardElement = document.querySelector('.job-card-detail');
              if (jobCardElement) {
                jobCardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Add a temporary highlight effect
                jobCardElement.classList.add('highlight-job-card');
                setTimeout(() => {
                  jobCardElement.classList.remove('highlight-job-card');
                }, 3000);
              }
            }, 500);
          }
        }
      } else {
        // If orders not loaded yet, wait a bit and try again
        setTimeout(checkOrdersLoaded, 100);
      }
    };

    checkOrdersLoaded();
  }
}
