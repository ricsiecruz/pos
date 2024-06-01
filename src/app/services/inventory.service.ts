import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket-service';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environment';

interface Inventory {
  id: number;
  product: string;
  category: string;
  brand: string;
  stocks: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService implements OnDestroy {
  API_URL = environment.apiUrl;
  private inventorySubject: BehaviorSubject<Inventory[]> = new BehaviorSubject<Inventory[]>([]);
  inventory$: Observable<Inventory[]> = this.inventorySubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          console.log('WebSocket message:', message);
          if (message.action === 'addInventory') {
            return message.inventory;
          } else if (message.action === 'initialize') {
            return message.inventory;
          } else {
            return null;
          }
        })
      ),
      this.http.get<Inventory[]>(this.API_URL + 'inventory').pipe(
        tap(data => console.log('HTTP GET inventory:', data))
      )
    ).subscribe((data: Inventory | Inventory[]) => {
      console.log('Merged data:', data);
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

  addInventory(inventory: Inventory) {
    this.webSocketService.send({ action: 'addInventory', inventory });
  }

  private addOrUpdateInventory(inventory: Inventory): void {
    const existingInventoryIndex = this.inventorySubject.value.findIndex(s => s.id === inventory.id);
    if (existingInventoryIndex === -1) {
      this.inventorySubject.next([...this.inventorySubject.value, inventory]);
    } else {
      const updatedInventory = [...this.inventorySubject.value];
      updatedInventory[existingInventoryIndex] = inventory;
      this.inventorySubject.next(updatedInventory);
    }
  }

  private updateInventory(inventory: Inventory[]): void {
    this.inventorySubject.next(inventory);
  }

  editProduct(id: number, updatedProduct: Inventory) {
    this.webSocketService.send({ action: 'editProduct', id, inventory: updatedProduct });
  }

  getInventory(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(this.API_URL + 'inventory');
  }
}
