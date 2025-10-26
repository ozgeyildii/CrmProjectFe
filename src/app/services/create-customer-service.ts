import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateIndividualCustomerResponse } from '../models/responses/createIndividualCustomerResponse';
import { CreateIndividualCustomerRequest } from '../models/requests/createIndividualCustomerRequest';

@Injectable({
  providedIn: 'root'
})
export class CreateCustomerService {
  private baseUrl = 'http://localhost:8091/customerservice/api/individual-customers';

  constructor(private httpClient: HttpClient) {}

  // 🔹 createIndividualCustomer artık dryRun parametresi alıyor
  createIndividualCustomer(
    request: CreateIndividualCustomerRequest,
    dryRun: boolean = false
  ): Observable<CreateIndividualCustomerResponse> {

    const url = `${this.baseUrl}?dryRun=${dryRun}`;
    return this.httpClient.post<CreateIndividualCustomerResponse>(url, request);
  }
}