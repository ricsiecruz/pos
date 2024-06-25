import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { SalesService } from '../../../services/sales.service';
import * as XLSX from 'xlsx';
import { ModalService } from '../../../modal.service';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent {
  @Input() totalSales: number = 0;
  @Input() credit: number = 0;
  @Input() expenses: number = 0;
  @Input() net: number = 0;
  @Input() computer: number = 0;
  @Input() foodDrinks: number = 0;
  @Input() dataSource: any[] = [];
  @Input() details: any;
  @Input() pay!: (data: any) => void;
  @ViewChild('editProductModal') editProductModal?: TemplateRef<any>;
  @ViewChild('sales') sales?: TemplateRef<any>;
  editingProduct: any = null;

  constructor(
    private salesService: SalesService,
    private modalService: ModalService,
  ) {}

  payCredit(data: any) {
    data.credit = null;
    this.salesService.editTransaction(data.id, data);
  }

  editProduct(product: any) {
    this.editingProduct = { ...product };
    this.modalService.openModal(this.editProductModal);
  }

  view(product: any) {
    this.details = product
    this.modalService.openModal(this.sales);
  }

  saveEditedProduct() {
    if (this.editingProduct) {
      console.log('drinks', this.editingProduct.id, this.editingProduct)
      this.salesService.editLoad(this.editingProduct.id, this.editingProduct)
      this.modalService.closeModal();
      this.editingProduct = null;
    }
  }

  cancelForm() {
    this.modalService.closeModal();
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
      Credit: item.credit ? `PHP ${item.credit}` : '-',
      Total: `PHP ${item.total}`,
      Sales: `PHP ${this.totalSales}`,
      Expenses: `PHP ${this.expenses}`,
      Net: `PHP ${this.net}`,
      CreditTotal: `PHP ${this.credit}`,
      ComputerTotal: `PHP ${this.computer}`,
      FoodDrinksTotal: `PHP ${this.foodDrinks}`
    }));

    // Convert data to worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

    // Create a workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales_Data');

    // Generate a download link
    const filename: string = `sales_data_${today}.xlsx`;
    XLSX.writeFile(wb, filename);
  }
}
