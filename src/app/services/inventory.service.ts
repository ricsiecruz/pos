import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket-service';
import { Observable, BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
            return message.inventory;
          } else if (message.action === 'initialize') {
            return message.inventory;
          } else if (message.action === 'newSale') {
            return message.data;
          } else {
            return null;
          }
        })
      ),
      this.http.get<any[]>(this.API_URL + 'inventory')
    ).subscribe((data: any | any[]) => {
      if (Array.isArray(data)) {
        this.updateInventory(data);
      } else if (data) {
        this.addOrUpdateInventory(data);
        this.handleNewSale(data);
      }
    });
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  private handleNewSale(sale: any): void {
    this.updateDashboardData();
  }

  private updateDashboardData(): void {
    this.http.get<any>(this.API_URL + 'inventory').subscribe((data: any) => {
      this.inventorySubject.next(data);
    });
  }

  addInventory(inventory: any) {
    this.webSocketService.send({ action: 'addInventory', inventory });
  }

  private addOrUpdateInventory(inventory: any): void {
    const currentInventory = Array.isArray(this.inventorySubject.value) ? this.inventorySubject.value : [];

    const existingInventoryIndex = currentInventory.findIndex(s => s.id === inventory.id);

    if (existingInventoryIndex === -1) {
      this.inventorySubject.next([...currentInventory, inventory]);
    } else {
      const updatedInventory = [...currentInventory];
      updatedInventory[existingInventoryIndex] = inventory;
      this.inventorySubject.next(updatedInventory);
    }
  }

  private updateInventory(inventory: any[]): void {
    this.inventorySubject.next(inventory);
  }

  editProduct(id: string, updatedProduct: any) {
    this.webSocketService.send({ action: 'addStock', id, inventory: updatedProduct });
  }

  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL + 'inventory');
  }
}
