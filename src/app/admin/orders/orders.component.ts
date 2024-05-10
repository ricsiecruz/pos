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
  details: OrderDetails | null = null; // Specify the type as OrderDetails

  constructor(
    private salesService: SalesService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.salesService.sales$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products;
        console.log("a", this.products);
      }
    });
  }

  openModal(product: any) {
    // Set editingProduct to the selected product for editing
    console.log("c", product);
    this.details = product;
    this.modalService.openModal(this.sales);
  }
}
