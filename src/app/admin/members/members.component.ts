import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { ModalService } from '../../modal.service';
import { MembersService } from '../../services/members.service';
import { WebSocketService } from '../../websocket-service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  @ViewChild('addProductModal') addProductModal?: TemplateRef<any>;
  members: any[] = [];
  filteredMembers: any[] = [];
  newProduct: any = { name: '' };
  selectedMemberId: number | null = null;

  constructor(
    private modalService: ModalService,
    private membersService: MembersService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    this.membersService.members$.subscribe((members: any[]) => {
      if (members && members.length > 0) {
        this.members = members;
        this.filteredMembers = members;
      }
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addMember') {
        this.members.push(message.product);
        this.filterMembers();
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
    this.membersService.addProduct(this.newProduct);
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

  onMemberChange(memberId: number) {
    this.selectedMemberId = memberId;
    this.filterMembers();
  }

  filterMembers() {
    if (this.selectedMemberId === null) {
      this.filteredMembers = this.members;
    } else if (this.selectedMemberId === 0) {
      this.filteredMembers = this.members.filter(member => member.name === 'Walk-in Customer');
    } else {
      this.filteredMembers = this.members.filter(member => member.id === this.selectedMemberId);
    }
  }
}
