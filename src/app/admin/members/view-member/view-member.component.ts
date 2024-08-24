import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MembersService } from '../../../services/members.service';

@Component({
  selector: 'app-view-member',
  templateUrl: './view-member.component.html',
  styleUrl: './view-member.component.scss'
})
export class ViewMemberComponent {
  member: any;
  transactions: any[] = [];
  pageSize = 10;
  currentPage = 1;
  totalItems: number = 0;
  totalPages: number = 0;
  memberId: any;

  constructor(
    private route: ActivatedRoute,
    private membersService: MembersService
  ) {}

  ngOnInit() {
    this.memberId = this.route.snapshot.params['id'];
    this.fetchMemberDetails(this.memberId);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchMemberDetails(this.memberId);
  }

  fetchMemberDetails(id: number) {
    const payload = {
      page: this.currentPage,
      limit: this.pageSize
    };
    this.membersService.getMemberById(id, payload).subscribe(
      (data: any) => {
        console.log('data', data)
        this.member = data;
        this.totalItems = +data.totalRecords;
        this.transactions = this.member.transactions
        console.log('member', this.member)
      },
      (error: any) => {
        console.error('Error fetching member details:', error);
      }
    );
  }
}
