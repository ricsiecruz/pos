import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;

  // BehaviorSubject to handle server errors
  private errorSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  error$: Observable<string> = this.errorSubject.asObservable();

  constructor() {
    this.socket$ = webSocket(environment.wsUrl);

    this.socket$.subscribe(
      (message) => {
        if (message.error) {
          this.errorSubject.next(message.error); // Emit error message
        } else {
          console.log('Server response:', message);
          // Handle successful response as needed
        }
      },
      (error) => {
        console.error('WebSocket error:', error);
        this.errorSubject.next('WebSocket connection error'); // Emit connection error
      }
    );
  }

  send(message: any) {
    this.socket$.next(message);
  }

  receive() {
    return this.socket$.asObservable();
  }
}
