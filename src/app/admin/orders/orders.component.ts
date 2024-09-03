// orders.component.ts
import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
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
  startDate: any;
  endDate: any;
  selectedMemberId: number | null = null;
  selectedMemberName: string = 'All';
  filteredMembers: any[] = [];
  searchTerm: string = '';
  cash: any;
  gcash: any;
  kaha: any;
  currentSales: any = {};
  allSales: any = {};

  pageSize = 10;
  currentPage = 1;
  totalItems: number = 0;

  pageSizeToday = 10;
  currentPageToday = 1;
  totalItemsToday: number = 0;

  private _creditCount: number = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private salesService: SalesService,
    private membersService: MembersService,
    private modalService: ModalService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addExpensesResponse') {
        this.fetchSalesData();
      }
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if(message.action === 'newSale') {
        this.fetchSalesData();
      }
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'updateSale') {
        const updatedSale = message.data;
        this.fetchSalesData()
      }
    });

    this.salesService.sales$.subscribe((products: any) => {
      if (products && products.length > 0) {
        this.products = products;
        this.fetchSalesData();
      }
    });

    this.membersService.members$.subscribe((members: any[]) => {
      if (members && members.length > 0) {
        this.members = members;
      }
    });

    this.fetchSalesData();

    // this.salesService.getKaha().subscribe((res: any) => {
    //   if(res.length == 0) {
    //     this.kaha = 0
    //   }
    // })
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchSalesData();
  }

  get creditCount(): number {
    return this._creditCount;
  }

  set creditCount(value: number) {
    this._creditCount = value;
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

    if (this.selectedMemberName === 'All') {
      this.fetchSalesData();
    } else {
      this.salesService.getFilteredMember(this.selectedMemberName).subscribe((res: any) => {
        this.todayProducts = res.member_sales.data;
      });
    }
  }

  fetchSalesData() {
    const payload = {
      "page": this.currentPage, 
      "limit": 10
    }
    this.salesService.getSales(payload).subscribe((res: any) => {

      this.totalItems = +res.sales.totalRecords;

      this.currentSales = res.current_sales;
      this.allSales = res.sales;
      this.creditCount = res.sales.credit_count;
      this.todayProducts = this.currentSales.data;
      this.products = this.allSales.data;
      console.log('res', res)
      this.filterTodayProducts();
      this.cdr.detectChanges(); 
    });
  }  

  filterTodayProducts(): void {
    if (this.selectedMemberId === null) {
      this.filteredTodayProducts = this.todayProducts;
    } else if (this.selectedMemberId === 0) {
      this.filteredTodayProducts = this.todayProducts.filter(product => product.customer === 'Walk-in Customer');
    } else {
      this.filteredTodayProducts = this.todayProducts.filter(product => product.customer_id === this.selectedMemberId);
    }
  }

  filter(startDate: any, endDate: any, selectedMemberName: any) {
    const payload: any = { startDate, endDate };
    if (selectedMemberName !== 'All') {
      payload.customer = selectedMemberName;
    }
    this.salesService.getFilteredSales(payload).subscribe(
      (res: any) => {
        this.allSales = res.salesData;
        this.products = this.allSales.data;
      },
      (error: any) => {
        console.error('Error fetching filtered sales data:', error);
      }
    );
  }

  clearFilter() {
    this.startDate = null;
    this.endDate = null;
    this.selectedMemberId = 0;
    this.fetchSalesData();
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
