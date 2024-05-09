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
  @ViewChild('addStockModal') modal: any;
  @ViewChild('addInventoryModal') addInventoryModalmodal: any;
  inventory: any[] = [];
  selectedProduct: string | null = null;
  selectedProductId: number | null = null;
  product: string = '';
  price: string = '';

  @ViewChild('editProductModal') editProductModal?: TemplateRef<any>; // Reference to the modal template
  products: any[] = [];
  newProduct: any = { product: '', price: '' };
  editingProduct: any = null;

  constructor(
    private appService: AppService,
    private modalService: ModalService,
    private productService: ProductService,
    private webSocketService: WebSocketService,
  ) {}

  ngOnInit() {
    this.productService.products$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products;
        console.log('Products received in ProductComponent:', this.products);
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
      this.productService.addProduct(this.newProduct)
        // Reset newProduct after successfully adding
        this.newProduct = { product: '', price: '' };
    }
  }

  editProduct(product: any) {
    // Set editingProduct to the selected product for editing
    this.editingProduct = { ...product };
    this.modalService.openModal(this.editProductModal);
  }

  saveEditedProduct() {
    if (this.editingProduct) {
      // Edit product via HTTP API
      this.productService.editProduct(this.editingProduct.id, this.editingProduct)
        this.modalService.closeModal();
        // Clear editingProduct after successfully editing
        this.editingProduct = null;
    }
  }

  cancelForm() {
    this.clearForm(); // Call the method to reset form fields
    this.modalService.closeModal(); // Close the modal
  }  

  clearForm() {
    this.product = '';
    this.price = '';
  }

}
