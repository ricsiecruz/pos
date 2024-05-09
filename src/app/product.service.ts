import { Injectable } from '@angular/core';
import { WebSocketService } from './websocket-service';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  products$: Observable<any[]> = this.productsSubject.asObservable();

  constructor(private webSocketService: WebSocketService) {
    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'updateProducts') {
        this.productsSubject.next(message.products);
      }
    });
  }

  getProducts(): Observable<any[]> {
    return this.products$;
  }

  addProduct(product: any) {
    this.webSocketService.send({ action: 'addProduct', product });
  }

  // editProduct method to send edited product to the server
editProduct(productId: string, updatedProduct: any) {
  // Update the product using WebSocket
  this.webSocketService.send({ action: 'editProduct', productId, product: updatedProduct });
}

  
}
