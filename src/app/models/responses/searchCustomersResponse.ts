export type SearchCustomerList = SearchCustomer[]

export interface SearchCustomer {
  id: string
  customerNumber: string
  firstName: string
  lastName: string
  nationalId: string
  dateOfBirth: string
  motherName: string
  fatherName: string
  gender: string
  addresses: Address[]
  contactMediums: ContactMedium[]
}

export interface Address {
 id: number;
  cityId: number;
  cityName: string;
  districtId: number;
  districtName: string;
  street: string;
  houseNumber: string;
  description: string;
  customerId: string;
  isDefault: boolean;
}

export interface ContactMedium {
  id: number
  type: string
  value: string
  customerId: any
  deletedDate: any
  primary: boolean
}