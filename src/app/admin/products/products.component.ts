import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AppService } from '../../app.service';
import { ModalService } from '../../modal.service';
import { ProductService } from '../../product.service';
import { WebSocketService } from '../../websocket-service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
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
  ) {}

  ngOnInit() {
    this.productService.products$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products;
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
      // Add new product via websocket
      this.productService.addProduct(this.newProduct)
      this.modalService.closeModal();
      this.newProduct = { product: '', price: '' };
    }
  }

  editProduct(product: any) {
    // Set editingProduct to the selected product for editing
    this.editingProduct = { ...product };
    this.modalService.openModal(this.editProductModal);
  }

  addModal() {
    this.modalService.openModal(this.addProductModal);
  }

  saveEditedProduct() {
    if (this.editingProduct) {
      // Edit product via websocket
      this.productService.editProduct(this.editingProduct.id, this.editingProduct)
        this.modalService.closeModal();
        this.editingProduct = null;
    }
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
  }  

  clearForm() {
    this.product = '';
    this.price = '';
  }

}
