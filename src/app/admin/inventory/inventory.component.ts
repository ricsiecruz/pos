import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AppService } from '../../app.service';
import { ModalService } from '../../modal.service';
import { InventoryService } from '../../services/inventory.service';
import { WebSocketService } from '../../websocket-service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {

  @ViewChild('addStockModal') addStockModal?: TemplateRef<any>;
  @ViewChild('addInventoryModal') addInventoryModalmodal: any;
  inventory: any[] = [];
  stocks: string = '';
  selectedProduct: string | null = null;
  selectedProductId: number | null = null;
  product: string = '';
  category: string = '';
  brand: string = '';
  newInventory: any = { product: '', category: '', brand: '', stocks: '' };
  editingProduct: any = null;
  qty: string = '';

  constructor(
    private inventoryService: InventoryService,
    private webSocketService: WebSocketService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    console.log('this is inventory page')
    this.inventoryService.inventory$.subscribe((inventory: any[]) => {
      if (inventory && inventory.length > 0) {
        this.inventory = inventory;
        console.log('inventory', this.inventory)
      }
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addProduct') {
        this.inventory.push(message.product);
        console.log('...', message.product)
      }
    });
  }

  openAddInventoryModal(modalContent: any) {
    this.modalService.openModal(modalContent);
  }

  addProduct() {
    this.inventoryService.addInventory(this.newInventory)
    this.modalService.closeModal();
    this.newInventory = { product: '', category: '', brand: '', stocks: '' };
  }

  editProduct(product: any) {
    this.editingProduct = null;
    this.editingProduct = { ...product };
    this.modalService.openModal(this.addStockModal);
  }
  
  saveEditedProduct() {
    console.log('a', this.editingProduct, this.editingProduct.stocks)
    if (this.editingProduct && this.editingProduct.stocks !== undefined) {
      const newStocks = parseInt(this.qty, 10);
      if (!isNaN(newStocks)) {
        const currentStocks = parseInt(this.editingProduct.stocks, 10);
        const totalStocks = currentStocks + newStocks;
        this.editingProduct.stocks = totalStocks.toString();
        this.inventoryService.editProduct(this.editingProduct.id, this.editingProduct)
        this.modalService.closeModal();
        this.editingProduct = null;
      } else {
        console.error('Invalid stock quantity');
      }
    }
    this.clearForm();
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
  }  

  clearForm() {
    this.product = '';
    this.stocks = '';
    this.category = '';
    this.brand = '';
    this.qty = '';
  }
}
