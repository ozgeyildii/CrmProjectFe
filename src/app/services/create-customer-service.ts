import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateIndividualCustomerResponse } from '../models/responses/createIndividualCustomerResponse';
import { CreateIndividualCustomerRequest } from '../models/requests/createIndividualCustomerRequest';

@Injectable({
  providedIn: 'root'
})
export class CreateCustomerService {

  constructor(private httpClient: HttpClient){}

  createIndividualCustomer(createIndividualCustomerRequest:CreateIndividualCustomerRequest): Observable<CreateIndividualCustomerResponse>{
    return this.httpClient.post<CreateIndividualCustomerResponse>("http://localhost:8091/customerservice/api/individual-customers", createIndividualCustomerRequest);
  }
}
