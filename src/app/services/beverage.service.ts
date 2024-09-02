import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket-service';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BeverageService implements OnDestroy {
  API_URL = environment.apiUrl;

  private foodsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  foods$: Observable<any[]> = this.foodsSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === 'addBeverage') {
            return message.beverage;
          } else if (message.action === 'getBeverage') {
            return message.beverage;
          } else if (message.action === 'addBeverageStock') {
            console.log('b', message)
            return message.beverage;
          }
          else {
            return null;
          }
        })
      ),
      this.http.get<any[]>(this.API_URL + 'beverage')
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

  addProduct(beverage: any) {
    this.webSocketService.send({ action: 'addBeverage', beverage });
  }

  private updateProducts(beverage: any[]): void {
    this.foodsSubject.next(beverage);
  }

  private addOrUpdateProduct(beverage: any): void {
    console.log('f', beverage)
    const existingProductIndex = this.foodsSubject.value.findIndex(p => p.id === beverage.id);
    if (existingProductIndex === -1) {
      this.foodsSubject.next([...this.foodsSubject.value, beverage]);
    } else {
      const updatedProducts = [...this.foodsSubject.value];
      updatedProducts[existingProductIndex] = beverage;
      this.foodsSubject.next(updatedProducts);
    }
  }

  editProduct(beverageId: string, updatedBeverage: any) {
    console.log('edit food', beverageId, updatedBeverage)
    this.webSocketService.send({ action: 'editFood', beverageId, beverage: updatedBeverage });
  }

  addStocks(id: string, updatedBeverage: any) {
    console.log('j', id, updatedBeverage)
    this.webSocketService.send({ action: 'addBeverageStock', id, beverage: updatedBeverage });
  }
}