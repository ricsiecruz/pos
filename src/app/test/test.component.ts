import { Component, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { WebSocketService } from '../websocket-service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  products: any[] = [];
  newProduct: any = { product: '', price: '' };
  editingProduct: any = null;

  constructor(
    private productService: ProductService,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit() {
    this.productService.products$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products;
        console.log('Products received in LandingComponent:', this.products);
      }
    });

    // Subscribe to WebSocket updates for new product additions
    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addProduct') {
        this.products.push(message.product);
      }
    });
  }

  addProduct() {
    if (this.newProduct.product.trim() !== '' && !isNaN(Number(this.newProduct.price))) {
      // Add new product via HTTP API
      this.productService.addProduct(this.newProduct).subscribe(() => {
        // Reset newProduct after successfully adding
        this.newProduct = { product: '', price: '' };
      });
    }
  }

  editProduct(product: any) {
    // Clone the product to avoid modifying the original object directly
    this.editingProduct = { ...product };
  }

  saveEditedProduct() {
    if (this.editingProduct) {
      // Edit product via HTTP API
      this.productService.editProduct(this.editingProduct.id, this.editingProduct).subscribe(() => {
        // Clear editingProduct after successfully editing
        this.editingProduct = null;
      });
    }
  }
}
