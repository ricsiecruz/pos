import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { SalesService } from '../../../services/sales.service';
import * as XLSX from 'xlsx';
import { AngularCsv } from 'angular7-csv/dist/Angular-csv';
import { ModalService } from '../../../modal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent {
  @Input() showStats: boolean = true;
  @Input() totalSales: number = 0;
  @Input() credit: number = 0;
  @Input() expenses: number = 0;
  @Input() net: number = 0;
  @Input() computer: number = 0;
  @Input() foodDrinks: number = 0;
  @Input() cash: number = 0;
  @Input() gcash: number = 0;
  @Input() kaha: number = 0;
  @Input() dataSource: any[] = [];
  @Input() details: any;
  @Input() pay!: (data: any) => void;
  @Input() columns!: string[];
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();
  @ViewChild('editProductModal') editProductModal!: TemplateRef<any>;
  @ViewChild('sales') sales!: TemplateRef<any>;
  @ViewChild('openKahaModal') openKahaModal!: TemplateRef<any>;
  editingProduct: any = null;
  editKaha: any = null;

  constructor(
    private router: Router,
    private salesService: SalesService,
    private modalService: ModalService,
  ) { 
    console.log('aaa', this.dataSource, this.totalItems, this.pageSize, this.currentPage)
  }

  ngOnInit() {
    console.log('dataSource', this.dataSource, this.totalItems, this.pageSize, this.currentPage)
  }

  get pages(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  isColumnVisible(column: string): boolean {
    return this.columns?.includes(column) ?? false;
  }
  
  viewMember(id: number) {
    console.log('member id', id);
    if (id != null) {
      this.router.navigate([`/admin/members/${id}`]); 
    }
  }

  payCredit(data: any) {
    console.log('data', data)
    // Create a new object excluding the member_id property
    const { ...updatedData } = {
      ...data,
      id: data.sale_id,
      credit: '0.00'
    };
  
    // Log the updated data for debugging
    console.log('pay', updatedData);
  
    // Call the service with the updated data
    this.salesService.editTransaction(updatedData.id, updatedData);
  }   

  editProduct(product: any) {
    this.editingProduct = { ...product };
    console.log('editingProduct', this.editingProduct)
    this.modalService.openModal(this.editProductModal);
  }

  openKaha(data: any) {
    console.log('data', data)
    this.editKaha = { ...data };
    this.modalService.openModal(this.openKahaModal)
  }

  viewModal(product: any) {
    this.details = product;
    this.modalService.openModal(this.sales);
  }

  saveEditedProduct() {
    if (this.editingProduct) {
      this.salesService.editLoad(this.editingProduct.id, this.editingProduct);
      this.modalService.closeModal();
      this.editingProduct = null;
    }
  }

  // saveKaha() {
  //   console.log('new kaha', this.editKaha.kaha)
  //   this.salesService.postKaha(this.editKaha.kaha);
  //   // this.modalService.closeModal();
  //   this.kaha = 0;
  // }

  cancelForm() {
    this.modalService.closeModal();
  }

  exportToCsv() {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    const filename: string = `sales_${today}.csv`;

    // Prepare data including additional fields
    const dataToExport = this.dataSource.map(item => ({
      Customer: item.customer,
      Qty: item.qty,
      Date: new Date(item.datetime).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }),
      Computer: `PHP ${item.computer}`,
      Total: `PHP ${item.total}`,
      Credit: item.credit ? `PHP ${item.credit}` : '-',
      CreditTotal: `PHP ${this.credit}`,
      ComputerTotal: `PHP ${this.computer}`,
      FoodDrinksTotal: `PHP ${this.foodDrinks}`,
      Sales: `PHP ${this.totalSales}`,
      Expenses: `PHP ${this.expenses}`,
      Net: `PHP ${this.net}`,
    }));

    // Export to CSV
    new AngularCsv(dataToExport, filename, {
      showLabels: true, 
      headers: ['Customer', 'Qty', 'Date', 'Computer', 'Total', 'Credit', 'CreditTotal', 'ComputerTotal', 'FoodDrinksTotal', 'Sales', 'Expenses', 'Net']
    });
  }

  exportToExcel(): void {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    
    // Prepare data including additional fields
    const dataToExport = this.dataSource.map(item => ({
      Customer: item.customer,
      Qty: item.qty,
      Date: new Date(item.datetime).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }),
      Computer: `PHP ${item.computer}`,
      Total: `PHP ${item.total}`,
      Credit: item.credit ? `PHP ${item.credit}` : '-',
      CreditTotal: `PHP ${this.credit}`,
      ComputerTotal: `PHP ${this.computer}`,
      FoodDrinksTotal: `PHP ${this.foodDrinks}`,
      Sales: `PHP ${this.totalSales}`,
      Expenses: `PHP ${this.expenses}`,
      Net: `PHP ${this.net}`,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales_Data');

    const filename: string = `sales_data_${today}.xlsx`;
    XLSX.writeFile(wb, filename);
  }
}
