import { Routes } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ProductMasterComponent } from './modules/product-master/product-master.component';
import { SalesOrderCreateComponent } from './modules/sales-order-create/sales-order-create.component';
import { SalesOrderEditComponent } from './modules/sales-order-edit/sales-order-edit.component';
import { SalesOrderMasterComponent } from './modules/sales-order-master/sales-order-master.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'product-master', component: ProductMasterComponent },
  { path: 'sales-order-create', component: SalesOrderCreateComponent },
  { path: 'sales-order-edit/:id', component: SalesOrderEditComponent },
  { path: 'sales-order-master', component: SalesOrderMasterComponent }
];
