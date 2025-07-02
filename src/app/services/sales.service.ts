import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { WebSocketService } from "../websocket-service";
import { Observable, BehaviorSubject, merge, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment.prod";

@Injectable({
  providedIn: "root",
})
export class SalesService implements OnDestroy {
  API_URL = environment.apiUrl;
  private salesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private salesCurrentDateSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  sales$: Observable<any[]> = this.salesSubject.asObservable();
  salesCurrentDate$: Observable<any[]> = this.salesCurrentDateSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.loadProducts();
    const defaultPayload = { page: 1, limit: 10 };
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === "initialize") {
            return message.transactionSales;
          } else if (message.action === "newSale") {
            return message.data;
          } else {
            return null;
          }
        })
      ),
      this.http.post<any[]>(`${this.API_URL}sales`, defaultPayload)
    ).subscribe((data: any | any[]) => {
      if (Array.isArray(data)) {
        this.updateSales(data);
      } else if (data) {
        this.addOrUpdateSale(data);
        this.handleNewSale(data);
      }
    });
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  private handleNewSale(sale: any): void {
    this.updateDashboardData();
  }

  private updateDashboardData(): void {
    const payload = { page: 1, limit: 10 };
    this.getSales(payload).subscribe((data: any) => {
      this.salesSubject.next(data.sales.data);
    });
  }

  private loadProducts() {
    const defaultPayload = { page: 1, limit: 10, offset: 10 };
    this.getSales(defaultPayload).subscribe((response: any) => {
      console.log("response", response);
      // if your API returns { sales: { data: [...] } }
      this.updateProducts(response.sales?.data || []);
    });
  }

  addSales(sale: any) {
    console.log("add sales", sale);
    return this.http.post(`${this.API_URL}sales/add`, sale);
  }

  private updateProducts(sales: any[]): void {
    this.salesSubject.next(sales);
  }

  addLocalProduct(product: any) {
    product.credit = product.credit || null; // if 0, becomes null

    const products = [product, ...this.salesSubject.value];
    this.salesSubject.next(products);
    localStorage.setItem("sales", JSON.stringify(products));
  }

  removeLocalProduct(tempId: number) {
    const products = this.salesSubject.value.filter((p) => p.id !== tempId);
    this.salesSubject.next(products);
    this.saveProductsToStorage(); // << NEW
  }

  loadSalesFromStorage() {
    const stored = localStorage.getItem("sales");
    if (stored) {
      const products = JSON.parse(stored);
      this.salesSubject.next(products);
    }
  }

  saveProductsToStorage() {
    const products = this.salesSubject.value;
    localStorage.setItem("sales", JSON.stringify(products));
  }

  editTransaction(id: string, updatedTransaction: any) {
    if (!updatedTransaction.transactionid) {
      console.error("Transaction ID is required for updating sales.");
      return;
    }

    this.webSocketService.send({ action: "updateSales", id, sales: updatedTransaction });
  }

  editLoad(productId: string, updatedLoad: any) {
    this.webSocketService.send({ action: "editSalesLoad", productId, product: updatedLoad });
  }

  private addOrUpdateSale(sale: any): void {
    const currentSales = this.salesSubject.value;

    if (!Array.isArray(currentSales)) {
      console.error("Expected currentSales to be an array:", currentSales);
      return;
    }

    const existingSaleIndex = currentSales.findIndex((s) => s.id === sale.id);
    if (existingSaleIndex === -1) {
      this.salesSubject.next([...currentSales, sale]);
    } else {
      const updatedSales = [...currentSales];
      updatedSales[existingSaleIndex] = sale;
      this.salesSubject.next(updatedSales);
    }
  }

  private updateSales(sales: any[]): void {
    this.salesSubject.next(sales);
  }

  getSales(payload: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.API_URL}sales`, payload);
  }

  getTotalSalesSum(): Observable<number> {
    return this.http
      .get<{ total_sum: number }>(this.API_URL + "sales/total-sum")
      .pipe(map((response) => response.total_sum));
  }

  getTotalSalesSumToday(): Observable<number> {
    return this.http
      .get<{ total_sum_today: number }>(this.API_URL + "sales/total-sum-today")
      .pipe(map((response) => response.total_sum_today));
  }

  getSumOfFoodsAndDrinksForToday(): Observable<number> {
    return this.http
      .get<{ total_sum_of_foods_and_drinks_today: number }>(
        this.API_URL + "sales/total-sum-of-foods-and-drinks-today"
      )
      .pipe(map((response) => response.total_sum_of_foods_and_drinks_today));
  }

  getCurrentDateSales(): Observable<any> {
    return this.http
      .get<{ today: any }>(this.API_URL + "sales/today")
      .pipe(map((response) => response.today));
  }

  getFilteredSales(payload: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.API_URL}sales/date-range`, payload);
  }

  getFilteredMember(member: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.API_URL}sales/member-sales-today`, { member });
  }

  newSale(payload: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.API_URL}sales/add-sale`, { payload });
  }

  // getKaha(): Observable<any[]> {
  //   return this.http.get<any[]>(this.API_URL + 'kaha');
  // }

  // postKaha(amount: any): Observable<any[]> {
  //   return this.http.post<any[]>(`${this.API_URL}/kaha`, { amount });
  // }

  // putKaha() {

  // }
}
