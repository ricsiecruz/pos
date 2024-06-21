import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ModalService } from '../../modal.service';
import { ProductService } from '../../services/product.service';
import { WebSocketService } from '../../websocket-service';
import { WebSocketProductsService } from '../../websocket/websocket-products-service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {
  @ViewChild('editProductModal') editProductModal?: TemplateRef<any>;
  @ViewChild('addProductModal') addProductModal?: TemplateRef<any>;
  product: string = '';
  price: string = '';
  products: any[] = [];
  newProduct: any = { product: '', price: '' };
  editingProduct: any = null;

  constructor(
    private modalService: ModalService,
    private productService: ProductService,
    private webSocketService: WebSocketService,
    private webSocketProductsService: WebSocketProductsService
  ) {}

  ngOnInit() {
    this.productService.products$.subscribe((products: any[]) => {
      if (products) {
        this.products = products;
        console.log('products', this.products);
      }
    });

    this.webSocketProductsService.receive().subscribe((message: any) => {
      console.log('WebSocket message in component:', message);
      if (message.action === 'addProduct') {
        this.products.push(message.product);
      } else if (message.action === 'editProduct') {
        const index = this.products.findIndex(p => p.id === message.product.id);
        if (index !== -1) {
          this.products[index] = message.product;
          console.log('Updated product:', this.products[index]);
        }
      }
    });
  }

  addProduct() {
    if (this.newProduct.product.trim() !== '' && !isNaN(Number(this.newProduct.price))) {
      this.productService.addProduct(this.newProduct);
      this.modalService.closeModal();
      this.newProduct = { product: '', price: '' };
    }
  }

  editProduct(product: any) {
    this.editingProduct = { ...product };
    this.modalService.openModal(this.editProductModal);
  }

  addModal() {
    this.modalService.openModal(this.addProductModal);
  }

  saveEditedProduct() {
    if (this.editingProduct) {
      console.log('Saving edited product:', this.editingProduct.id, this.editingProduct);
      this.productService.editProduct(this.editingProduct.id, this.editingProduct);
      this.modalService.closeModal();
      this.editingProduct = null;
    }
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
  }

  clearForm() {
    this.newProduct = { product: '', price: '' };
  }
}
