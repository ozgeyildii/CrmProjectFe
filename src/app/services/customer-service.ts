import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { UpdateCustomerState } from '../models/states/updateCustomerState';
import { GetCustomerResponse} from '../models/responses/getCustomerResponse';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

    public state = signal<UpdateCustomerState>({});


  private baseUrl = 'http://localhost:8091/searchservice/api/customer-search';

  constructor(private http: HttpClient) {}

  getCustomerById(id: string) {
    return this.http.get<GetCustomerResponse>(`${this.baseUrl}/get-customer-by-id`,{params: {id}});
  }

  
}
