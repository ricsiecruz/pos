import { Component, ViewChild, AfterViewInit } from '@angular/core';
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
  @ViewChild(OrdersListComponent) sales!: OrdersListComponent;

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

    this.salesService.getSales().subscribe((res: any) => {
      console.log('aaa', res, res.current_sales, res.current_sales.data)
      this.todayProducts = res.current_sales.data;
      this.totalSalesSumToday = res.current_sales.income;
      this.totalExpensesToday = res.current_sales.expenses;
      this.netToday = res.current_sales.net;
      this.totalCreditCurrentDate = res.current_sales.credit;
      this.computerToday = res.current_sales.computer;
      this.totalFoodsAndDrinksToday = res.current_sales.food_and_drinks;

      this.products = res.sales.data;
      this.totalSalesSum = res.sales.income;
      this.totalExpenses = res.sales.expenses;
      this.net = res.sales.net;
      this.totalCreditAllData = res.sales.credit;
      this.computer = res.sales.computer;
      this.foodDrinks = res.sales.food_and_drinks;
    })
    this.expensesService.expenses$.subscribe((expenses: any[]) => {
      if (expenses && expenses.length > 0) {
        this.expenses = expenses;
        this.updateCalculations();
      }
    });
  }

  filter(startDate: any, endDate: any) {
    console.log('filter', startDate, endDate)
    this.salesService.getFilteredSales(startDate, endDate).subscribe(
      (res: any) => {
        console.log('filtered sales', res, res.sales.data)
        this.products = res.sales.data;
        this.totalSalesSum = res.sales.income;
        this.totalExpenses = res.sales.expenses;
        this.net = res.sales.net;
        this.totalCreditAllData = res.sales.credit;
        this.computer = res.sales.computer;
        this.foodDrinks = res.sales.food_and_drinks;
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
      (res: any) => {
        console.log('clear', res, res.total_sum, res.sales)
        this.products = res.sales.data;
        this.totalSalesSum = res.sales.income;
        this.totalExpenses = res.sales.expenses;
        this.net = res.sales.net;
        this.totalCreditAllData = res.sales.credit;
        this.computer = res.sales.computer;
        this.foodDrinks = res.sales.food_and_drinks;
      },
      (error: any) => {
        console.error('Error fetching all sales data:', error);
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
    this.totalCups = this.calculateTotalCups(this.products);
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
