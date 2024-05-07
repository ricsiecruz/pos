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
}
