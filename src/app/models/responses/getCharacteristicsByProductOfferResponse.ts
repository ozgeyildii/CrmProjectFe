export interface GetCharacteristicsByProductOffersResponse{
    productOfferId:number;
    productOfferName:string;
   characteristics: GetCharacteristics[];
}

export interface GetCharacteristics{

     id:number;
     name:string;
     editable:boolean;
     values:string[];
}