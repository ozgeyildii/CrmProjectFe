
export interface UpdateContactMediumRequest {
  id: string;
  type: string;
  value: string;
  isPrimary: boolean;
  customerId: string;
}