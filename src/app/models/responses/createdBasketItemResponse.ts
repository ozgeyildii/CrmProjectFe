export interface CreatedBasketItemResponse {
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