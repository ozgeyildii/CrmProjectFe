export interface GetOrdersByBillingAccountResponse {
  id: string;
  billingAccountId: number;
  totalPrice: number;
  address: {
    id: number;
    street: string;
    houseNumber: string;
    description: string;
    districtId: number;
    districtName: string;
    cityId: number;
    cityName: string;
  };
  createdOrderItem: {
    id: string;
    productId: number;
    productName: string;
    campaignId: number | null;
    campaignName: string | null;
  }[];
}
