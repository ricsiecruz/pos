import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ModalService } from '../../modal.service';
import { SalesService } from '../../services/sales.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @ViewChild('sales') sales?: TemplateRef<any>;
  products: any[] = [];
  totalSum: number = 0;

  constructor(
    private salesService: SalesService
  ) {}

  ngOnInit() {
    this.salesService.sales$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.totalSum = this.calculateTotalSum(products);
        console.log('dashboard', this.totalSum)
      }
    });
  }

  private calculateTotalSum(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
  }
}
