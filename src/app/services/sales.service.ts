import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket-service';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class SalesService implements OnDestroy {
  API_URL = environment.apiUrl;
  private salesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private salesCurrentDateSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  sales$: Observable<any[]> = this.salesSubject.asObservable();
  salesCurrentDate$: Observable<any[]> = this.salesCurrentDateSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === 'initialize') {
            return message.transactionSales;
          } else if (message.action === 'newSale') {
            return message.data;
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
        console.log('data', data)
        this.addOrUpdateSale(data);
        this.handleNewSale(data);
      }
    });
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  private handleNewSale(sale: any): void {
    console.log('New sale received:', sale);
    this.updateDashboardData();
  }

  private updateDashboardData(): void {
    this.http.get<any>(this.API_URL + 'sales').subscribe((data: any) => {
      this.salesSubject.next(data.sales.data);
    });
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
    console.log('sale', sale)
    const currentSales = this.salesSubject.value;

    if (!Array.isArray(currentSales)) {
      console.error('Expected currentSales to be an array:', currentSales);
      return;
    }

    const existingSaleIndex = currentSales.findIndex(s => s.id === sale.id);
    if (existingSaleIndex === -1) {
      this.salesSubject.next([...currentSales, sale]);
    } else {
      const updatedSales = [...currentSales];
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
    );
  }

  getCurrentDateSales(): Observable<any> {
    return this.http.get<{ today: any }>(this.API_URL + 'sales/today').pipe(
      map(response => response.today)
    );
  }

  getFilteredSales(payload: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.API_URL}sales/date-range`, payload);
  }

  getFilteredMember(member: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.API_URL}sales/member-sales-today`, { member });
  }
}
