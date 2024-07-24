import { Component, TemplateRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from '../../modal.service';
import { MembersService } from '../../services/members.service';
import { WebSocketService } from '../../websocket-service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

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
  file: File | null = null;

  constructor(
    private router: Router,
    private modalService: ModalService,
    private membersService: MembersService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    this.membersService.members$.subscribe((members: any[]) => {
      if (members && members.length > 0) {
        this.members = members;
        this.filteredMembers = members;
        console.log('members', this.filteredMembers)
      }
    });

    this.errorSubscription = this.webSocketService.receive().subscribe(
      (message) => {
        if (message.action === 'addMemberResponse' && message.error) {
          this.errorMessage = message.error;
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
        this.clearForm();
        this.errorMessage = '';
      })
      .catch((error) => {
        console.log('Error adding member:', error);
        this.errorMessage = 'Error adding member: ' + error;
      });

    this.modalService.closeModal();
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
    this.errorMessage = '';
  }

  clearForm() {
    this.newProduct = { name: '' };
    this.errorMessage = '';
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

  viewMember(id: number) {
    this.router.navigate([`/admin/members/${id}`]);
  }

  onFileChange(event: any) {
    this.file = event.target.files[0];
  }

  async onUpload() {
    if (this.file) {
      const formData = new FormData();
      formData.append('file', this.file);

      try {
        const response: any = await this.membersService.uploadExcel(formData).toPromise();
        alert(response.message);
        // Optionally, refresh the members list here
        this.membersService.refreshMembers();
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file');
      }
    } else {
      alert('Please select a file first');
    }
  }
}
