import { Component, ViewChild } from '@angular/core';
import { AppService } from '../app.service';
import { ModalService } from '../modal.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent {

  @ViewChild('addStockModal') modal: any;
  inventory: any[] = [];
  stocks: string = '';
  selectedProductId: number | null = null;

  constructor(
    private appService: AppService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.appService.getInventory().subscribe((res: any) => {
      console.log('res', res)
      this.inventory = res;
    })
  }

  addStock(id: any, modalContent: any) {
    this.selectedProductId = id;
    console.log('selectedproductid', this.selectedProductId)
    console.log('id', id)
    this.modalService.openModal(modalContent)
  }

  addStockToInventory() {
    if (this.selectedProductId !== null) { // Check if a product is selected
      // Log the product ID to the console
      console.log('Product ID:', this.selectedProductId);
      
      // Log the stock quantity to the console
      console.log('Adding stock:', this.stocks);
  
      const payload = {
        stocks: this.stocks
      }
  
      // Call the API to add stock
      this.appService.putStocks(this.selectedProductId, payload).subscribe((res: any) => {
        console.log('res', res);
  
        // If stocks are successfully added, refresh the inventory list
        this.appService.getInventory().subscribe((updatedInventory: any) => {
          this.inventory = updatedInventory;
        });
      });
  
      // Close the modal
      this.modalService.closeModal();
    }
  }
  


}

