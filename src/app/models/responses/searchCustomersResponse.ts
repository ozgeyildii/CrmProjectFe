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
  id: number
  street: string
  houseNumber: string
  description: string
  districtId: number
  customerId: string
  deletedDate: any
  default: boolean
}

export interface ContactMedium {
  id: number
  type: string
  value: string
  customerId: any
  deletedDate: any
  primary: boolean
}