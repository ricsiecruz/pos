import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ModalService } from '../../modal.service';
import { ProductService } from '../../services/product.service';
import { WebSocketService } from '../../websocket-service';
import { MembersService } from '../../services/members.service';
import { DashboardService } from '../../services/dashboard.service';

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
    private dashboardService: DashboardService,
    private webSocketService: WebSocketService,
  ) {}

  ngOnInit() {
    this.membersService.members$.subscribe((members: any[]) => {
      if (members && members.length > 0) {
        this.members = members;
      }
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addMember') {
        this.members.push(message.product);
      }
    });
  }

  addModal() {
    this.modalService.openModal(this.addProductModal);
  }

  addProduct() {
    this.newProduct.date_joined = new Date().toISOString();
    this.newProduct.coffee = 0;
    this.newProduct.total_load = 0;
    this.newProduct.total_spent = 0;
    this.newProduct.last_spent = new Date().toISOString();
    this.membersService.addProduct(this.newProduct)
    this.modalService.closeModal();
    this.newProduct = { name: '' };
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
  }  

  clearForm() {
    this.newProduct = { name: '' };
  }

}
