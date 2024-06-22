import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { InventoryComponent } from './admin/inventory/inventory.component';
import { ProductsComponent } from './admin/products/products.component';
import { ExpensesComponent } from './admin/expenses/expenses.component';
import { PosComponent } from './pos/pos.component';
import { AdminComponent } from './admin/admin/admin.component';
import { OrdersComponent } from './admin/orders/orders.component';
import { MembersComponent } from './admin/members/members.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pos',
    pathMatch: 'full'
  },
  {
    path: 'pos',
    component: PosComponent
  },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'inventory',
        component: InventoryComponent
      },
      {
        path: 'products',
        component: ProductsComponent
      },
      {
        path: 'sales',
        component: OrdersComponent
      },
      {
        path: 'expenses',
        component: ExpensesComponent
      },
      {
        path: 'members',
        component: MembersComponent
      }
    ]
  }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, useHash: true })
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }

