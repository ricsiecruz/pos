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
  products: any[] = [];
  details: OrderDetails | null = null;
  totalSum: number = 0;
  totalCups: number = 0;
  subtotal: number = 0; // Variable to hold subtotal

  constructor(
    private salesService: SalesService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    console.log('this is sales page')
    this.salesService.sales$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products;
        console.log('aaa', this.products)
        this.totalSum = this.calculateTotalSum(products);
        this.totalCups = this.calculateTotalCups(products);
        this.subtotal = this.calculateSubtotal(products); // Calculate subtotal
        console.log('subtotal', this.subtotal)
      }
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

  private calculateTotalSum(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
  }

  private calculateTotalCups(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.qty), 0);
  }
  
  pay(data: any) {
    data.credit = null;
    this.salesService.editTransaction(data.id, data)
    console.log('Credit set to null for:', data);
  }
}
