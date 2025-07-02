import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { WebSocketService } from "../websocket-service";
import { Observable, BehaviorSubject, merge, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class MembersService implements OnDestroy {
  API_URL = environment.apiUrl;
  private membersSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  members$: Observable<any[]> = this.membersSubject.asObservable();
  private websocketSubscription: Subscription;
  private errorSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.loadProducts();
    const defaultPayload = { page: 1, limit: 10 };
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === "addMember") {
            return message.member;
          } else if (message.action === "initialize") {
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

    this.errorSubscription = this.webSocketService.error$.subscribe((errorMessage) => {
      if (errorMessage) {
        console.log("WebSocket error:", errorMessage);
      }
    });
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }

  private loadProducts() {
    this.getProducts().subscribe((products) => {
      this.updateProducts(products);
    });
  }

  getProducts() {
    return this.http.get<any[]>(`${this.API_URL}members`);
  }

  addProduct(member: any) {
    return this.http.post(`${this.API_URL}members`, member);
  }

  private updateProducts(member: any[]): void {
    this.membersSubject.next(member);
  }

  addLocalProduct(product: any) {
    const products = [product, ...this.membersSubject.value]; // NEW: add to beginning
    this.membersSubject.next(products);
    localStorage.setItem("members", JSON.stringify(products)); // keep localStorage synced
  }

  removeLocalProduct(tempId: number) {
    const products = this.membersSubject.value.filter((p) => p.id !== tempId);
    this.membersSubject.next(products);
    this.saveProductsToStorage(); // << NEW
  }

  loadMembersFromStorage() {
    const payload = { page: 1, limit: 10000 };
    this.refreshMembers(payload).subscribe((response) => {
      this.membersSubject.next(response.data || []);
    });
  }

  saveProductsToStorage() {
    const products = this.membersSubject.value;
    localStorage.setItem("members", JSON.stringify(products));
  }

  private addOrUpdateMember(member: any): void {
    const existingMemberIndex = this.membersSubject.value.findIndex((p) => p.id === member.id);
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

  addMember(member: any) {
    return this.http.post(`${this.API_URL}members/add`, member);
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
    return this.http.get(`${this.API_URL}members`);
  }
}
