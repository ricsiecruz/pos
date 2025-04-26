import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { WebSocketService } from "../websocket-service";
import { Observable, BehaviorSubject, merge, Subscription } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "../../environments/environment.prod";

@Injectable({
  providedIn: "root",
})
export class ProductService implements OnDestroy {
  API_URL = environment.apiUrl;

  private productsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  products$: Observable<any[]> = this.productsSubject.asObservable();
  private websocketSubscription: Subscription;

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {
    this.getProducts();
    // First load initial products
    this.http.get<any[]>(this.API_URL + "products").subscribe((products) => {
      this.updateProducts(products);
    });

    // Then listen for WebSocket updates
    this.websocketSubscription = this.webSocketService
      .receive()
      .pipe(
        map((message: any) => {
          if (message.action === "addProduct") {
            return message.product;
          } else if (message.action === "editProduct") {
            return { edit: true, product: message.product };
          } else if (message.action === "deleteProduct") {
            return { delete: true, productId: message.productId };
          } else {
            return null;
          }
        })
      )
      .subscribe((data) => {
        if (data) {
          if (data.edit) {
            this.editLocalProduct(data.product);
          } else if (data.delete) {
            this.deleteLocalProduct(data.productId);
          } else {
            this.addOrUpdateProduct(data);
          }
        }
      });
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  private deleteLocalProduct(productId: string) {
    const products = [...this.productsSubject.value].filter((p) => p.id !== productId);
    this.productsSubject.next(products);
  }

  private addOrUpdateProduct(product: any): void {
    const existingProductIndex = this.productsSubject.value.findIndex((p) => p.id === product.id);
    if (existingProductIndex === -1) {
      const products = [product, ...this.productsSubject.value];
      this.productsSubject.next(products);
      localStorage.setItem("products", JSON.stringify(products));
    } else {
      const updatedProducts = [...this.productsSubject.value];
      updatedProducts[existingProductIndex] = product;
      this.productsSubject.next(updatedProducts);
      localStorage.setItem("products", JSON.stringify(updatedProducts));
    }
  }

  updateProducts(products: any[]) {
    this.productsSubject.next(products);
  }

  getProducts() {
    return this.http.get<any[]>(`${this.API_URL}products`);
  }

  addLocalProduct(product: any) {
    const products = [product, ...this.productsSubject.value]; // NEW: add to beginning
    this.productsSubject.next(products);
    localStorage.setItem("products", JSON.stringify(products)); // keep localStorage synced
  }

  removeLocalProduct(tempId: number) {
    const products = this.productsSubject.value.filter((p) => p.id !== tempId);
    this.productsSubject.next(products);
    this.saveProductsToStorage(); // << NEW
  }

  private editLocalProduct(product: any) {
    const products = [...this.productsSubject.value];
    const index = products.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      products[index] = product;
      this.productsSubject.next(products);
      this.saveProductsToStorage(); // << NEW
    }
  }

  saveProductsToStorage() {
    const products = this.productsSubject.value;
    localStorage.setItem("products", JSON.stringify(products));
  }

  loadProductsFromStorage() {
    const stored = localStorage.getItem("products");
    if (stored) {
      const products = JSON.parse(stored);
      this.productsSubject.next(products);
    }
  }

  replaceTempProduct(tempId: number, realProduct: any) {
    const products = this.productsSubject.value.map((p) => (p.id === tempId ? realProduct : p));
    this.productsSubject.next(products);
  }

  addProduct(newProduct: any) {
    return this.http.post(this.API_URL + "products", newProduct);
  }

  editProduct(productId: string, updatedProduct: any) {
    this.webSocketService.send({ action: "editProduct", productId, product: updatedProduct });
  }

  deleteProduct(productId: string) {
    this.webSocketService.send({ action: "deleteProduct", productId });
  }
}
