import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();
  visiblePages: (number | string)[] = [];

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pageNumbers: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }

  constructor() {}

  ngOnInit(): void {
    this.calculateVisiblePages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateVisiblePages();
  }

  calculateVisiblePages(): void {
    const totalVisiblePages = 9;
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
  
    if (totalPages <= totalVisiblePages) {
      this.visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      const halfVisible = Math.floor(totalVisiblePages / 10);
      let startPage = Math.max(currentPage - halfVisible, 1);
      let endPage = Math.min(startPage + totalVisiblePages - 1, totalPages);
  
      if (endPage - startPage < totalVisiblePages - 1) {
        startPage = Math.max(endPage - totalVisiblePages + 1, 1);
      }
  
      this.visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  
      if (startPage > 1) {
        if (startPage > 2) {
          this.visiblePages.unshift('...');
        }
        this.visiblePages.unshift(1);
      }
  
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          this.visiblePages.push('...');
        }
        this.visiblePages.push(totalPages);
      }
    }
  }  

  changePage(page: any): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}
