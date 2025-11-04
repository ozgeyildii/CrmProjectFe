export interface UpdateAddressRequest {
  id: number;
  customerId: string;
  city: string;
  district: string;
  street: string;
  houseNumber: string;
  description: string;
}