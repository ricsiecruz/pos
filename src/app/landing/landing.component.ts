import { Component } from '@angular/core';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  products: any[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.productService.getProducts().subscribe((products: any) => {
      this.products = products;
    });
  }
}
