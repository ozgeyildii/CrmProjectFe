
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchCustomerList } from '../models/responses/searchCustomersResponse';
 
@Injectable({ providedIn: 'root' })
export class SearchCustomerService {
  private readonly baseUrl = 'http://localhost:8091/searchservice/api/';
 
  constructor(private http: HttpClient) {}
 
  searchCustomers(): Observable<SearchCustomerList> {
    console.log("search service çalıştı")
    return this.http.get<SearchCustomerList>(`${this.baseUrl}customer-search/`);
  }
}