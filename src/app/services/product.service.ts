import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environment';
import { WebSocketProductsService } from '../websocket/websocket-products-service';

@Injectable({
  providedIn: 'root'
})
export class ProductService implements OnDestroy {
  API_URL = environment.apiUrl;
  private productsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  products$: Observable<any[]> = this.productsSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketProductsService) {
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === 'addProduct') {
            return { action: 'addProduct', product: message.product };
          } else if (message.action === 'initialize') {
            return { action: 'initialize', products: message.products };
          } else if (message.action === 'editProduct') {
            return { action: 'editProduct', product: message.product };
          } else {
            return null;
          }
        })
      ),
      this.http.get<any[]>(this.API_URL + 'products').pipe(
        map(products => ({ action: 'initialize', products }))
      )
    ).subscribe((data: any) => {
      if (data) {
        if (data.action === 'initialize') {
          this.updateProducts(data.products);
        } else if (data.action === 'addProduct') {
          this.addOrUpdateProduct(data.product);
        } else if (data.action === 'editProduct') {
          this.addOrUpdateProduct(data.product);
        }
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
    console.log('edit product', productId, updatedProduct);

    // Send update via WebSocket
    this.webSocketService.send({ action: 'editProduct', productId, product: updatedProduct });

    // Send update via HTTP request
    this.http.put(`${this.API_URL}products/${productId}`, updatedProduct)
      .subscribe(response => {
        console.log('HTTP PUT response:', response);
        // Update local state immediately
        this.addOrUpdateProduct(updatedProduct);
      }, error => {
        console.error('HTTP PUT error:', error);
      });
  }
}
