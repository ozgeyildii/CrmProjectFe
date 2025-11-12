import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { CreatedBasketItemResponse } from '../models/responses/createdBasketItemResponse';
import { GetCampaignProductOfferResponse } from '../models/responses/getCampaignProductOfferResponse';
import { GetCampaignResponse } from '../models/responses/getCampaignResponse';
import { GetCatalogResponse } from '../models/responses/getCatalogResponse';
import { GetProductOfferByCatalogResponse } from '../models/responses/getProductOfferByCatalogResponse';
import { BasketState } from '../models/states/basketState';
import { map, Observable } from 'rxjs';
import { AddBasketItemRequest } from '../models/requests/addBasketItemRequest';
import { GetBasketResponse } from '../models/responses/getBasketResponse';

@Injectable({
  providedIn: 'root',
})
export class BasketService {

  private catalogServiceBaseUrl = 'http://localhost:8091/catalogservice/api';
  private basketServiceBaseUrl = 'http://localhost:8091/basketservice/api';

  constructor(private httpClient: HttpClient) {}

  getAllCampaigns(): Observable<GetCampaignResponse[]> {
    return this.httpClient.get<GetCampaignResponse[]>(`${this.catalogServiceBaseUrl}/campaigns`);
  }

  getAllCatalogs(): Observable<GetCatalogResponse[]> {
    return this.httpClient.get<GetCatalogResponse[]>(`${this.catalogServiceBaseUrl}/catalogs`);
  }

  getProductOffersByCampaignId(campaignId: number): Observable<GetCampaignProductOfferResponse[]> {
  return this.httpClient.get<GetCampaignProductOfferResponse | GetCampaignProductOfferResponse[]>(
    `${this.catalogServiceBaseUrl}/campaign-product-offers/${campaignId}`
  ).pipe(
      map((res) => Array.isArray(res) ? res : [res]) 
    );
}

  getProductOffersByCatalogId(catalogId: number): Observable<GetProductOfferByCatalogResponse[]> {
    return this.httpClient.get<GetProductOfferByCatalogResponse[]>(`${this.catalogServiceBaseUrl}/product-offers/get-by-catalog/${catalogId}`);
  }

  addItemToBasket(
    billingAccountId: number,
    request: AddBasketItemRequest
  ): Observable<CreatedBasketItemResponse> {
    return this.httpClient.post<CreatedBasketItemResponse>(
      `${this.basketServiceBaseUrl}/baskets/${billingAccountId}/items`,
      request
    );
  }

  getBasket(billingAccountId: number): Observable<GetBasketResponse> {
    return this.httpClient.get<GetBasketResponse>(`${this.basketServiceBaseUrl}/baskets/${billingAccountId}`);
  }

  clearBasket(basketId: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.basketServiceBaseUrl}/baskets/clear/${basketId}`);
  }
}
