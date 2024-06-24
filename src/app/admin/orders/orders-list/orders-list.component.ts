import { Component, Input } from '@angular/core';
import { SalesService } from '../../../services/sales.service';

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
  @Input() dataSource: any[] = [];
  @Input() pay!: (data: any) => void;
  @Input() openModal!: (data: any) => void;

  constructor(private salesService: SalesService) {}
  
  payCredit(data: any) {
    data.credit = null;
    this.salesService.editTransaction(data.id, data)
  }
}
