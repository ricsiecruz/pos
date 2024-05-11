import { Component, TemplateRef, ViewChild } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { ModalService } from '../../modal.service';

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
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {
  @ViewChild('sales') sales?: TemplateRef<any>;
  products: any[] = [];
  details: OrderDetails | null = null;
  totalSum: number = 0;

  constructor(
    private salesService: SalesService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.salesService.sales$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products;
        // Calculate the sum of total
        this.totalSum = this.calculateTotalSum(products);
        console.log('sum', this.totalSum)
      }
    });
  }

  openModal(product: any) {
    this.details = product;
    this.modalService.openModal(this.sales);
  }

  private calculateTotalSum(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
  }
}
