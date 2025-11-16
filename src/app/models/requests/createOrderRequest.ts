export interface CreateOrderRequest {

    billingAccountId: number;
    addressId:number;
    items: CreateOrderItemRequest[];

}

export interface CreateOrderItemRequest {
    basketItemId: string;
    charValues: CreateOrderItemCharValueRequest[];
}


export interface CreateOrderItemCharValueRequest {
    characteristicName: string;
    characteristicValue: string;
}