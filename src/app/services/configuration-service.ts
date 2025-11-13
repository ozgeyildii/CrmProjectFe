import { Injectable } from '@angular/core';
import { GetCharacteristicsByProductOffersResponse } from '../models/responses/getCharacteristicsByProductOfferResponse';
import { GetCharacteristicsByProductOffersRequest } from '../models/requests/getCharacteristicsByProductOffersRequest ';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private catalogServiceBaseUrl = 'http://localhost:8091/catalogservice/api';

  constructor(private http: HttpClient) {}

  /** 🔹 Sepetteki ProductOffer ID'lerine göre karakteristikleri getirir */
  getCharacteristicsByProductOfferIds(
    productOfferIds: number[]
  ): Observable<GetCharacteristicsByProductOffersResponse[]> {
    const body: GetCharacteristicsByProductOffersRequest = { productOfferIds };
    return this.http.post<GetCharacteristicsByProductOffersResponse[]>(
      `${this.catalogServiceBaseUrl}/characteristics`,
      body
    );
  }
  
}
