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

  constructor(
    private route: ActivatedRoute,
    private membersService: MembersService
  ) {}

  ngOnInit() {
    const memberId = this.route.snapshot.params['id'];
    this.fetchMemberDetails(memberId);
  }

  fetchMemberDetails(id: number) {
    this.membersService.getMemberById(id).subscribe(
      (data: any) => {
        this.member = data;
        console.log('member', this.member)
      },
      (error: any) => {
        console.error('Error fetching member details:', error);
      }
    );
  }
}
