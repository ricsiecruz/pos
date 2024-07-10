import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../environments/environment';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$?: WebSocketSubject<any>;

  // BehaviorSubject to handle server errors
  private errorSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  error$: Observable<string> = this.errorSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initWebSocket();
    }
  }

  private initWebSocket() {
    try {
      this.socket$ = webSocket(environment.wsUrl);

      this.socket$.subscribe(
        (message) => {
          if (message.error) {
            this.errorSubject.next(message.error); // Emit error message
          } else {
            // console.log('Server response:', message);
            // Handle successful response as needed
          }
        },
        (error) => {
          console.error('WebSocket error:', error);
          this.errorSubject.next('WebSocket connection error'); // Emit connection error
        }
      );
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      this.errorSubject.next('WebSocket initialization error');
    }
  }

  send(message: any) {
    if (this.socket$) {
      this.socket$.next(message);
    } else {
      console.log('WebSocket is not initialized.');
    }
  }

  receive() {
    if (this.socket$) {
      return this.socket$.asObservable();
    } else {
      console.error('WebSocket is not initialized.');
      return EMPTY; // or handle differently
    }
  }
}
