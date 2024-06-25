import { Component, ViewChild } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { ModalService } from '../../modal.service';
import { ExpensesService } from '../../services/expenses.service';
import { OrdersListComponent } from './orders-list/orders-list.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {
  @ViewChild('sales') sales!: OrdersListComponent;

  products: any[] = [];
  todayProducts: any[] = [];
  expenses: any[] = [];
  todayExpenses: any[] = [];
  details: any;
  totalCups: number = 0;
  totalCreditCurrentDate: number = 0;
  totalCreditAllData: number = 0;
  totalExpenses: number = 0;
  totalExpensesToday: number = 0;
  net: number = 0;
  netToday: number = 0;
  computer: number = 0;
  computerToday: number = 0;
  totalSalesSum: number = 0;
  totalSalesSumToday: number = 0;
  foodDrinks: number = 0;
  foodDrinksToday: number = 0;
  totalFoodsAndDrinksToday: number = 0;
  startDate: any;
  endDate: any;

  constructor(
    private salesService: SalesService,
    private expensesService: ExpensesService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.salesService.sales$.subscribe((products: any) => {
      if (products && products.length > 0) {
        this.products = products;
        this.updateCalculations();
      }
    });

    this.expensesService.expenses$.subscribe((expenses: any[]) => {
      if (expenses && expenses.length > 0) {
        this.expenses = expenses;
        this.updateCalculations();
      }
    });

    this.salesService.getTotalSalesSum().subscribe(
      totalSum => {
        this.totalSalesSum = totalSum;
      },
      error => {
        console.error('Error fetching total sales sum:', error);
      }
    );

    this.salesService.getCurrentDateSales().subscribe((res: any) => {
      this.todayProducts = res;
    })
  }

  filter(startDate: any, endDate: any) {
    console.log('filter', startDate, endDate)
    this.salesService.getFilteredSales(startDate, endDate).subscribe(
      (data: any) => {
        console.log('data', data)
        this.products = data;
        // Calculate other statistics based on filtered data if necessary.
      },
      (error: any) => {
        console.error('Error fetching filtered sales data:', error);
      }
    );
  }

  clearFilter() {
    this.startDate = null;
    this.endDate = null;
    this.salesService.getSales().subscribe(
      (data: any) => {
        console.log('clear', data, data.total_sum)
        this.products = data.total_sum;
        // Calculate other statistics based on all data if necessary.
      },
      (error: any) => {
        console.error('Error fetching all sales data:', error);
      }
    );
  }

  calculateSalesToday() {
    this.salesService.getTotalSalesSumToday().subscribe(
      totalSumToday => {
        this.totalSalesSumToday = totalSumToday;  
        this.foodDrinksToday = this.totalSalesSumToday - this.computerToday;
      },
      error => {
        console.error('Error fetching total sales sum:', error);
      }
    );
  }

  calculateFoodsAndDrinksToday() {
    this.salesService.getSumOfFoodsAndDrinksForToday().subscribe(
      res => {
        this.totalFoodsAndDrinksToday = res;
      },
      error => {
        console.error('Error:', error);
      }
    )
  }

  private updateCalculations() {
    this.filterTodayProducts();
    this.filterTodayExpenses();
    this.calculateSalesToday();
    this.calculateFoodsAndDrinksToday();
    this.totalCups = this.calculateTotalCups(this.products);
    this.totalExpenses = this.calculateTotalExpenses(this.expenses);
    this.totalExpensesToday = this.calculateTotalExpenses(this.todayExpenses);
    this.net = this.totalSalesSum - this.totalExpenses;
    this.netToday = this.totalSalesSumToday - this.totalExpensesToday;
    this.totalCreditAllData = this.calculateCredit(this.products);
    this.totalCreditCurrentDate = this.calculateCredit(this.todayProducts);
    this.computer = this.calculateComputer(this.products);
    this.computerToday = this.calculateComputer(this.todayProducts);
    this.foodDrinks = this.totalSalesSum - this.computer;
    this.foodDrinksToday = this.totalSalesSumToday - this.computerToday;
  }

  filterTodayProducts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.todayProducts = this.products.filter(product => {
      const productDate = new Date(product.datetime);
      productDate.setHours(0, 0, 0, 0);
      return productDate.getTime() === today.getTime();
    });
  }

  filterTodayExpenses() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.todayExpenses = this.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      expenseDate.setHours(0, 0, 0, 0);
      return expenseDate.getTime() === today.getTime();
    });
  }  

  private calculateComputer(products: any): number {
    return products.reduce((acc: any, curr: any) => {
      const computerValue = parseFloat(curr.computer?.toString() ?? '0');
      return acc + computerValue;
    }, 0);
  }

  openModal(product: any) {
    this.details = product;
    this.modalService.openModal(this.sales.editProductModal);
  }

  private calculateTotalCups(products: any): number {
    return products.reduce((acc: any, curr: any) => {
      const qty = curr.qty !== undefined && curr.qty !== null ? parseFloat(curr.qty.toString()) : 0;
      return acc + qty;
    }, 0);
  }
  
  private calculateCredit(products: any): number {
    return products.reduce((acc: any, curr: any) => {
      const credit = curr.credit !== null && curr.credit !== undefined ? parseFloat(curr.credit.toString()) : 0;
      return acc + credit;
    }, 0);
  }
  
  private calculateTotalExpenses(expenses: any[]): number {
    return expenses.reduce((acc, curr) => {
      const parsedAmount = parseFloat(curr.amount?.toString() ?? '0');
      return acc + parsedAmount;
    }, 0);
  }

  pay(data: any) {
    data.credit = null;
    this.salesService.editTransaction(data.id, data);
  }

  exportTodaySalesToCsv(): void {
    if (this.todayProducts.length > 0) {
      this.sales.exportToCsv();
    } else {
      alert('No data available for export.');
    }
  }

  exportTodaySalesToExcel(): void {
    if (this.todayProducts.length > 0) {
      this.sales.exportToExcel();
    } else {
      alert('No data available for export.');
    }
  }
}
