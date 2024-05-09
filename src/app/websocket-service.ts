import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = webSocket('ws://localhost:8080');
  }

  send(message: any) {
    this.socket$.next(message);
  }

  receive() {
    return this.socket$.asObservable();
  }
}
