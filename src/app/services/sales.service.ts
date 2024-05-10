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
  API_URL = environment.apiUrl;
  private productsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  products$: Observable<any[]> = this.productsSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === 'addSales') {
            return message.transactionSales;
          } else if (message.action === 'initialize') {
            return message.products;
          } else {
            return null;
          }
        })
      ),
      this.http.get<any[]>(this.API_URL + 'sales')
    ).subscribe((data: any | any[]) => {
        console.log('sales', data)
    //   if (Array.isArray(data)) {
    //     this.updateProducts(data);
    //   } else if (data) {
    //     this.addOrUpdateProduct(data);
    //   }
    });
  }

  ngOnDestroy() {
    // Unsubscribe from WebSocket subscription when the service is destroyed
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  private addOrUpdateProduct(product: any): void {
    const existingProductIndex = this.productsSubject.value.findIndex(p => p.id === product.id);
    if (existingProductIndex === -1) {
      this.productsSubject.next([...this.productsSubject.value, product]);
    } else {
      const updatedProducts = [...this.productsSubject.value];
      updatedProducts[existingProductIndex] = product;
      this.productsSubject.next(updatedProducts);
    }
  }

  private updateProducts(products: any[]): void {
    this.productsSubject.next(products);
  }

  addProduct(product: any) {
    this.webSocketService.send({ action: 'addProduct', product });
  }

  addSales(sale: any) {
    this.webSocketService.send({ action: 'addSales', sale });
  }

  editProduct(productId: string, updatedProduct: any) {
    this.webSocketService.send({ action: 'editProduct', productId, product: updatedProduct });
  }
}
