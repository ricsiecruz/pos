import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FoodsService } from '../../services/foods.service';
import { ModalService } from '../../modal.service';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.component.html',
  styleUrl: './foods.component.scss'
})
export class FoodsComponent {

  @ViewChild('addProductModal') addProductModal?: TemplateRef<any>;
  products: any[] = [];
  newProduct: any = { food: '', price: '', stocks: '' };

  constructor(
    private foodsService: FoodsService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    console.log('bbb')
    this.foodsService.products$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products;
        console.log('foods', this.products)
      }
    });
  }
  
  addModal() {
    this.modalService.openModal(this.addProductModal);
  }

  addProduct() {
    // if (this.newProduct.product.trim() !== '' && !isNaN(Number(this.newProduct.price))) {
    console.log('add', this.newProduct)
    // this.foodsService.addProduct(this.newProduct)
    this.modalService.closeModal();
    this.newProduct = { food: '', price: '', stocks: '' };
    // }
  }

  cancelForm() {
    this.newProduct = { food: '', price: '', stocks: '' };
    this.modalService.closeModal();
  }  
}
