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
  allMembers: any[] = [];
  filteredMembers: any[] = [];
  newProduct: any = { name: '' };
  selectedMemberId: number | null = null;
  errorMessage: string = '';
  errorSubscription?: Subscription;
  file: File | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';
  pageSize = 10;
  currentPage = 1;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private router: Router,
    private modalService: ModalService,
    private membersService: MembersService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    this.loadMembers();

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

  loadMembers() {
    const payload = {
      page: this.currentPage,
      limit: this.pageSize,
      memberId: this.selectedMemberId // This will be undefined if no member is selected
    };
  
    this.membersService.refreshMembers(payload).subscribe(response => {
      this.members = response.data;
      this.filteredMembers = this.members;
      this.totalItems = response.totalRecords;
      this.totalPages = response.totalPages;
    });
  
    this.membersService.getMembers().subscribe((res: any) => {
      console.log('all members', res);
      this.allMembers = res;
    });
  }  

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadMembers();
  }

  addModal() {
    this.modalService.openModal(this.addProductModal);
  }
  
  sortByName() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'; // Toggle sort order
    this.filteredMembers.sort((a, b) => {
      const nameA = a.name.toUpperCase(); // Convert to uppercase to ensure case-insensitive comparison
      const nameB = b.name.toUpperCase();
      if (nameA > nameB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (nameA < nameB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
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
        this.loadMembers(); // Refresh the list after adding a new member
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
    console.log('member id', memberId)
    this.selectedMemberId = memberId;
    this.filterMembers();
  }

  filterMembers() {
    if (this.selectedMemberId === null) {
      this.filteredMembers = this.members;
    } else if (this.selectedMemberId === 0) {
      this.filteredMembers = this.allMembers.filter(member => member.name === 'Walk-in Customer');
    } else {
      this.filteredMembers = this.allMembers.filter(member => member.id === this.selectedMemberId);
    }
    console.log('filter', this.selectedMemberId, this.filteredMembers)
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
        this.loadMembers(); // Refresh the list after uploading
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file');
      }
    } else {
      alert('Please select a file first');
    }
  }
}
