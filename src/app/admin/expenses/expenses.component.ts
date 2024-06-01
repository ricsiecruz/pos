import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { ModalService } from '../../modal.service';
import { ExpensesService } from '../../services/expenses.service';
import { WebSocketService } from '../../websocket-service';

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
  totalSum: number = 0;
  newExpenses: any = { expense: '', month: '', date: '', amount: '', channel: '' };

  constructor(
    private appService: AppService,
    private modalService: ModalService,
    private expensesService: ExpensesService,
    private webSocketService: WebSocketService
  ) {
  }

  ngOnInit() {
    this.expensesService.expenses$.subscribe((expenses: any[]) => {
      if (expenses && expenses.length > 0) {
        this.expenses = expenses;
        console.log('a', expenses)
        this.calculateTotalSum(expenses);
        console.log('sum', this.calculateTotalSum(expenses))
      }
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addExpenses') {
        console.log('b', message.product)
        this.expenses.push(message.product);
      }
    });
  }

  addProduct() {
    const currentDate = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    this.newExpenses.month = `${currentMonth} ${currentYear}`;
    this.newExpenses.date = new Date().toISOString();
    console.log('expenses', this.newExpenses);
    this.expensesService.addExpenses(this.newExpenses);
    this.modalService.closeModal();
    this.newExpenses = { expense: '', month: '', date: '', amount: '', channel: '' };
  }
  
  
  private calculateTotalSum(expenses: any[]): number {
    return expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  }

  loadInventory() {
    this.appService.getExpenses().subscribe((res: any) => {
      this.expenses = res;
    })
  }

  openAddInventoryModal(modalContent: any) {
    this.modalService.openModal(modalContent);
  }

  clearForm() {
    this.expense = '';
    this.amount = null;
    this.channel = '';
  }

  cancelForm() {
    this.clearForm(); // Call the method to reset form fields
    this.modalService.closeModal(); // Close the modal
  }  

  updateInventory() {
    this.loadInventory();
  }
}
