export interface PagedBillingAccountResponse {

  content: GetBillingAccountResponse[];

  totalPages: number;

  totalElements: number;

  size: number;

  number: number;

}
 

export interface GetBillingAccountResponse {
  id: number;
  type: string;
  status: string;
  accountName: string;
  accountNumber: string;
  customerId: string;
  addressId: number;
}
