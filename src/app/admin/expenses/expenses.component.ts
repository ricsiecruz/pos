import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AppService } from '../../app.service';
import { ModalService } from '../../modal.service';
import { ExpensesService } from '../../services/expenses.service';
import { WebSocketService } from '../../websocket-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent {
  API_URL = environment.apiUrl;
  @ViewChild('sales') sales?: TemplateRef<any>;
  expenses: any[] = [];
  expense: string = '';
  amount?: number | null;
  channel: string = '';
  totalSum: number = 0;
  newExpenses: any = { expense: '', month: '', date: '', amount: '', channel: '', credit: false };
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;  // Variable for image preview
  details: any;
  credit: any;

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
      this.credit = products[0].total_credit_amount;
      if (products && products.length > 0) {
        this.expenses = products[0].data;
        this.calculateTotalSum(products);
      }
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'addExpenses') {
        this.expenses.push(message.product);
      }
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

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile, this.selectedFile.name);
      this.http.post<{ imagePath: string }>(this.API_URL + 'expenses/upload', formData).subscribe(
        (response) => {
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
  }

  sendExpenseData() {
    this.expensesService.addExpenses(this.newExpenses);
    this.modalService.closeModal();
    this.newExpenses = { expense: '', month: '', date: '', amount: '', channel: '', credit: false };
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
    this.channel = '';
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
  }  

  updateInventory() {
    this.loadInventory();
  }
}
