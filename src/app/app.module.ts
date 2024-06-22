import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './admin/sidebar/sidebar.component';
import { InventoryComponent } from './admin/inventory/inventory.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { ProductsComponent } from './admin/products/products.component';
import { ExpensesComponent } from './admin/expenses/expenses.component';
import { PosComponent } from './pos/pos.component';
import { AdminComponent } from './admin/admin/admin.component';
import { NoDataComponent } from './admin/no-data/no-data.component';
import { OrdersComponent } from './admin/orders/orders.component';
import { MembersComponent } from './admin/members/members.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    InventoryComponent,
    DashboardComponent,
    ProductsComponent,
    ExpensesComponent,
    PosComponent,
    AdminComponent,
    NoDataComponent,
    OrdersComponent,
    MembersComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NgSelectModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
