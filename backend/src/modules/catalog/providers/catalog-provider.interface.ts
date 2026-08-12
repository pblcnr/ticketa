export interface CatalogItem {
  externalId: string;
  name: string;
  date: string;
  imageUrl?: string;
  venueName?: string;
}

export interface CatalogProvider {
  search(keyword?: string, page?: number): Promise<CatalogItem[]>;
  findById(externalId: string): Promise<CatalogItem | null>;
}

export const CATALOG_PROVIDER = 'CATALOG_PROVIDER';

export class CatalogProviderError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'CatalogProviderError';
  }
}
