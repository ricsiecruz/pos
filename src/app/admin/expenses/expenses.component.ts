import { Component, TemplateRef, ViewChild } from "@angular/core";
import { AppService } from "../../app.service";
import { ModalService } from "../../modal.service";
import { ExpensesService } from "../../services/expenses.service";
import { WebSocketService } from "../../websocket-service";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.prod";
import { AngularCsv } from "angular7-csv/dist/Angular-csv";
import * as XLSX from "xlsx";

@Component({
  selector: "app-expenses",
  templateUrl: "./expenses.component.html",
  styleUrls: ["./expenses.component.scss"],
})
export class ExpensesComponent {
  API_URL = environment.apiUrl;
  @ViewChild("sales") sales?: TemplateRef<any>;
  @ViewChild("pay") pay?: TemplateRef<any>;
  expenses: any[] = [];
  expense: string = "";
  amount?: number | null;
  newExpenses: any = {
    expense: "",
    month: "",
    date: "",
    amount: "",
    mode_of_payment: "",
    paid_by: "",
    settled_by: "",
    credit: false,
  };
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  details: any;
  credit: any;
  paidBy: any[] = [];
  mode_of_payment: any[] = [];
  selected_mode_of_payment: any;
  filterPaidBy: any;
  startDate: any;
  endDate: any;
  pageSize = 10;
  currentPage = 1;
  totalItems: number = 0;

