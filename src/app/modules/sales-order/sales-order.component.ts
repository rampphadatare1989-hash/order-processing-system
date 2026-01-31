import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { SalesOrder } from '../../models/spring-part.model';

@Component({
  selector: 'app-sales-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-order.component.html',
  styleUrls: ['./sales-order.component.scss']
})
export class SalesOrderComponent implements OnInit {
  salesOrders: SalesOrder[] = [];
  filteredSalesOrders: SalesOrder[] = [];
  
  // Filter properties
  searchTerm: string = '';
  statusFilter: string = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  selectedOrder: SalesOrder | null = null;
  showDetails = false;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSalesOrders();
  }

  /**
   * Load sales orders from service
   */
  private loadSalesOrders(): void {
    this.orderService.getSalesOrders().subscribe(
      (orders) => {
        this.salesOrders = orders;
        this.applyFilters();
      },
      (error) => {
        console.error('Error loading sales orders:', error);
        alert('Failed to load sales orders');
      }
    );
  }

  /**
   * Apply filters to sales orders
   */
  applyFilters(): void {
    this.filteredSalesOrders = this.salesOrders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.salesOrderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || order.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    this.totalPages = Math.ceil(this.filteredSalesOrders.length / this.pageSize);
    this.currentPage = 1;
  }

  /**
   * Get paginated orders
   */
  getPaginatedOrders(): SalesOrder[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredSalesOrders.slice(start, end);
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
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  /**
   * Select order to view details
   */
  selectOrder(order: SalesOrder): void {
    this.selectedOrder = order;
    this.showDetails = true;
  }

  /**
   * Close details view
   */
  closeDetails(): void {
    this.showDetails = false;
    this.selectedOrder = null;
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      OPEN: '#2196F3',
      PROCESSING: '#FF9800',
      COMPLETED: '#4CAF50',
      CANCELLED: '#F44336',
      PENDING: '#FF9800',
      IN_PRODUCTION: '#FF6F00',
      ON_HOLD: '#D32F2F'
    };
    return colors[status] || '#999999';
  }

  /**
   * Get progress percentage based on order status
   */
  getProgressPercentage(status: string): string {
    const progressMap: { [key: string]: number } = {
      PENDING: 0,
      IN_PRODUCTION: 50,
      COMPLETED: 100,
      ON_HOLD: 25,
      CANCELLED: 0,
      OPEN: 0,
      PROCESSING: 50
    };
    return `${progressMap[status] || 0}%`;
  }
}
