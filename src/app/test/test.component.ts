// test.component.ts

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
  newProduct: any = { name: '', price: '' };
  editingProduct: any = null;

  constructor(private productService: ProductService, private webSocketService: WebSocketService) { }

  ngOnInit() {
    // Fetch initial products using HTTP API
    this.productService.getProducts().subscribe((products: any) => {
      this.products = products;
    });

    // Subscribe to WebSocket updates for real-time changes
    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'updateProducts') {
        this.products = message.products;
      }
    });
  }

  addProduct() {
    if (this.newProduct.name.trim() !== '' && !isNaN(Number(this.newProduct.price))) {
      // Add new product via HTTP API
      this.productService.addProduct(this.newProduct).subscribe(() => {
        // Reset newProduct after successfully adding
        this.newProduct = { name: '', price: '' };
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
