export interface GetProductOfferByCatalogResponse {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    discountRate: number;
    status: string;
    stock: number;
    price: number;
    productId: number;
}