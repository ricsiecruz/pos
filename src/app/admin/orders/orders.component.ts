import { Component, ViewChild, OnInit, ChangeDetectorRef } from "@angular/core";
import { SalesService } from "../../services/sales.service";
import { ModalService } from "../../modal.service";
import { OrdersListComponent } from "./orders-list/orders-list.component";
import { MembersService } from "../../services/members.service";

@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.scss"],
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
  selectedMemberName: string = "All";
  filteredMembers: any[] = [];
  searchTerm: string = "";
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
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.salesService.sales$.subscribe((products: any[]) => {
      // ✅ Check if it's an array
      if (Array.isArray(products)) {
        this.todayProducts = products;
        this.currentSales.credit = products.reduce((sum, p) => sum + (p.credit || 0), 0);
      } else {
        console.warn("Expected array from sales$, got:", products);
        this.todayProducts = [];
        this.currentSales.credit = 0;
      }
    });

    window.addEventListener("storage", (event) => {
      if (event.key === "sales") {
        console.log("yey");
        this.salesService.loadSalesFromStorage();
      }
    });

    this.membersService.members$.subscribe((members: any[]) => {
      if (members && members.length > 0) {
        this.members = members;
      }
    });

    this.fetchSalesData();
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
    this.filteredMembers = this.members.filter((member) =>
      member.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onMemberChange(): void {
    this.filterTodayProducts();
    const selectedMember =
      this.selectedMemberId === null
        ? { name: "All" }
        : this.members.find((member) => member.id === this.selectedMemberId);
    this.selectedMemberName = selectedMember ? selectedMember.name : "Walk-in Customer";

    if (this.selectedMemberName === "All") {
      this.fetchSalesData();
    } else {
      this.salesService.getFilteredMember(this.selectedMemberName).subscribe((res: any) => {
        this.todayProducts = res.member_sales.data;
      });
    }
  }

  fetchSalesData() {
    const payload = {
      page: this.currentPage,
      limit: 10,
    };
    this.salesService.getSales(payload).subscribe((res: any) => {
      this.totalItems = +res.sales.totalRecords;

      this.currentSales = res.current_sales;
      this.allSales = res.sales;
      this.creditCount = res.sales.credit_count;
      this.todayProducts = this.currentSales.data;
      this.products = this.allSales.data;
      console.log("fetch sales data", res);
      this.filterTodayProducts();
      this.cdr.detectChanges();
    });
  }

  filterTodayProducts(): void {
    if (this.selectedMemberId === null) {
      this.filteredTodayProducts = this.todayProducts;
    } else if (this.selectedMemberId === 0) {
      this.filteredTodayProducts = this.todayProducts.filter(
        (product) => product.customer === "Walk-in Customer"
      );
    } else {
      this.filteredTodayProducts = this.todayProducts.filter(
        (product) => product.customer_id === this.selectedMemberId
      );
    }
  }

  filter(startDate: any, endDate: any, selectedMemberName: any) {
    const payload: any = { startDate, endDate };
    if (selectedMemberName !== "All") {
      payload.customer = selectedMemberName;
    }
    this.salesService.getFilteredSales(payload).subscribe(
      (res: any) => {
        this.allSales = res.salesData;
        this.products = this.allSales.data;
      },
      (error: any) => {
        console.error("Error fetching filtered sales data:", error);
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
    const id = data.id || data.sale_id;

    this.salesService.updateLocalCredit(id, null); // update localStorage credit to null

    // Optionally sync to server (via WebSocket or REST)
    this.salesService.editTransaction(id, {
      ...data,
      credit: null,
      mode_of_payment: "cash", // or 'gcash' if applicable
    });

    // Optionally re-fetch fresh data
    this.fetchSalesData();
  }

  exportTodaySalesToCsv(): void {
    if (this.filteredTodayProducts.length > 0) {
      this.sales.exportToCsv();
    } else {
      alert("No data available for export.");
    }
  }

  exportTodaySalesToExcel(): void {
    if (this.filteredTodayProducts.length > 0) {
      this.sales.exportToExcel();
    } else {
      alert("No data available for export.");
    }
  }
}
