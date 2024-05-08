import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { ModalService } from '../../modal.service';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {

  expenses: any[] = [];
  expense: string = '';
  amount?: number | null;
  channel: string = '';

  constructor(
    private appService: AppService,
    private modalService: ModalService
  ) {
  }

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.appService.getExpenses().subscribe((res: any) => {
      this.expenses = res;
    })
  }

  openAddInventoryModal(modalContent: any) {
    this.modalService.openModal(modalContent);
  }

  onSubmit(data: any) {
    const payload = {
      expense: data.expense,
      amount: data.amount,
      channel: data.channel,
      month: `${new Date().toLocaleString('en-us', { month: 'long' })} ${new Date().getFullYear()}`,
      date: new Date().toISOString() // Format date in ISO format
    }; 
    
    console.log('payload', payload)
  
    this.appService.postExpense(payload).subscribe({
      next: () => {
        console.log('success');
        this.updateInventory();
        this.modalService.closeModal();
        this.clearForm();
      },
      error: (err) => {
        console.log('err', err);
      }
    });
  }

  clearForm() {
    this.expense = '';
    this.amount = null;
    this.channel = '';
  }

  updateInventory() {
    this.loadInventory();
  }
}
