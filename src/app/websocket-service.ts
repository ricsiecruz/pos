// websocket.service.ts

import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    // Establish WebSocket connection
    this.socket$ = webSocket('ws://localhost:8080');

    // Log WebSocket connection status
    this.socket$.subscribe(
      () => console.log('WebSocket connection established'),
      (error) => console.error('WebSocket connection error:', error),
      () => console.log('WebSocket connection closed')
    );
  }

  // Send message through WebSocket
  send(message: any) {
    this.socket$.next(message);
  }

  // Receive messages from WebSocket
  receive() {
    return this.socket$.asObservable();
  }
}
