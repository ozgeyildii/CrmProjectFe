export interface BasketState {
    id: string;
    billingAccountId: number;
    totalPrice: number;
    basketItems: BasketItem[];
}

export interface BasketItem {
    id: string;
    basketId: string;
    productOfferId: number;
    productOfferName: string;
    campaignProductOfferId: number;
    catalogProductOfferId: number;
    price: number;
    quantity: number;
    discountedPrice: number;
    discountRate: number;
}