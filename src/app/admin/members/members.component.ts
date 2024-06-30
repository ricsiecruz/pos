import { Component, TemplateRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from '../../modal.service';
import { MembersService } from '../../services/members.service';
import { WebSocketService } from '../../websocket-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit, OnDestroy {
  @ViewChild('addProductModal') addProductModal?: TemplateRef<any>;
  members: any[] = [];
  filteredMembers: any[] = [];
  newProduct: any = { name: '' };
  selectedMemberId: number | null = null;
  errorMessage: string = '';
  errorSubscription?: Subscription;

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

    this.errorSubscription = this.webSocketService.receive().subscribe(
      (message) => {
        if (message.action === 'addMemberResponse' && message.error) {
          this.errorMessage = message.error;
          // Optionally, display error message to the user (e.g., using Toastr, MatSnackBar, etc.)
          console.log('Error adding member:', message.error);
        }
      },
      (error) => {
        console.error('WebSocket error:', error);
      }
    );
  }
  
  ngOnDestroy(): void {
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
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
    
    this.membersService.addMember(this.newProduct)
      .then(() => {
        // Reset form and close modal on success
        this.clearForm();
        this.modalService.closeModal();
        this.errorMessage = ''; // Clear any previous error message
      })
      .catch((error) => {
        console.log('Error adding member:', error);
        this.errorMessage = 'Error adding member: ' + error; // Set error message
      });
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
    this.errorMessage = ''; // Clear error message when canceling form
  }

  clearForm() {
    this.newProduct = { name: '' };
    this.errorMessage = ''; // Clear error message when clearing form
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
