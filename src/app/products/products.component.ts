import { Component, ViewChild } from '@angular/core';
import { AppService } from '../app.service';
import { ModalService } from '../modal.service';

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

  constructor(
    private appService: AppService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.appService.getProducts().subscribe((res: any) => {
      this.inventory = res;
    });
  }

  edit(id: any, data: any, modalContent: any) {
    this.selectedProductId = id;
    this.selectedProduct = data.product;
    this.price = data.price;
    this.modalService.openModal(modalContent);
  }

  openAddInventoryModal(modalContent: any) {
    this.modalService.openModal(modalContent);
  }

  save() {
    if (this.selectedProductId !== null) {
  
      const payload = { price: this.price };

      this.appService.putProduct(this.selectedProductId, payload).subscribe((res: any) => {
        this.updateInventory();
      });
  
      this.modalService.closeModal();
    }
  }

  onSubmit(data: any) {
    const payload = {
      product: data.product,
      price: data.price
    };

    this.appService.postProduct(payload).subscribe({
      next: () => {
        this.updateInventory();
        this.modalService.closeModal();
      },
      error: (err) => {
        console.log('err', err);
      }
    });
  }

  updateInventory() {
    this.loadInventory();
  }
}
