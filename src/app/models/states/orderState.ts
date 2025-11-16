export interface OrderState {
  id: string;
  billingAccountId: number;
  totalPrice: number;
  address: Address;
  createdOrderItem: OrderItem[];
}

export interface Address {
  id: number;
  street: string;
  houseNumber: string;
  description: string;
  districtId: number;
  districtName: string;
  cityId: number;
  cityName: string;
}

export interface OrderItem{
 id: string;
 productOfferId: number;
 productOfferName: string;
 price: number;
 discountRate: number;
 discountedPrice: number;
 sourceType: string;
 basketItemId: string;
}
