export interface CreatedAddressResponse{
  id?: number;
  cityId?: number;
  cityName?: string;
  districtId?: number;
  districtName?: string;
  street?: string;
  houseNumber?: string;
  description?: string;
  customerId: string;
  isDefault?: boolean;
}