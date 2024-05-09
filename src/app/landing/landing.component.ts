// landing.component.ts

import { Component, OnInit } from '@angular/core';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  products: any[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit() {
    // Fetch initial products using HTTP API
    this.productService.getProducts().subscribe((products: any) => {
      this.products = products;
      console.log('a', this.products)
    });

    // Subscribe to WebSocket updates for real-time changes
    // this.productService.products$.subscribe((products: any) => {
    //   this.products = products;
    //   console.log('b', this.products)
    // });
  }
}
