import { Component, Input } from '@angular/core';
import { SalesService } from '../../../services/sales.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent {
  @Input() sales: any;
  @Input() credit: any;
  @Input() expenses: any;
  @Input() net: any;
  @Input() computer: any;
  @Input() foodDrinks: any;
  @Input() dataSource: any[] = [];
  @Input() pay!: (data: any) => void;
  @Input() openModal!: (data: any) => void;

  constructor(private salesService: SalesService) {}

  payCredit(data: any) {
    data.credit = null;
    this.salesService.editTransaction(data.id, data);
  }

  exportToExcel(): void {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    
    // Prepare data
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
      Total: `PHP ${item.total}`
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
