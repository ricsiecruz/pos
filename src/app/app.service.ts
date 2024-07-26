import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from '../environments/environment.prod';
// import { environment } from '../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  API_URL = (environment.apiUrl);

  constructor(private http: HttpClient) { }

  checkIp(): Observable<any> {
    return this.http.get(`${this.API_URL}whitelist/ip`)
  }

  allowAccess(): Observable<any> {
    console.log('api', this.API_URL)
    return this.http.get(`${this.API_URL}whitelist`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(error.message || error);
  }

  getInventory() {
    return this.http.get(this.API_URL + 'inventory');
  }

  putStocks(id: any, payload: any) {
    return this.http.put(this.API_URL + `inventory/add-stocks/${id}`, payload)
  }

  postInventory(payload: any) {
    return this.http.post<any>(this.API_URL + 'inventory', payload)
  }

  getProducts() {
    return this.http.get(this.API_URL + 'products')
  }

  postProduct(payload: any) {
    return this.http.post<any>(this.API_URL + `products`, payload)
  }

  putProduct(id: any, payload: any) {
    return this.http.put(this.API_URL + `products/${id}`, payload)
  }

  getExpenses() {
    return this.http.get(this.API_URL + 'expenses')
  }

  postExpense(payload: any) {
    return this.http.post<any>(this.API_URL + 'expenses', payload)
  }

}
