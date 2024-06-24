import { Component, TemplateRef, ViewChild } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { ModalService } from '../../modal.service';
import { ExpensesService } from '../../services/expenses.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {
  @ViewChild('sales') sales?: TemplateRef<any>;
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

  constructor(
    private salesService: SalesService,
    private expensesService: ExpensesService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.salesService.sales$.subscribe((products: any) => {
    
      if (products && products.length > 0) {
        this.products = [];
        products.forEach((order: any) => {
          this.products.push(...order.sales);
          let totalSalesAmount = order.sales.reduce((acc: number, sale: any) => {
            return acc + parseFloat(sale.total);
          }, 0);
        });
    
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
        console.log('sum', this.totalSalesSum)
      },
      error => {
        console.error('Error fetching total sales sum:', error);
      }
    );

    this.salesService.getTotalSalesSumToday().subscribe(
      totalSumToday => {
        this.totalSalesSumToday = totalSumToday;
        console.log('sum today', this.totalSalesSumToday)
      },
      error => {
        console.error('Error fetching total sales sum:', error);
      }
    );
  }

  private updateCalculations() {
    this.filterTodayProducts();
    this.filterTodayExpenses();

    this.totalCups = this.calculateTotalCups(this.products);

    // Net calculations
    this.totalExpenses = this.calculateTotalExpenses(this.expenses);
    this.totalExpensesToday = this.calculateTotalExpenses(this.todayExpenses);
    this.net = this.totalSalesSum - this.totalExpenses;
    this.netToday = this.totalSalesSumToday - this.totalExpensesToday;

    // Credit calculations
    this.totalCreditAllData = this.calculateCredit(this.products);
    this.totalCreditCurrentDate = this.calculateCredit(this.todayProducts);

    // Computer calculations
    this.computer = this.calculateComputer(this.products);
    this.computerToday = this.calculateComputer(this.todayProducts);

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
    const computer = products.reduce((acc: any, curr: any) => {
      const computerValue = parseFloat(curr.computer?.toString() ?? '0');
      return acc + computerValue;
    }, 0);
    return computer;
  }

  openModal(product: any) {
    this.details = product;
    this.modalService.openModal(this.sales);
  }

  private calculateTotalCups(products: any): number {
    return products.reduce((acc: any, curr: any) => {
      // Check if curr.qty is defined and not null before accessing toString()
      const qty = curr.qty !== undefined && curr.qty !== null ? parseFloat(curr.qty.toString()) : 0;
      return acc + qty;
    }, 0);
  }
  

  private calculateCredit(products: any): number {
    return products.reduce((acc: any, curr: any) => {
      // Check if curr.credit is null or undefined before accessing toString()
      const credit = curr.credit !== null && curr.credit !== undefined ? parseFloat(curr.credit.toString()) : 0;
      return acc + credit;
    }, 0);
  }
  

  private calculateTotalExpenses(expenses: any[]): number {
    const totalExpenses = expenses.reduce((acc, curr) => {
      const parsedAmount = parseFloat(curr.amount?.toString() ?? '0');
      return acc + parsedAmount;
    }, 0);
    return totalExpenses;
  }

  pay(data: any) {
    data.credit = null;
    this.salesService.editTransaction(data.id, data);
  }
}
