import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebSocketProductsService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = webSocket('https://pos-backend-kt9t.vercel.app/products');
    
    // this.socket$ = webSocket('localhost:8080');

    this.socket$.subscribe(
      () => console.log('WebSocket connection established'),
      (error) => console.error('WebSocket connection error:', error),
      () => console.log('WebSocket connection closed')
    );
  }

  send(message: any) {
    this.socket$.next(message);
  }

  receive() {
    return this.socket$.asObservable();
  }
}
