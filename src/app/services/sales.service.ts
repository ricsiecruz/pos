import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { WebSocketService } from "../websocket-service";
import { Observable, BehaviorSubject, merge, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment.prod";

@Injectable({
  providedIn: "root",
})
export class SalesService {
  API_URL = environment.apiUrl;
  private salesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private salesCurrentDateSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  sales$: Observable<any[]> = this.salesSubject.asObservable();
  salesCurrentDate$: Observable<any[]> = this.salesCurrentDateSubject.asObservable();

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.loadProducts();
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

  addLocalProduct(product: any): number {
    const tempId = Date.now(); // or uuid
    product.id = tempId;
    product.credit = product.credit || null;

    const products = [product, ...this.salesSubject.value];

    console.log("add local product", products);

    this.salesSubject.next(products);
    localStorage.setItem("sales", JSON.stringify(products));
    return tempId;
  }

  removeLocalProduct(tempId: number) {
    const products = this.salesSubject.value.filter((p) => p.id !== tempId);
    this.salesSubject.next(products);
    this.saveProductsToStorage();
  }

  loadSalesFromStorage(): void {
    const stored = localStorage.getItem("sales");
    if (stored) {
      const products = JSON.parse(stored);
      this.salesSubject.next(products);
    }
  }

  saveProductsToStorage() {
    const products = this.salesSubject.value;
    console.log("save product to storage", products);
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

  updateLocalCredit(saleId: number | string, newCredit: number | null) {
    const products = this.salesSubject.value.map((sale) => {
      if (sale.id === saleId || sale.sale_id === saleId) {
        sale.credit = newCredit;
        sale.mode_of_payment =
          newCredit === null || newCredit === 0 ? "cash" : sale.mode_of_payment;
      }
      return sale;
    });

    this.salesSubject.next(products);
    this.saveProductsToStorage(); // << reuse existing method
  }
}
