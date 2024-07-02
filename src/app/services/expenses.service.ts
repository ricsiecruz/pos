import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket-service';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService implements OnDestroy {
  API_URL = environment.apiUrl;
  private expensesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  expenses$: Observable<any[]> = this.expensesSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === 'addExpenses') {
            return message.expense;
          } else if (message.action === 'initialize') {
            return message.expenses;
          } else {
            return null;
          }
        })
      ),
      this.http.get<any[]>(this.API_URL + 'expenses')
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
    const existingExpensesIndex = this.expensesSubject.value.findIndex(p => p.id === expense.id);
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

  addExpenses(expense: any) {
    console.log('exp service', expense)
    this.webSocketService.send({ action: 'addExpenses', expense });
  }

  getExpenses(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL + 'expenses');
  }

  payExpense(id: number): Observable<any> {
    return this.http.put<any>(`${this.API_URL}expenses/${id}/pay`, {});
  }

  getPaidBy(): Observable<any> {
    return this.http.get<any>(this.API_URL + 'expenses/paid-by').pipe(
      map(res => res.paid_by)
    )
  }

  getModeOfPayment(): Observable<any> {
    return this.http.get<any>(this.API_URL + 'expenses/mode-of-payment').pipe(
      map(res => res.mode_of_payment)
    )
  }
}
