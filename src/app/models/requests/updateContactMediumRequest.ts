
export interface UpdateContactMediumRequest {
  id: number;
  type: string;
  value: string;
  isPrimary: boolean;
  customerId: string;
}