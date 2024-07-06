import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket-service';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService implements OnDestroy {
  API_URL = environment.apiUrl;

  private productsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  products$: Observable<any> = this.productsSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === 'initialize') {
            return message.dashboard;
          } else if (message.action === 'newSale') {
            return message.data;
          } else {
            return null;
          }
        })
      ),
      this.http.get<any>(this.API_URL + 'dashboard')
    ).subscribe((data: any) => {
      if (data && Array.isArray(data.products)) {
        this.updateProducts(data.products);
      } else if (data) {
        this.addOrUpdateProduct(data);
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
    // Logic to handle the new sale and update the dashboard data
    console.log('New sale received:', sale);
    this.updateDashboardData();
  }

  private updateProducts(products: any[]): void {
    this.productsSubject.next({ ...this.productsSubject.value, products });
  }

  private updateDashboardData(): void {
    this.http.get<any>(this.API_URL + 'dashboard').subscribe((data: any) => {
      this.productsSubject.next(data);
    });
  }

  getStat(): Observable<any> {
    return this.http.get<any>(this.API_URL + 'dashboard/sales-expenses-summary').pipe(
      map(res => res.sales_expenses_summary)
    );
  }

  getTopSpendersToday(): Observable<any> {
    return this.http.get<any>(this.API_URL + 'dashboard/top-spenders-today').pipe(
      map(res => res.top_spenders_today)
    );
  }

  private addOrUpdateProduct(product: any): void {
    const currentProducts = this.productsSubject.value?.products || [];
    const existingProductIndex = currentProducts.findIndex((p: any) => p.id === product.id);

    if (existingProductIndex === -1) {
      this.productsSubject.next({
        ...this.productsSubject.value,
        products: [...currentProducts, product]
      });
    } else {
      const updatedProducts = [...currentProducts];
      updatedProducts[existingProductIndex] = product;
      this.productsSubject.next({
        ...this.productsSubject.value,
        products: updatedProducts
      });
    }

    console.log('Updated products:', this.productsSubject.value);
  }
}
