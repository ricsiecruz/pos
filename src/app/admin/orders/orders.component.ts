import { Component, TemplateRef, ViewChild } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { ModalService } from '../../modal.service';
import { ExpensesService } from '../../services/expenses.service';

interface OrderDetails {
  datetime: string;
  id: number;
  orders: {
    price: string;
    total: number;
    product: string;
    quantity: number;
  }[];
  qty: number;
  total: string;
  transactionid: string;
  computer: string;
  subtotal: number;
  credit: number;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {
  @ViewChild('sales') sales?: TemplateRef<any>;
  products: OrderDetails[] = [];
  todayProducts: OrderDetails[] = [];
  expenses: any[] = [];
  todayExpenses: any[] = [];
  details: OrderDetails | null = null;
  totalSum: number = 0;
  totalCups: number = 0;
  subtotal: number = 0;
  todaySubtotal: number = 0;
  totalCreditCurrentDate: number = 0;
  totalCreditAllData: number = 0;
  totalExpenses: number = 0;
  totalExpensesToday: number = 0;
  net: number = 0;
  netToday: number = 0;

  constructor(
    private salesService: SalesService,
    private expensesService: ExpensesService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.salesService.sales$.subscribe((products: OrderDetails[]) => {
      if (products && products.length > 0) {
        this.products = products;
        this.filterTodayProducts();
        this.filterTodayExpenses();
        this.totalSum = this.calculateTotalSum(products);
        this.totalCups = this.calculateTotalCups(products);

        this.subtotal = this.calculateSubtotal(products);
        this.todaySubtotal = this.calculateSubtotal(this.todayProducts);

        // Calculate net and netToday
        this.net = this.subtotal - this.totalExpenses;
        this.netToday = this.todaySubtotal - this.totalExpensesToday;

        console.log('net', this.net, 'today', this.netToday)

        console.log('subtotal', this.subtotal, 'today', this.todaySubtotal);

        this.totalCreditAllData = this.calculateCredit(products);
        this.totalCreditCurrentDate = this.calculateCredit(this.todayProducts);
      }
    });

    this.expensesService.expenses$.subscribe((expenses: any[]) => {
      if (expenses && expenses.length > 0) {
        this.expenses = expenses;
        this.filterTodayExpenses();
        this.totalExpenses = this.calculateTotalExpenses(expenses);
        this.totalExpensesToday = this.calculateTotalExpenses(this.todayExpenses);

        // Update net and netToday after expenses are updated
        this.net = this.subtotal - this.totalExpenses;
        this.netToday = this.todaySubtotal - this.totalExpensesToday;

        console.log('expenses', this.totalExpenses, 'today', this.totalExpensesToday);
      }
    });
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

  private calculateSubtotal(products: OrderDetails[]): number {
    return products.reduce((acc, curr) => {
      return acc + curr.orders.reduce((orderAcc, orderCurr) => orderAcc + orderCurr.total, 0);
    }, 0);
  }

  openModal(product: any) {
    this.details = product;
    this.modalService.openModal(this.sales);
  }

  private calculateTotalSum(products: OrderDetails[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
  }

  private calculateTotalCups(products: OrderDetails[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.qty.toString()), 0);
  }

  private calculateCredit(products: OrderDetails[]): number {
    return products.reduce((acc, curr) => acc + (curr.credit !== null && curr.credit !== undefined ? parseFloat(curr.credit.toString()) : 0), 0);
  }

  private calculateTotalExpenses(expenses: any[]): number {
    return expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  }

  pay(data: any) {
    data.credit = null;
    this.salesService.editTransaction(data.id, data);
  }
}
