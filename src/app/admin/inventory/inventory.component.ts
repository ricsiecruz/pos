import { Component, ViewChild } from '@angular/core';
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

  @ViewChild('addStockModal') modal: any;
  @ViewChild('addInventoryModal') addInventoryModalmodal: any;
  inventory: any[] = [];
  stocks: string = '';
  selectedProduct: string | null = null;
  selectedProductId: number | null = null;
  product: string = '';
  category: string = '';
  brand: string = '';
  newInventory: any = { product: '', category: '', brand: '', stocks: '' };

  constructor(
    private appService: AppService,
    private invetoryService: InventoryService,
    private webSocketService: WebSocketService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    // this.loadInventory();
    this.invetoryService.inventory$.subscribe((inventory: any[]) => {
      if (inventory && inventory.length > 0) {
        this.inventory = inventory;
      }
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addProduct') {
        this.inventory.push(message.product);
      }
    });
  }

  loadInventory() {
    this.invetoryService.getInventory().subscribe((res: any) => {
      console.log('res', res);
      this.inventory = res;
    });
  }

  openAddInventoryModal(modalContent: any) {
    this.modalService.openModal(modalContent);
  }

  addProduct() {
    // if (this.newInventory.product.trim() !== '' && !isNaN(Number(this.newInventory.price))) {
      this.invetoryService.addInventory(this.newInventory)
      this.modalService.closeModal();
      this.newInventory = { product: '', category: '', brand: '', stocks: '' };
    // }
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
  }

  updateInventory() {
    this.loadInventory();
  }
}
