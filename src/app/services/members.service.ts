import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket-service';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MembersService implements OnDestroy {
  
  API_URL = environment.apiUrl;

  private productsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  members$: Observable<any[]> = this.productsSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === 'addMember') {
            return message.member;
          } else if (message.action === 'initialize') {
            return message.members;
          } else {
            return null;
          }
        })
      ),
      this.http.get<any[]>(this.API_URL + 'members')
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

  private addOrUpdateProduct(member: any): void {
    const existingProductIndex = this.productsSubject.value.findIndex(p => p.id === member.id);
    if (existingProductIndex === -1) {
      this.productsSubject.next([...this.productsSubject.value, member]);
    } else {
      const updatedProducts = [...this.productsSubject.value];
      updatedProducts[existingProductIndex] = member;
      this.productsSubject.next(updatedProducts);
    }
  }

  private updateProducts(members: any[]): void {
    this.productsSubject.next(members);
  }

  addProduct(member: any) {
    console.log('eee', member)
    this.webSocketService.send({ action: 'addMember', member });
  }

  editProduct(productId: string, updatedProduct: any) {
    console.log('edit drinks', productId, updatedProduct)
    this.webSocketService.send({ action: 'editProduct', productId, product: updatedProduct });
  }
}
