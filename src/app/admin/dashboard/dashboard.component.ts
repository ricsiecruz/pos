import { Component } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { ExpensesService } from '../../services/expenses.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  mostOrdered: any[] = [];
  products: any[] = [];
  expenses: any[] = [];
  totalSalesSum: number = 0;
  totalExpenses: number = 0;
  net: number = 0;
  totalCups: number = 0;

  constructor(
    private dashboardService: DashboardService,
    private salesService: SalesService,
    private expensesService: ExpensesService
  ) {}

  ngOnInit() {
    this.salesService.sales$.subscribe((products: any) => {
      if (products && products.length > 0) {
        this.totalCups = this.calculateTotalCups(products);
      }
    });

    this.expensesService.expenses$.subscribe((products: any) => {
      if (products && products.length > 0) {
        this.expenses = products;
        this.totalExpenses = this.calculateTotalExpenses(products);
      }
    });

    this.salesService.getTotalSalesSum().subscribe(
      totalSum => {
        this.totalSalesSum = totalSum;
        this.net = this.totalSalesSum - this.totalExpenses
        console.log('net', this.totalSalesSum - this.totalExpenses)
      },
      error => {
        console.error('Error fetching total sales sum:', error);
      }
    );

    this.dashboardService.products$.subscribe(
      (data: any) => {
        if (data && data.length > 0 && data[0]) {
          this.mostOrdered = data[0].mostOrdered;
        }
      },
      error => {
        console.error('Error fetching most ordered products:', error);
      }
    );

    this.dashboardService.getStat().subscribe((res: any) => {
      console.log('stat', res)
    })

  }

  private calculateTotalExpenses(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  }

  private calculateTotalCups(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.qty), 0);
  }
}
