import { Component, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FoodsService } from '../../services/foods.service';
import { ModalService } from '../../modal.service';
import { WebSocketService } from '../../websocket-service';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.scss']
})
export class FoodsComponent {

  @ViewChild('addProductModal') addProductModal?: TemplateRef<any>;
  @ViewChild('addStockModal') addStockModal?: TemplateRef<any>;
  products: any[] = [];
  newProduct: any = { food: '', price: '', stocks: '' };
  editingProduct: any = null;
  qty: string = '';

  constructor(
    private modalService: ModalService,
    private foodsService: FoodsService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.foodsService.foods$.subscribe((products: any[]) => {
      this.products = products; // Update products array
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addProduct') {
        this.products.push(message.product); // Handle addProduct action
        this.cdr.detectChanges(); // Detect changes manually
      }
    });
  }

  addModal() {
    this.modalService.openModal(this.addProductModal);
  }

  addProduct() {
    // Example validation before adding product
    if (this.newProduct.food.trim() !== '' && !isNaN(Number(this.newProduct.price))) {
      this.foodsService.addProduct(this.newProduct);
      this.modalService.closeModal();
      this.newProduct = { food: '', price: '', stocks: '' };
    }
  }

  editProduct(product: any) {
    this.editingProduct = { ...product }; // Ensure immutability
    this.modalService.openModal(this.addStockModal);
  }

  saveEditedProduct() {
    // if (this.editingProduct && this.qty.trim() !== '') {
      const newStocks = parseInt(this.qty, 10);
      if (!isNaN(newStocks)) {
        const currentStocks = parseInt(this.editingProduct.stocks, 10);
        const totalStocks = currentStocks + newStocks;
        this.editingProduct.stocks = totalStocks.toString();

        // Update the product in the products array (ensure immutability)
        const updatedProducts = this.products.map(p => {
          if (p.id === this.editingProduct.id) {
            return { ...p, stocks: this.editingProduct.stocks };
          }
          return p;
        });
        this.products = updatedProducts;

        this.foodsService.editProduct(this.editingProduct.id, this.editingProduct);
        this.modalService.closeModal();
        this.editingProduct = null;
      } else {
        console.error('Invalid stock quantity');
      }
    // }
    this.clearForm();
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
  }

  clearForm() {
    this.newProduct = { food: '', price: '', stocks: '' };
  }
}
