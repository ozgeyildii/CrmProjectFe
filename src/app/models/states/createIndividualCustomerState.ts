export interface CreateIndividualCustomerState {
  firstName?: string;
  lastName?: string;
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
  cityName?: string;
  districtName?: string;
  street?: string;
  houseNumber?: string;
  description?: string;
}

export interface ContactMedium {
  type?: string;
  value?: string;
  isPrimary?: boolean;
}
