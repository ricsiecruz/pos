import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = webSocket('ws://localhost:8080');

    this.socket$.subscribe(
      () => {
        console.log('WebSocket connection established');
        // Delay navigation after WebSocket connection is established
        setTimeout(() => {
          // Your navigation code here
        }, 100); // Delay for 0.1 seconds
      },
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
