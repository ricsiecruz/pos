import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ModalService } from '../../modal.service';
import { ProductService } from '../../services/product.service';
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
    console.log('aaa')
    this.productService.products$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products;
        console.log('products', this.products)
      }
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addProduct') {
        this.products.push(message.product);
      }
    });
  }

  addProduct() {
    if (this.newProduct.product.trim() !== '' && !isNaN(Number(this.newProduct.price))) {
      this.productService.addProduct(this.newProduct)
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
      console.log('drinks', this.editingProduct.id, this.editingProduct)
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
    this.newProduct = { product: '', price: '' };
  }

}
