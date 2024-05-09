import { Component } from '@angular/core';
import { AppService } from '../app.service';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent {

  products: any[] = [];

  constructor(public productService: ProductService) { }

  ngOnInit() {
    // Subscribe to the products$ observable to get the list of products
    this.productService.products$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products;
        console.log('Products received in LandingComponent:', this.products);
      }
    });
  }

}
