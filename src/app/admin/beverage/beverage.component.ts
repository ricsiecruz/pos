import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { ModalService } from '../../modal.service';
import { FoodsService } from '../../services/foods.service';
import { WebSocketService } from '../../websocket-service';
import { BeverageService } from '../../services/beverage.service';

@Component({
  selector: 'app-beverage',
  templateUrl: './beverage.component.html',
  styleUrl: './beverage.component.scss'
})
export class BeverageComponent {
  @ViewChild('addProductModal') addProductModal?: TemplateRef<any>;
  @ViewChild('addStockModal') addStockModal?: TemplateRef<any>;
  @ViewChild('editProductModal') editProductModal?: TemplateRef<any>;
  products: any[] = [];
  newProduct: any = { beverage: '', price: '', stocks: '' };
  editingProduct: any = null;
  qty: string = '';

  constructor(
    private modalService: ModalService,
    private foodsService: BeverageService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.foodsService.foods$.subscribe((products: any[]) => {
      this.products = products;
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addBeverage') {
        this.products.push(message.beverage);
        this.cdr.detectChanges();
      }
    });
  }

  editProduct(product: any) {
    this.editingProduct = { ...product };
    this.modalService.openModal(this.editProductModal);
  }

  addModal() {
    this.modalService.openModal(this.addProductModal);
  }

  addProduct() {
    console.log('a', this.newProduct)
    this.foodsService.addProduct(this.newProduct);
    this.modalService.closeModal();
    this.newProduct = { beverage: '', price: '', stocks: ''};
  }

  addStocks(product: any) {
    this.editingProduct = { ...product };
    this.modalService.openModal(this.addStockModal);
  }

  saveEditedProduct() {
    if (this.editingProduct) {
      console.log('drinks', this.editingProduct.id, this.editingProduct)
      this.foodsService.editProduct(this.editingProduct.id, this.editingProduct)
      this.modalService.closeModal();
      this.editingProduct = null;
    }
  }

  saveAddedStocks() {
    const newStocks = parseInt(this.qty, 10);
    if (!isNaN(newStocks)) {
      const currentStocks = parseInt(this.editingProduct.stocks, 10);
      const totalStocks = currentStocks + newStocks;
      this.editingProduct.stocks = totalStocks.toString();

      const updatedProducts = this.products.map(p => {
        if (p.id === this.editingProduct.id) {
          return { ...p, stocks: this.editingProduct.stocks };
        }
        return p;
      });
      this.products = updatedProducts;

      this.foodsService.addStocks(this.editingProduct.id, this.editingProduct);
      this.modalService.closeModal();
      this.editingProduct = null;
    } else {
      console.error('Invalid stock quantity');
    }
    this.clearForm();
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
  }

  clearForm() {
    this.newProduct = { product: '', price: '', stocks: '' };
  }
}
