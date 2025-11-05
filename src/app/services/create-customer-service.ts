import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateIndividualCustomerState } from '../models/states/createIndividualCustomerState';
import { CreateIndividualCustomerResponse } from '../models/responses/createIndividualCustomerResponse';

@Injectable({
  providedIn: 'root',
})
export class CreateCustomerService {
  public state = signal<CreateIndividualCustomerState>({});

  private baseUrl = 'http://localhost:8091/customerservice/api/orchestrator/full-individual-customers';

  constructor(private httpClient: HttpClient) {}

  checkNationalId(nationalId: string): Observable<{ exists: boolean }> {
    return this.httpClient.get<{ exists: boolean }>(
      `http://localhost:8091/customerservice/api/individual-customers/check-national-id`,
      { params: { nationalId } }
    );
  }

  createCustomer(): Observable<CreateIndividualCustomerResponse> {
    const payload = this.state();
    return this.httpClient.post<CreateIndividualCustomerResponse>(this.baseUrl, payload);
  }
}
