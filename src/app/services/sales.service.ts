import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket-service';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class SalesService implements OnDestroy {
  // API_URL = environment.apiUrl;
  API_URL = ('https://pos-backend-kt9t.vercel.app/');
  private salesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  sales$: Observable<any[]> = this.salesSubject.asObservable();
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
      console.log('sales', data);
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

}
