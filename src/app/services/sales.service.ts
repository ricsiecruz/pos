// sales service
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket-service';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class SalesService implements OnDestroy {
  API_URL = 'https://pos-backend-kt9t.vercel.app/';
  // API_URL = 'http://localhost:3000/';
  private salesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private salesCurrentDateSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  sales$: Observable<any[]> = this.salesSubject.asObservable();
  salesCurrentDate$: Observable<any[]> = this.salesCurrentDateSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === 'addSales') {
            return message.transactionSales;
          } else if (message.action === 'initialize') {
            return message.sales;
          } else {
            return null;
          }
        })
      ),
      this.http.get<any[]>(this.API_URL + 'sales')
    ).subscribe((data: any | any[]) => {
      if (Array.isArray(data)) {
        this.updateSales(data);
      } else if (data) {
        this.addOrUpdateSale(data);
      }
    });
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  addSales(sale: any) {
    this.webSocketService.send({ action: 'addSales', sale });
  }

  editTransaction(id: string, updatedTransaction: any) {    
    if (!updatedTransaction.transactionid) {
      console.error('Transaction ID is required for updating sales.');
      return;
    }
  
    this.webSocketService.send({ action: 'updateSales', id, sales: updatedTransaction });
  }

  editLoad(productId: string, updatedLoad: any) {
    this.webSocketService.send({ action: 'editSalesLoad', productId, product: updatedLoad });
  }

  private addOrUpdateSale(sale: any): void {
    const existingSaleIndex = this.salesSubject.value.findIndex(s => s.id === sale.id);
    if (existingSaleIndex === -1) {
      this.salesSubject.next([...this.salesSubject.value, sale]);
    } else {
      const updatedSales = [...this.salesSubject.value];
      updatedSales[existingSaleIndex] = sale;
      this.salesSubject.next(updatedSales);
    }
  }

  private updateSales(sales: any[]): void {
    this.salesSubject.next(sales);
  }

  getSales(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL + 'sales');
  }

  getTotalSalesSum(): Observable<number> {
    return this.http.get<{ total_sum: number }>(this.API_URL + 'sales/total-sum').pipe(
      map(response => response.total_sum)
    );
  }

  getTotalSalesSumToday(): Observable<number> {
    return this.http.get<{ total_sum_today: number }>(this.API_URL + 'sales/total-sum-today').pipe(
      map(response => response.total_sum_today)
    );
  }

  getSumOfFoodsAndDrinksForToday(): Observable<number> {
    return this.http.get<{ total_sum_of_foods_and_drinks_today: number }>(this.API_URL + 'sales/total-sum-of-foods-and-drinks-today').pipe(
      map(response => response.total_sum_of_foods_and_drinks_today)
    )
  }

  getCurrentDateSales(): Observable<any> {
    return this.http.get<{ today: any }>(this.API_URL + 'sales/today').pipe(
      map(response => response.today)
    )
  }

  getFilteredSales(startDate: string, endDate: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.API_URL}sales/date-range`, { startDate, endDate });
  }
}
