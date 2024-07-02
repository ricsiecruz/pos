import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket-service';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ProductService implements OnDestroy {
  API_URL = environment.apiUrl;

  private productsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  products$: Observable<any[]> = this.productsSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === 'addProduct') {
            return message.product;
          } else if (message.action === 'initialize') {
            return message.products;
          } else {
            return null;
          }
        })
      ),
      this.http.get<any[]>(this.API_URL + 'products')
    ).subscribe((data: any | any[]) => {
      if (Array.isArray(data)) {
        this.updateProducts(data);
      } else if (data) {
        this.addOrUpdateProduct(data);
      }
    });
  }

  ngOnDestroy() {
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

  editProduct(productId: string, updatedProduct: any) {
    console.log('edit drinks', productId, updatedProduct)
    this.webSocketService.send({ action: 'editProduct', productId, product: updatedProduct });
  }
}
