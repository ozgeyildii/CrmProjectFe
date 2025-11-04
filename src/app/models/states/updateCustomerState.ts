export interface UpdateCustomerState {
  id?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nationalId?: string;
  dateOfBirth?: string;
  motherName?: string;
  fatherName?: string;
  customerNumber?: string;
  gender?: string;
  addresses?: Address[];
  contactMediums?: ContactMedium[]; 
}

export interface Address {
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

export interface ContactMedium {
  id?: number;
  type?: string;
  value?: string;
  isPrimary?: boolean;
  customerId: string;
}