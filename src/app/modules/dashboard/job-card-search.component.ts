import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesOrderService } from '../../services/sales-order.service';
import { SalesOrder, SalesOrderItem } from '../../models/sales-order.model';
import { JobCardDetailComponent } from '../sales-order-master/job-card-detail.component';

@Component({
  selector: 'app-job-card-search',
  standalone: true,
  imports: [CommonModule, FormsModule, JobCardDetailComponent],
  templateUrl: './job-card-search.component.html',
  styleUrls: ['./job-card-search.component.scss']
})
export class JobCardSearchComponent {
  jobCardSearchTerm = '';
  isSearchingJobCard = false;
  showJobCardDetail = false;
  selectedOrder: SalesOrder | null = null;
  selectedOrderItem: SalesOrderItem | null = null;
  searchResult: { salesOrder: SalesOrder; item: SalesOrderItem } | null = null;

  constructor(private salesOrderService: SalesOrderService, private cdr: ChangeDetectorRef) {}

  /**
   * Search for job card by job card ID
   */
  searchJobCard(): void {
    if (!this.jobCardSearchTerm.trim()) {
      alert('Please enter a job card number');
      return;
    }

    console.log('Starting job card search for:', this.jobCardSearchTerm.trim());
    this.isSearchingJobCard = true;
    this.searchResult = null; // Clear previous results
    console.log('Cleared previous search result');
    this.salesOrderService.searchJobCardById(this.jobCardSearchTerm.trim()).subscribe(
      (result) => {
        console.log('Job card search result:', result);
        this.isSearchingJobCard = false;
        if (result) {
          // Store the search result to display
          this.searchResult = result;
          console.log('Search result set:', this.searchResult);
        } else {
          this.searchResult = null;
          alert(`Job card "${this.jobCardSearchTerm}" not found. Please check the job card number format (e.g., SO-001/1)`);
        }
        // Manually trigger change detection
        
        this.cdr.detectChanges();
      },
      (error) => {
        this.isSearchingJobCard = false;
        this.searchResult = null;
        console.error('Error searching job card:', error);
        alert('Error searching for job card. Please try again.');
        this.cdr.detectChanges();
      }
    );
  }

  /**
   * Open job card detail dialog
   */
  viewJobCardDetails(): void {
    if (this.searchResult) {
      this.selectedOrder = this.searchResult.salesOrder;
      this.selectedOrderItem = this.searchResult.item;
      this.showJobCardDetail = true;
    }
  }

  /**
   * Close job card detail dialog
   */
  closeJobCardDetail(): void {
    this.showJobCardDetail = false;
    this.selectedOrder = null;
    this.selectedOrderItem = null;
  }

  /**
   * Handle Enter key press in job card search
   */
  onJobCardSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchJobCard();
    }
  }
}