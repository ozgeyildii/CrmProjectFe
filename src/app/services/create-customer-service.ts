import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateIndividualCustomerState } from '../models/states/createIndividualCustomerState';
import { CreateIndividualCustomerResponse } from '../models/responses/createIndividualCustomerResponse';
import { GetDistrictResponse } from '../models/responses/getDistrictResponse';
import { GetCityResponse } from '../models/responses/getCityResponse';

@Injectable({
  providedIn: 'root',
})
export class CreateCustomerService {
  public state = signal<CreateIndividualCustomerState>({});

  private baseUrl =
    'http://localhost:8091/customerservice/api/orchestrator/full-individual-customers';
  private serviceBaseUrl = 'http://localhost:8091/customerservice/api';

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

  getCities(): Observable<GetCityResponse[]> {
    return this.httpClient.get<GetCityResponse[]>(
      `${this.serviceBaseUrl}/city/getListCityResponse`
    );
  }

  getDistrictsByCityId(cityId: number): Observable<GetDistrictResponse[]> {
    return this.httpClient.get<GetDistrictResponse[]>(
      `${this.serviceBaseUrl}/districts/getByCityId/${cityId}`
    );
  }
}
