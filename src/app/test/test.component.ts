import { Component } from '@angular/core';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent {
  products: any[] = [];
  newProduct: any = { name: '', price: '' };

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.productService.getProducts().subscribe((products: any) => {
      this.products = products;
    });
  }  

  addProduct() {
    if (this.newProduct.name.trim() !== '' && !isNaN(Number(this.newProduct.price))) {
      this.productService.addProduct(this.newProduct);
      this.newProduct = { name: '', price: '' };
    }
  }
}
