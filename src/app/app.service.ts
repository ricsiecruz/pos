import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  API_URL = (environment.apiUrl);

  constructor(private http: HttpClient) { }

  getInventory() {
    return this.http.get(this.API_URL + 'inventory');
  }

  putStocks(id: any, payload: any) {
    console.log('id', id)
    console.log('payload', payload)
    return this.http.put(this.API_URL + `inventory/add-stocks/${id}`, payload)
  }

  postInventory(payload: any) {
    return this.http.post<any>(this.API_URL + 'inventory', payload)
  }

}
