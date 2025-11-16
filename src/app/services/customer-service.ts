import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { UpdateCustomerState } from '../models/states/updateCustomerState';
import { GetCustomerResponse } from '../models/responses/getCustomerResponse';
import { Observable } from 'rxjs';
import { UpdateContactMediumRequest } from '../models/requests/updateContactMediumRequest';
import { UpdateContactMediumResponse } from '../models/responses/updatedContactMediumResponse';
import { UpdatedPersonalInfoResponse } from '../models/responses/updatedPersonalInfo';
import { UpdatePersonalInfoRequest } from '../models/requests/updatePersonalInfoRequest';
import { UpdatedAddressResponse } from '../models/responses/updatedAddressResponse';
import { UpdateAddressRequest } from '../models/requests/updateAddressRequest';
import { GetCityResponse } from '../models/responses/getCityResponse';
import { GetDistrictResponse } from '../models/responses/getDistrictResponse';
import { CreatedAddressResponse } from '../models/responses/createdAddressResponse';
import { CreateAddressRequest } from '../models/requests/createAddressRequest';
import { GetAddressListResponse } from '../models/responses/getAddressListResponse';
import { PagedBillingAccountResponse } from '../models/responses/getBillingAccountResponse';
import { CreateBillingAccountRequest } from '../models/requests/createBillingAccountRequest';
import { CreatedBillingAccountResponse } from '../models/responses/createdBillingAccountResponse';
@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  public state = signal<UpdateCustomerState>({});

  private baseUrl = 'http://localhost:8091/searchservice/api/customer-search';
  private serviceBaseUrl = 'http://localhost:8091/customerservice/api';
  private catalogBaseUrl = 'http://localhost:8091/catalogservice/api';

  constructor(private http: HttpClient) {}

  getCustomerById(id: string) {
    return this.http.get<GetCustomerResponse>(
      `${this.serviceBaseUrl}/individual-customers/full-customer/${id}`
    );
  }

  updateCustomer(request: UpdatePersonalInfoRequest): Observable<UpdatedPersonalInfoResponse> {
    return this.http.put<UpdatedPersonalInfoResponse>(
      `${this.serviceBaseUrl}/individual-customers`,
      request
    );
  }

  updateMultipleContactMediums(
    requests: UpdateContactMediumRequest[]
  ): Observable<UpdateContactMediumResponse[]> {
    return this.http.put<UpdateContactMediumResponse[]>(
      `${this.serviceBaseUrl}/contactmediums/multiple`,
      requests
    );
  }

  checkNationalId(nationalId: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/check-national-id`, {
      params: { nationalId },
    });
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.serviceBaseUrl}/individual-customers/${id}`);
  }

  updateAddress(request: UpdateAddressRequest): Observable<UpdatedAddressResponse> {
    return this.http.put<UpdatedAddressResponse>(`${this.serviceBaseUrl}/addresses`, request);
  }

  createAddress(request: CreateAddressRequest): Observable<CreatedAddressResponse> {
    return this.http.post<CreatedAddressResponse>(`${this.serviceBaseUrl}/addresses`, request);
  }

  getAddressesByCustomerId(customerId: string): Observable<GetAddressListResponse[]> {
    return this.http.get<GetAddressListResponse[]>(
      `${this.serviceBaseUrl}/addresses/get-all/${customerId}`
    );
  }

  deleteAddress(addressId: number): Observable<void> {
    return this.http.delete<void>(`${this.serviceBaseUrl}/addresses/${addressId}`);
  }

  updatePrimaryAddress(addressId: number): Observable<void> {
    return this.http.patch<void>(`${this.serviceBaseUrl}/addresses/${addressId}/set-primary`, {});
  }

  getCities(): Observable<GetCityResponse[]> {
    return this.http.get<GetCityResponse[]>(`${this.serviceBaseUrl}/city/getListCityResponse`);
  }

  getDistrictsByCityId(cityId: number): Observable<GetDistrictResponse[]> {
    return this.http.get<GetDistrictResponse[]>(
      `${this.serviceBaseUrl}/districts/getByCityId/${cityId}`
    );
  }

  getAccounts(customerId: string, page: number): Observable<PagedBillingAccountResponse> {
    return this.http.get<PagedBillingAccountResponse>(
      `${this.serviceBaseUrl}/billingAccounts/getList/${customerId}`,
      {
        params: { page: page, pageSize: '4' },
      }
    );
  }

  deleteAccount(accountId: number): Observable<void> {
    return this.http.delete<void>(`${this.serviceBaseUrl}/billingAccounts/${accountId}`);
  }

  createBillingAccount(
    request: CreateBillingAccountRequest
  ): Observable<CreatedBillingAccountResponse> {
    return this.http.post<CreatedBillingAccountResponse>(
      `${this.serviceBaseUrl}/billingAccounts`,
      request
    );
  }

  addAddress(request: CreateAddressRequest): Observable<CreatedAddressResponse> {
    return this.http.post<CreatedAddressResponse>(`${this.serviceBaseUrl}/addresses`, request);
  }
}
