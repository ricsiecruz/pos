import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AppService } from '../../app.service';
import { ModalService } from '../../modal.service';
import { ExpensesService } from '../../services/expenses.service';
import { WebSocketService } from '../../websocket-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent {
  API_URL = environment.apiUrl
  @ViewChild('sales') sales?: TemplateRef<any>;
  @ViewChild('pay') pay?: TemplateRef<any>;
  expenses: any[] = [];
  expense: string = '';
  amount?: number | null;
  totalSum: number = 0;
  newExpenses: any = { expense: '', month: '', date: '', amount: '', mode_of_payment: '', paid_by: '', settled_by: '', credit: false };
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;  // Variable for image preview
  details: any;
  credit: any;
  paidBy: any[] = [];
  mode_of_payment: any[] = [];
  selected_mode_of_payment: any;

  constructor(
    private http: HttpClient,
    private appService: AppService,
    private modalService: ModalService,
    private expensesService: ExpensesService,
    private webSocketService: WebSocketService
  ) {
  }

  ngOnInit() {
    this.expensesService.expenses$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.getExpenses();
      }
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addExpenses') {
        this.expenses.push(message.product);
      } else if (message.action === 'deductCredit') {
        this.expenses = this.expenses.map(expense => 
          expense.id === message.expense ? { ...expense, credit: false } : expense
        );
        this.credit = message.totalCreditAmount;
      }
    });

    this.expensesService.getPaidBy().subscribe((res: any) => {
      this.paidBy = res;
      // Set default value for paidBy
      this.setDefaultPaidBy();
    });
    
    this.expensesService.getModeOfPayment().subscribe((res: any) => {
      this.mode_of_payment = res;
      // Set default value for mode_of_payment
      this.setDefaultModeOfPayment();
    });
  }

  getExpenses() {
    this.expensesService.getExpenses().subscribe((res: any) => {
      this.credit = res.total_credit_amount;
      this.expenses = res.data;
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  addProduct() {
    const currentDate = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    this.newExpenses.month = `${currentMonth} ${currentYear}`;
    this.newExpenses.date = new Date().toISOString();

    if(this.newExpenses.paid_by !== 'Tech Hybe') {
      this.newExpenses.credit = true;
      this.newExpenses.mode_of_payment = null;
    }

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile, this.selectedFile.name);
      this.http.post<{ imagePath: string }>(this.API_URL + 'expenses/upload', formData).subscribe(
        (response) => {
          console.log('image', response)
          this.newExpenses.image_path = response.imagePath;
          this.sendExpenseData();
        },
        (error) => {
          console.error('Image upload failed:', error);
        }
      );
    } else {
      this.sendExpenseData();
    }

    // this.sendExpenseData();
  }

  sendExpenseData() {
    // Adjust mode_of_payment to use an object containing both id and name
    const selectedModeOfPayment = this.mode_of_payment.find(mp => mp.id === this.newExpenses.mode_of_payment);
    this.newExpenses.mode_of_payment = selectedModeOfPayment?.mode_of_payment;
  
    console.log('add expense', this.newExpenses);
    this.expensesService.addExpenses(this.newExpenses);
    this.modalService.closeModal();
    this.resetNewExpenses();
    this.imagePreviewUrl = null; // Clear the preview after submitting
  }
  

  private calculateTotalSum(expenses: any[]): number {
    return expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  }

  loadInventory() {
    this.appService.getExpenses().subscribe((res: any) => {
      this.expenses = res;
    });
  }

  view(product: any) {
    this.details = product;
    this.modalService.openModal(this.sales);
  }

  openAddInventoryModal(modalContent: any) {
    this.modalService.openModal(modalContent);
  }

  clearForm() {
    this.expense = '';
    this.amount = null;
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
  }

  updateInventory() {
    this.loadInventory();
  }

  payModal(data: any) {
    this.details = data;
    console.log('pay data', data)
    this.modalService.openModal(this.pay);
  }

  payExpense(expense: any) {

    const selectedModeOfPayment = this.mode_of_payment.find(mp => mp.id === this.selected_mode_of_payment);
    this.selected_mode_of_payment = selectedModeOfPayment.mode_of_payment;
  
    console.log('paying expense', expense, expense.id, this.selected_mode_of_payment);

    const payload = {
      id: expense.id,
      expense: expense.expense,
      month: expense.month,
      amount: expense.amount,
      mode_of_payment: this.selected_mode_of_payment,
      credit: expense.credit,
      date: expense.date,
      image_path: expense.image_path,
      paid_by: expense.paid_by,
      settled_by: 'Tech Hybe'
    };

    console.log('payload', payload)
    this.expensesService.payExpense(expense.id).subscribe(
      (res: any) => {
        this.credit -= expense.amount;
        expense.credit = false; // Update the local state to reflect the change
        this.getExpenses(); // Refresh the expenses list
        this.modalService.closeModal();
      },
      (error) => {
        console.error('Failed to pay expense:', error);
      }
    );
  }
  
  private setDefaultPaidBy() {
    if (this.paidBy.length > 0) {
      const defaultPaidBy = this.paidBy.find(data => data.name === 'Tech Hybe') || this.paidBy[0];
      this.newExpenses.paid_by = defaultPaidBy.name;
    }
  }

  private setDefaultModeOfPayment() {
    if (this.mode_of_payment.length > 0) {
      const defaultModeOfPayment = this.mode_of_payment.find(data => data.id === 1) || this.mode_of_payment[0];
      this.newExpenses.mode_of_payment = defaultModeOfPayment.id;
      this.selected_mode_of_payment = defaultModeOfPayment.id;
    }
  }

  private resetNewExpenses() {
    this.newExpenses = { expense: '', month: '', date: '', amount: '', mode_of_payment: '', paid_by: '', credit: false };
    this.setDefaultPaidBy(); // Reset to default paidBy value
    this.setDefaultModeOfPayment(); // Reset to default mode_of_payment value
  }
}
