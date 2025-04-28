import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { WebSocketService } from "../websocket-service";
import { Observable, BehaviorSubject, merge, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment.prod";

@Injectable({
  providedIn: "root",
})
export class ExpensesService implements OnDestroy {
  API_URL = environment.apiUrl;
  private expensesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  expenses$: Observable<any[]> = this.expensesSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.loadProducts();
    const defaultPayload = { page: 1, limit: 10 };
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === "addExpenses") {
            return message.expense;
          } else if (message.action === "getExpenses") {
            return message.expenses;
          } else {
            return null;
          }
        })
      ),
      this.http.post<any[]>(`${this.API_URL}expenses`, defaultPayload)
    ).subscribe((data: any | any[]) => {
      if (Array.isArray(data)) {
        this.updateExpenses(data);
      } else if (data) {
        this.addOrUpdateExpenses(data);
      }
    });
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  private addOrUpdateExpenses(expense: any): void {
    const existingExpensesIndex = this.expensesSubject.value.findIndex((p) => p.id === expense.id);
    if (existingExpensesIndex === -1) {
      this.expensesSubject.next([...this.expensesSubject.value, expense]);
    } else {
      const updatedExpense = [...this.expensesSubject.value];
      updatedExpense[existingExpensesIndex] = expense;
      this.expensesSubject.next(updatedExpense);
    }
  }

  private updateExpenses(expenses: any[]): void {
    this.expensesSubject.next(expenses);
  }

  private loadProducts() {
    const defaultPayload = { page: 1, limit: 10, offset: 10 };
    this.getExpenses(defaultPayload).subscribe((response: any) => {
      console.log("response", response);
      // if your API returns { sales: { data: [...] } }
      this.updateExpenses(response.sales?.data || []);
    });
  }

  addLocalProduct(product: any) {
    product.credit = product.credit || null; // if 0, becomes null

    const products = [product, ...this.expensesSubject.value];
    this.expensesSubject.next(products);
    localStorage.setItem("expenses", JSON.stringify(products));
  }

  removeLocalProduct(tempId: number) {
    const products = this.expensesSubject.value.filter((p) => p.id !== tempId);
    this.expensesSubject.next(products);
    this.saveProductsToStorage(); // << NEW
  }

  loadExpensesFromStorage() {
    const stored = localStorage.getItem("expenses");
    if (stored) {
      const products = JSON.parse(stored);
      this.expensesSubject.next(products);
    }
  }

  saveProductsToStorage() {
    const products = this.expensesSubject.value;
    localStorage.setItem("expenses", JSON.stringify(products));
  }

  addExpenses(expense: any) {
    console.log("exp service", expense);
    return this.http.post<any[]>(`${this.API_URL}expenses/add`, expense);
  }

  getExpenses(payload: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.API_URL}expenses`, payload);
  }

  payExpense(id: number): Observable<any> {
    return this.http.put<any>(`${this.API_URL}expenses/${id}/pay`, {});
  }

  getPaidBy(): Observable<any> {
    return this.http.get<any>(this.API_URL + "expenses/paid-by").pipe(map((res) => res.paid_by));
  }

  getModeOfPayment(): Observable<any> {
    return this.http
      .get<any>(this.API_URL + "expenses/mode-of-payment")
      .pipe(map((res) => res.mode_of_payment));
  }

  filterByPaidBy(payload: any): Observable<any> {
    return this.http
      .post<any>(this.API_URL + "expenses/filter-by-paid-by", payload)
      .pipe(map((res) => res));
  }

  getFilteredExpenses(payload: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.API_URL}expenses/date-range`, payload);
  }
}
