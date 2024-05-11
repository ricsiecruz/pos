import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket-service';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService implements OnDestroy {
  API_URL = environment.apiUrl;
  private inventorySubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  inventory$: Observable<any[]> = this.inventorySubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === 'addInventory') {
            return message.addInventory;
          } else if (message.action === 'initialize') {
            return message.inventory;
          } else {
            return null;
          }
        })
      )
    ).subscribe((data: any | any[]) => {
      console.log('inventory', data);
      if (Array.isArray(data)) {
        this.updateInventory(data);
      } else if (data) {
        this.addOrUpdateInventory(data);
      }
    });
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  addInventory(inventory: any) {
    this.webSocketService.send({ action: 'addInventory', inventory });
  }

  private addOrUpdateInventory(inventory: any): void {
    const existinginventoryIndex = this.inventorySubject.value.findIndex(s => s.id === inventory.id);
    if (existinginventoryIndex === -1) {
      this.inventorySubject.next([...this.inventorySubject.value, inventory]);
    } else {
      const updatedInventory = [...this.inventorySubject.value];
      updatedInventory[existinginventoryIndex] = inventory;
      this.inventorySubject.next(updatedInventory);
    }
  }

  private updateInventory(inventory: any[]): void {
    this.inventorySubject.next(inventory);
  }

  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL + 'inventory');
  }

}
