import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { OrderSummary } from '../../models/spring-part.model';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobCardSearchComponent } from './job-card-search.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, JobCardSearchComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  orderSummary: OrderSummary | null = null;
  products: Product[] = [];
  loading = true;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.orderService.getOrderSummary().subscribe(summary => {
      this.orderSummary = summary;
      this.loading = false;
    });
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  get activeProductsCount(): number {
    return this.products.filter(p => p.status === 'ACTIVE').length;
  }

  get inactiveProductsCount(): number {
    return this.products.filter(p => p.status === 'INACTIVE').length;
  }

  get archivedProductsCount(): number {
    return this.products.filter(p => p.status === 'ARCHIVED').length;
  }
}
