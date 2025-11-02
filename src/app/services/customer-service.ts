import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { UpdateCustomerState } from '../models/states/updateCustomerState';
import { GetCustomerResponse} from '../models/responses/getCustomerResponse';
import { Observable } from 'rxjs';
import { UpdatedPersonalInfo } from '../models/responses/updatedPersonalInfo';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

    public state = signal<UpdateCustomerState>({});


  private baseUrl = 'http://localhost:8091/searchservice/api/customer-search';
  private serviceBaseUrl = 'http://localhost:8091/customerservice/api/individual-customers';

  constructor(private http: HttpClient) {}

  getCustomerById(id: string) {
    return this.http.get<GetCustomerResponse>(`${this.baseUrl}/get-customer-by-id`,{params: {id}});
  }

   updateCustomer(request: UpdateCustomerState): Observable<UpdatedPersonalInfo> {
    return this.http.put<UpdatedPersonalInfo>(`${this.serviceBaseUrl}`, request);
  }


  checkNationalId(nationalId: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(
      `${this.baseUrl}/check-national-id`,{ params: { nationalId } }
    );
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.serviceBaseUrl}/${id}`);
  }
}
  

