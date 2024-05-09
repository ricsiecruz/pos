// product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from './websocket-service';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  API_URL = (environment.apiUrl);

  private productsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  products$: Observable<any[]> = this.productsSubject.asObservable();

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === 'updateProducts') {
        this.productsSubject.next(message.products);
      }
    });
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL + 'products');
  }

  addProduct(product: any): Observable<any> {
    // Make HTTP request to add product
    const httpObservable = this.http.post<any>(this.API_URL + 'products', product);
    
    // Send WebSocket message to add product
    this.webSocketService.send({ action: 'addProduct', product });
    
    return httpObservable; // Return the HTTP observable
  }

  editProduct(productId: string, updatedProduct: any): Observable<any> {
    return this.http.put<any>(this.API_URL + `products/${productId}`, updatedProduct);
  }
}
