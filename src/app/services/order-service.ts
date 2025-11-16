import { Injectable, signal } from '@angular/core';
import { OrderState } from '../models/states/orderState';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetOrdersByBillingAccountResponse } from '../models/responses/getOrdersByBillingAccountResponse';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  orderServiceBaseUrl = 'http://localhost:8091/salesservice/api/orders';

  public orderState = signal<Partial<OrderState>>({});

  constructor(private httpClient: HttpClient) {}

  createProduct(orderId: string): Observable<void> {
    return this.httpClient.post<void>(`${this.orderServiceBaseUrl}/create-product/${orderId}`, {});
  }

  getOrders(billingAccountId: number): Observable<GetOrdersByBillingAccountResponse[]> {
    return this.httpClient.get<GetOrdersByBillingAccountResponse[]>(
      `${this.orderServiceBaseUrl}/${billingAccountId}`
    );
  }
}
