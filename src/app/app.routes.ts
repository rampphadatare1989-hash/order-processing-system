import { Routes } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ProductMasterComponent } from './modules/product-master/product-master.component';
import { SalesOrderCreateComponent } from './modules/sales-order-create/sales-order-create.component';
import { SalesOrderEditComponent } from './modules/sales-order-edit/sales-order-edit.component';
import { SalesOrderMasterComponent } from './modules/sales-order-master/sales-order-master.component';
import { LoginComponent } from './modules/login/login.component';
import { UserManagementComponent } from './modules/user-management/user-management.component';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'product-master', component: ProductMasterComponent, canActivate: [AuthGuard] },
  { path: 'sales-order-create', component: SalesOrderCreateComponent, canActivate: [AuthGuard] },
  { path: 'sales-order-edit/:id', component: SalesOrderEditComponent, canActivate: [AuthGuard] },
  { path: 'sales-order-master', component: SalesOrderMasterComponent, canActivate: [AuthGuard] },
  { path: 'user-management', component: UserManagementComponent, canActivate: [AuthGuard] }
];
