import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { ModalService } from '../../modal.service';
import { WebSocketService } from '../../websocket-service';
import { OrdersListComponent } from './orders-list/orders-list.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
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
  totalFoodsAndDrinksToday: number = 0;
  startDate: any;
  endDate: any;

  constructor(
    private salesService: SalesService,
    private modalService: ModalService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    // Subscribe to WebSocket messages
    this.webSocketService.receive().subscribe((message: any) => {
      console.log('WebSocket message received:', message); // Log entire message for inspection
      
      // Check for action type 'addExpensesResponse'
      if (message.action === 'addExpensesResponse') {
        console.log('Expense added:', message.expense);

        // Update sales data upon expense addition
        this.fetchSalesData();
      }
    });

    // Fetch initial sales data
    this.fetchSalesData();
  }

  ngOnDestroy() {
    // Clean up subscriptions if needed
  }

  // Function to fetch sales data from SalesService
  fetchSalesData() {
    this.salesService.getSales().subscribe((res: any) => {
      // Assign fetched data to component variables
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
    });
  }

  filter(startDate: any, endDate: any) {
    this.salesService.getFilteredSales(startDate, endDate).subscribe(
      (res: any) => {
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

  openModal(product: any) {
    this.details = product;
    this.modalService.openModal(this.sales.editProductModal);
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
