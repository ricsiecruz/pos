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
  private errorSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === 'addMember') {
            console.log('aaa', message);
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

    // Subscribe to error messages
    this.errorSubscription = this.webSocketService.error$.subscribe(
      (errorMessage) => {
        if (errorMessage) {
          // Handle error display to the user (e.g., show an alert or update UI)
          console.log('WebSocket error:', errorMessage);
          // Example: this.toastr.error(errorMessage, 'Error');
          // You can use any notification library like Toastr, MatSnackBar, etc.
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
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

  addMember(member: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.webSocketService.send({ action: 'addMember', member });
      
      this.webSocketService.receive().subscribe((message: any) => {
        if (message.action === 'errorResponse') {
          if (message.error) {
            reject(message.error);
          } else {
            resolve();
          }
        }
      }, error => {
        reject(error);
      });
    });
  }

  editProduct(productId: string, updatedProduct: any) {
    this.webSocketService.send({ action: 'editProduct', productId, product: updatedProduct });
  }
}