  constructor(
    private http: HttpClient,
    private appService: AppService,
    private modalService: ModalService,
    private expensesService: ExpensesService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    this.expensesService.expenses$.subscribe((expenses: any[]) => {
      console.log("expenses", expenses);
      this.expenses = expenses;
    });

    this.getExpenses();

    // this.webSocketService.receive().subscribe((message: any) => {
    //   if (message.action === 'addExpenses') {
    //     this.expenses.push(message.product);
    //   } else if (message.action === 'deductCredit') {
    //     this.expenses = this.expenses.map(expense =>
    //       expense.id === message.expense ? { ...expense, credit: false } : expense
    //     );
    //     this.credit = message.totalCreditAmount;
    //   }
    // });

    this.expensesService.getPaidBy().subscribe((res: any) => {
      this.paidBy = res;
      this.setDefaultPaidBy();
    });

    this.expensesService.getModeOfPayment().subscribe((res: any) => {
      this.mode_of_payment = res;
      this.setDefaultModeOfPayment();
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getExpenses();
  }

  getExpenses() {
    const payload = {
      page: this.currentPage,
      limit: 10,
    };
    this.expensesService.getExpenses(payload).subscribe((res: any) => {
      console.log("res", res);
      this.totalItems = +res.totalRecords;
      console.log("this.totalItems", this.totalItems);
      this.credit = res.total_credit_amount.totalCreditAmount;
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

  filterExpenses() {
    if (this.filterPaidBy == 0) {
      this.getExpenses();
    } else {
      const payload = {
        paid_by: this.filterPaidBy,
      };
      this.expensesService.filterByPaidBy(payload).subscribe((res: any) => {
        this.expenses = res.data;
        this.credit = res.total_credit_amount.totalCreditAmount;
      });
    }
  }

  addProduct() {
    const currentDate = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    this.newExpenses.month = `${currentMonth} ${currentYear}`;
    this.newExpenses.date = new Date().toISOString();

    if (this.newExpenses.paid_by !== "Tech Hybe") {
      this.newExpenses.credit = true;
      this.newExpenses.mode_of_payment = null;
    }

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append("image", this.selectedFile, this.selectedFile.name);
      this.http.post<{ imagePath: string }>(this.API_URL + "expenses/upload", formData).subscribe(
        (response) => {
          this.newExpenses.image_path = response.imagePath;
          this.sendExpenseData();
        },
        (error) => {
          console.error("Image upload failed:", error);
        }
      );
    } else {
      this.sendExpenseData();
    }
  }

  sendExpenseData() {
    const selectedModeOfPayment = this.mode_of_payment.find(
      (mp) => mp.id === this.newExpenses.mode_of_payment
    );
    this.newExpenses.mode_of_payment = selectedModeOfPayment?.mode_of_payment;

    // this.expensesService.addExpenses(this.newExpenses);

    const tempId = Date.now();
    const tempProduct = { ...this.newExpenses, id: tempId };

    // Optimistic update
    this.expensesService.addLocalProduct(tempProduct);
    this.expensesService.saveProductsToStorage(); // << NEW: save to localStorage

    this.expensesService.addExpenses(this.newExpenses).subscribe({
      next: (createdProduct: any) => {
        console.log("Products page added:", createdProduct);
        // Optionally, replace tempProduct with real createdProduct here
      },
      error: (err) => {
        console.error("Failed to add product:", err);
        this.expensesService.removeLocalProduct(tempId);
        this.expensesService.saveProductsToStorage(); // << NEW: update localStorage after removal
      },
    });

    this.modalService.closeModal();
    this.resetNewExpenses();
    this.imagePreviewUrl = null;
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
    this.expense = "";
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
    this.modalService.openModal(this.pay);
  }

  payExpense(expense: any) {
    const selectedModeOfPayment = this.mode_of_payment.find(
      (mp) => mp.id === this.selected_mode_of_payment
    );
    this.selected_mode_of_payment = selectedModeOfPayment?.mode_of_payment;

    console.log("id", expense.id);

    this.expensesService.payExpense(expense.id).subscribe(
      (res: any) => {
        this.credit -= expense.amount;
        expense.credit = false;
        this.getExpenses();
        this.modalService.closeModal();
      },
      (error) => {
        console.error("Failed to pay expense:", error);
      }
    );
  }

  private setDefaultPaidBy() {
    if (this.paidBy.length > 0) {
      const defaultPaidBy = this.paidBy.find((data) => data.name === "Tech Hybe") || this.paidBy[0];
      this.newExpenses.paid_by = defaultPaidBy.name;
    }
  }

  private setDefaultModeOfPayment() {
    const defaultModeOfPayment =
      this.mode_of_payment.find((data) => data.id === 1) || this.mode_of_payment[0];
    this.newExpenses.mode_of_payment = defaultModeOfPayment.id;
    this.selected_mode_of_payment = defaultModeOfPayment.id;
  }

  private resetNewExpenses() {
    this.newExpenses = {
      expense: "",
      month: "",
      date: "",
      amount: "",
      mode_of_payment: "",
      paid_by: "",
      credit: false,
    };
    this.setDefaultPaidBy();
    this.setDefaultModeOfPayment();
  }

  filter(startDate: any, endDate: any, selectedMemberName: any) {
    const payload: any = { startDate, endDate };
    if (selectedMemberName !== "All") {
      payload.customer = selectedMemberName;
    }
    this.expensesService.getFilteredExpenses(payload).subscribe(
      (res: any) => {
        console.log("expenses", res);
        this.expenses = res.expensesData.data;
        this.credit = res.expensesData.total_credit;
      },
      (error: any) => {
        console.error("Error fetching filtered sales data:", error);
      }
    );
  }

  clearFilter() {
    this.startDate = null;
    this.endDate = null;
    this.filterPaidBy = 0;
    this.getExpenses();
  }

  exportToCsv() {
    const today = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");
    const filename: string = `expenses_${today}.csv`;

    const dataToExport = this.expenses.map((item) => ({
      Expense: item.expense,
      Amount: item.amount,
      Credit: item.credit,
      Month: item.month,
      Date: item.date,
      ModeOfPayment: item.mode_of_payment,
      PaidBy: item.paid_by,
      DateSettled: item.date_settled,
    }));

    new AngularCsv(dataToExport, filename, {
      showLabels: true,
      headers: [
        "Expense",
        "Amount",
        "Credit",
        "Month",
        "Date",
        "Mode of payment",
        "Paid by",
        "Date settled",
      ],
    });
  }

  exportToExcel(): void {
    const today = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    const dataToExport = this.expenses.map((item) => ({
      Expense: item.expense,
      Amount: item.amount,
      Credit: item.credit,
      Month: item.month,
      Date: item.date,
      ModeOfPayment: item.mode_of_payment,
      PaidBy: item.paid_by,
      DateSettled: item.date_settled,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales_Data");

    const filename: string = `expenses_data_${today}.xlsx`;
    XLSX.writeFile(wb, filename);
  }
}
