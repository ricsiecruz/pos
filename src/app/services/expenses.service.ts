import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket-service';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environment';

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
            return message.expense;
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
    console.log('service', expense)
    this.webSocketService.send({ action: 'addExpenses', expense });
  }
  
  editExpenses(expenseId: string, updatedExpenses: any) {
    console.log('edit drinks', expenseId, updatedExpenses)
    this.webSocketService.send({ action: 'editExpenses', expenseId, expense: updatedExpenses });
  }
}
