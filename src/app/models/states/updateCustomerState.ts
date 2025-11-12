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
  billingAccounts?: BillingAccount[];
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

export interface BillingAccount {
  id: number;
  type: string;
  status: string;
  accountNumber: string;
  accountName: string;
  customerId: string;
  addressId: number;
}