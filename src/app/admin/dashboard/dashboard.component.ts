import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ModalService } from '../../modal.service';
import { SalesService } from '../../services/sales.service';
import { ExpensesService } from '../../services/expenses.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @ViewChild('sales') sales?: TemplateRef<any>;
  mostOrdered: any[] = [];
  products: any[] = [];
  expenses: any[] = [];
  totalSum: number = 0;
  totalExpenses: number = 0;
  totalCups: number = 0;

  constructor(
    private dashboardService: DashboardService,
    private salesService: SalesService,
    private expensesService: ExpensesService
  ) {}

  ngOnInit() {
    this.salesService.sales$.subscribe((products: any) => {
      if (products && products.length > 0) {
        this.totalSum = this.calculateTotalSum(products);
        this.totalCups = this.calculateTotalCups(products);
      }
    });

    this.expensesService.expenses$.subscribe((products: any) => {
      if (products && products.length > 0) {
        this.expenses = products;
        this.totalExpenses = this.calculateTotalExpenses(products);
      }
    });

    this.dashboardService.products$.subscribe((data: any) => {
      console.log('Received data from dashboard service:', data, data[0].mostOrdered);
      this.mostOrdered = data[0].mostOrdered
      console.log('Most Ordered Products:', this.mostOrdered);
      // if (data && data.most_ordered && data.most_ordered.length > 0) {
      //   this.mostOrdered = data.most_ordered;
      //   console.log('Most Ordered Products:', this.mostOrdered);
      // } else {
      //   console.warn('Unexpected data structure or empty data received.');
      // }
    }, error => {
      console.error('Error fetching most ordered products:', error);
    });
  }

  private calculateTotalSum(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
  }

  private calculateTotalExpenses(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  }

  private calculateTotalCups(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.qty), 0);
  }
}
