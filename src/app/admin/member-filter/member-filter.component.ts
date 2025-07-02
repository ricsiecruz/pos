import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-member-filter',
  templateUrl: './member-filter.component.html',
  styleUrls: ['./member-filter.component.scss']
})
export class MemberFilterComponent {
  @Input() selectedMemberId: number | null = null;
  @Input() members: any[] = [];
  @Output() memberChange = new EventEmitter<number>();

  onChange(id: number) {
    this.memberChange.emit(id);
  }
}
