import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ModalService } from '../../modal.service';
import { ProductService } from '../../services/product.service';
import { WebSocketService } from '../../websocket-service';
import { MembersService } from '../../services/members.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class MembersComponent {

  @ViewChild('addProductModal') addProductModal?: TemplateRef<any>;
  members: any[] = [];
  newProduct: any = { name: '' };

  constructor(
    private modalService: ModalService,
    private membersService: MembersService,
    private webSocketService: WebSocketService,
  ) {}

  ngOnInit() {
    console.log('bbb')
    this.membersService.members$.subscribe((members: any[]) => {
      if (members && members.length > 0) {
        this.members = members;
        console.log('members', this.members)
      }
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addProduct') {
        this.members.push(message.product);
      }
    });
  }

  addModal() {
    this.modalService.openModal(this.addProductModal);
  }

  addProduct() {
    if (this.newProduct.name.trim() !== '') {
      this.membersService.addProduct(this.newProduct)
      this.modalService.closeModal();
      this.newProduct = { product: '', price: '' };
    }
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
  }  

  clearForm() {
    this.newProduct = { name: '' };
  }

}
