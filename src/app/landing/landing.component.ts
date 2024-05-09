import { Component, OnInit } from '@angular/core';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
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
