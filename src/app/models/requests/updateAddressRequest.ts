export interface UpdateAddressRequest {
  id: number;
  customerId: string;
  districtId: number;
  street: string;
  houseNumber: string;
  description: string;
}