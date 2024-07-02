import { Component } from '@angular/core';
import { ExpensesService } from '../../services/expenses.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  credit_count: number = 0;

  constructor(private expensesService: ExpensesService) {
    this.expensesService.getExpenses().subscribe((res: any) => {
      console.log('res', res, res.total_credit_amount, res.total_credit_amount.totalCreditAmount, res.total_credit_amount.creditCount)
      this.credit_count = res.total_credit_amount.creditCount;
    });
  }

}
