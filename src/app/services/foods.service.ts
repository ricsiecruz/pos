import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { WebSocketService } from "../websocket-service";
import { Observable, BehaviorSubject, merge, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class FoodsService implements OnDestroy {
  API_URL = environment.apiUrl;

  private foodsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  foods$: Observable<any[]> = this.foodsSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.loadProducts();
    this.websocketSubscription = merge(
      this.webSocketService.receive().pipe(
        map((message: any) => {
          if (message.action === "addFood") {
            return message.foods;
          } else if (message.action === "getFoods") {
            return message.foods;
          } else {
            return null;
          }
        })
      ),
      this.http.get<any[]>(this.API_URL + "foods")
    ).subscribe((data: any | any[]) => {
      if (Array.isArray(data)) {
        this.updateProducts(data);
      } else if (data) {
        this.addOrUpdateProduct(data);
      }
    });
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  private loadProducts() {
    this.getProducts().subscribe((products) => {
      this.updateProducts(products);
    });
  }

  getProducts() {
    return this.http.get<any[]>(`${this.API_URL}foods`);
  }

  addProduct(foods: any) {
    return this.http.post(`${this.API_URL}foods`, foods);
  }

  private updateProducts(foods: any[]): void {
    this.foodsSubject.next(foods);
  }

  addLocalProduct(product: any) {
    const products = [product, ...this.foodsSubject.value]; // NEW: add to beginning
    this.foodsSubject.next(products);
    localStorage.setItem("foods", JSON.stringify(products)); // keep localStorage synced
  }

  removeLocalProduct(tempId: number) {
    const products = this.foodsSubject.value.filter((p) => p.id !== tempId);
    this.foodsSubject.next(products);
    this.saveProductsToStorage(); // << NEW
  }

  loadFoodsFromStorage() {
    const stored = localStorage.getItem("foods");
    if (stored) {
      const products = JSON.parse(stored);
      this.foodsSubject.next(products);
    }
  }

  saveProductsToStorage() {
    const products = this.foodsSubject.value;
    localStorage.setItem("foods", JSON.stringify(products));
  }

  private addOrUpdateProduct(food: any): void {
    console.log("f", food);
    const existingProductIndex = this.foodsSubject.value.findIndex((p) => p.id === food.id);
    if (existingProductIndex === -1) {
      this.foodsSubject.next([...this.foodsSubject.value, food]);
    } else {
      const updatedProducts = [...this.foodsSubject.value];
      updatedProducts[existingProductIndex] = food;
      this.foodsSubject.next(updatedProducts);
    }
  }

  editProduct(productId: string, updatedFood: any) {
    console.log("edit food", productId, updatedFood);
    this.webSocketService.send({ action: "editFood", productId, product: updatedFood });
  }

  addStocks(id: string, updatedProduct: any) {
    console.log("j", id, updatedProduct);
    this.webSocketService.send({ action: "addFoodStock", id, food: updatedProduct });
  }
}
