import { Component } from '@angular/core';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent {

  products: any[] = [];
  selectedProducts: any[] = [];

  constructor(public productService: ProductService) { }

  ngOnInit() {
    // Subscribe to the products$ observable to get the list of products
    this.productService.products$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products.map(product => ({ ...product, counter: 0 }));
      }
    });
  }

  addToRightDiv(product: any) {
    // Check if the product already exists in selectedProducts
    const existingProductIndex = this.selectedProducts.findIndex(selectedProduct => selectedProduct.product === product.product);

    if (existingProductIndex === -1) {
        // If the product doesn't exist, add it to selectedProducts
        product.counter++;
        this.selectedProducts.push(product);
    } else {
        // If the product already exists, increment its counter
        this.selectedProducts[existingProductIndex].counter++;
    }
}

}
