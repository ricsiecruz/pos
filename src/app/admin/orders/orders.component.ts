import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { ModalService } from '../../modal.service';
import { WebSocketService } from '../../websocket-service';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { MembersService } from '../../services/members.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  @ViewChild(OrdersListComponent) sales!: OrdersListComponent;

  products: any[] = [];
  todayProducts: any[] = [];
  filteredTodayProducts: any[] = [];
  expenses: any[] = [];
  todayExpenses: any[] = [];
  members: any[] = [];
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
  selectedMemberId: number | null = null;
  selectedMemberName: string = 'All';
  filteredMembers: any[] = [];
  searchTerm: string = '';

  constructor(
    private salesService: SalesService,
    private membersService: MembersService,
    private modalService: ModalService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    // Subscribe to WebSocket messages
    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addExpensesResponse') {
        this.fetchSalesData();
      }
    });

    this.fetchSalesData();

    this.membersService.members$.subscribe((members: any[]) => {
      if (members && members.length > 0) {
        this.members = members;
      }
    });
  }

  filterMembers(): void {
    this.filteredMembers = this.members.filter(member =>
      member.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onMemberChange(): void {
    this.filterTodayProducts();
    const selectedMember = this.selectedMemberId === null
      ? { name: 'All' }
      : this.members.find(member => member.id === this.selectedMemberId);
    this.selectedMemberName = selectedMember ? selectedMember.name : 'Walk-in Customer';
    console.log('member', this.selectedMemberName, this.selectedMemberId);

    if(this.selectedMemberName == 'All') {
      this.fetchSalesData()
    }

    this.salesService.getFilteredMember(this.selectedMemberName).subscribe((res: any) => {
      this.todayProducts = res.member_sales.data
    })
  }  

  fetchSalesData() {
    this.salesService.getSales().subscribe((res: any) => {
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

      // Filter the products based on the selected member
      this.filterTodayProducts();
    });
  }

  filterTodayProducts(): void {
    if (this.selectedMemberId === null) {
      this.filteredTodayProducts = this.todayProducts; // Show all products
    } else if (this.selectedMemberId === 0) {
      this.filteredTodayProducts = this.todayProducts.filter(product => product.customer === 'Walk-in Customer');
    } else {
      this.filteredTodayProducts = this.todayProducts.filter(product => product.customer_id === this.selectedMemberId);
    }
    console.log('aaa', this.filteredTodayProducts)
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
    if (this.filteredTodayProducts.length > 0) {
      this.sales.exportToCsv();
    } else {
      alert('No data available for export.');
    }
  }

  exportTodaySalesToExcel(): void {
    if (this.filteredTodayProducts.length > 0) {
      this.sales.exportToExcel();
    } else {
      alert('No data available for export.');
    }
  }
}
