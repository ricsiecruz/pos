// product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from './websocket-service';
import { Observable, BehaviorSubject, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  API_URL = (environment.apiUrl);

  private productsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  products$: Observable<any[]> = this.productsSubject.asObservable();

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    // Subscribe to WebSocket updates and HTTP API responses
    merge(
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
        // Handle initialization message containing the initial products
        console.log('Initial products received in ProductService:', data);
        this.updateProducts(data);
      } else if (data) {
        // Handle single product addition
        console.log('New product received in ProductService:', data);
        this.addOrUpdateProduct(data);
      }
    });
  }  

  // Helper method to add or update product in the list
  private addOrUpdateProduct(product: any): void {
    const existingProductIndex = this.productsSubject.value.findIndex(p => p.id === product.id);
    if (existingProductIndex === -1) {
      // If the product doesn't exist, add it to the list
      this.productsSubject.next([...this.productsSubject.value, product]);
    } else {
      // If the product already exists, update its details
      const updatedProducts = [...this.productsSubject.value];
      updatedProducts[existingProductIndex] = product;
      this.productsSubject.next(updatedProducts);
    }
  }

  private updateProducts(products: any[]): void {
    this.productsSubject.next(products);
  }

  addProduct(product: any): Observable<any> {
    const httpObservable = this.http.post<any>(this.API_URL + 'products', product);
    this.webSocketService.send({ action: 'addProduct', product });
    return httpObservable;
  }

  editProduct(productId: string, updatedProduct: any): Observable<any> {
    return this.http.put<any>(this.API_URL + `products/${productId}`, updatedProduct);
  }
}
