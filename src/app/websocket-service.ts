// websocket.service.ts

import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../environments/environment';
// import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;

  // constructor() {
  //   this.socket$ = webSocket('ws://localhost:8080');
  //   // this.socket$ = webSocket('wss://pos-backend-kt9t.vercel.app/products');
  //   // this.socket$ = webSocket('wss://pos-backend-kt9t.vercel.app/');

  //   this.socket$.subscribe(
  //     () => console.log('WebSocket connection established'),
  //     (error) => console.error('WebSocket connection error:', error),
  //     () => console.log('WebSocket connection closed')
  //   );
  // }

  constructor() {
    this.socket$ = webSocket(environment.wsUrl);

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
