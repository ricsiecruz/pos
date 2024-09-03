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
  private membersSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  members$: Observable<any[]> = this.membersSubject.asObservable();
  private websocketSubscription: Subscription;
  private errorSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    const defaultPayload = { page: 1, limit: 10 };
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === 'addMember') {
            return message.member;
          } else if (message.action === 'initialize') {
            return message.members;
          } else {
            return null;
          }
        })
      ),
      this.http.post<any[]>(`${this.API_URL}members`, defaultPayload)
    ).subscribe((data: any | any[]) => {
      if (Array.isArray(data)) {
        this.updateMembers(data);
      } else if (data) {
        this.addOrUpdateMember(data);
      }
    });

    this.errorSubscription = this.webSocketService.error$.subscribe(
      (errorMessage) => {
        if (errorMessage) {
          console.log('WebSocket error:', errorMessage);
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

  private addOrUpdateMember(member: any): void {
    const existingMemberIndex = this.membersSubject.value.findIndex(p => p.id === member.id);
    if (existingMemberIndex === -1) {
      this.membersSubject.next([...this.membersSubject.value, member]);
    } else {
      const updatedMembers = [...this.membersSubject.value];
      updatedMembers[existingMemberIndex] = member;
      this.membersSubject.next(updatedMembers);
    }
  }

  private updateMembers(members: any[]): void {
    this.membersSubject.next(members);
  }

  addMember(member: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.webSocketService.send({ action: 'addMember', member });
      this.webSocketService.receive().subscribe((message: any) => {
        if (message.action === 'errorResponse' && message.error) {
          reject(message.error);
        } else {
          resolve();
        }
      }, error => {
        reject(error);
      });
    });
  }

  getMemberById(id: number, defaultPayload: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}members/${id}`, defaultPayload);
  }

  uploadExcel(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}members/upload`, formData);
  }

  refreshMembers(defaultPayload: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}members`, defaultPayload);
  }

  getMembers() {
    return this.http.get(`${this.API_URL}members`)
  }
  
}
