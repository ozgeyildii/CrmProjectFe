export interface GetCustomerResponse {
  id?: string;
  firstName?: string;
  lastName?: string;
  customerNumber?: string;
  middleName?: string;
  nationalId?: string;
  dateOfBirth?: string;
  motherName?: string;
  fatherName?: string;
  gender?: string;
  addresses?: Address[];
  contactMediums?: ContactMedium[]; 
}

export interface Address {
  city?: string;
  district?: string;
  street?: string;
  houseNumber?: string;
  description?: string;
  customerId: string
}

export interface ContactMedium {
  type?: string;
  value?: string;
  isDefault?: boolean;
    customerId: string
}