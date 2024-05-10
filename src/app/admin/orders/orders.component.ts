import { Component } from '@angular/core';
import { SalesService } from '../../services/sales.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {

  products: any[] = [];
  
  constructor(private salesService: SalesService) {}

  ngOnInit() {
    this.salesService.sales$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products;
        console.log("a", this.products)
      }
    });
  }

}
