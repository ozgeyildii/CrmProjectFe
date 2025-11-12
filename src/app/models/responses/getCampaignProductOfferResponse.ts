export interface GetCampaignProductOfferResponse {
    id: number;             
    productOfferId: number;   
    productOfferName: string;  
    price: number;  
    stock: number;
    discountRate:number;
    campaignId: number;
    campaignName:string;
    campaignCode:string;
}