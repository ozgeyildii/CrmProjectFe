export interface GetCatalogResponse{
    id: number;
    name: string;
    parentId: number;
    subCatalogIds: number[];
}