import {
  BadGatewayException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  CATALOG_PROVIDER,
  CatalogItem,
  CatalogProvider,
  CatalogProviderError,
} from '../providers/catalog-provider.interface';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    @Inject(CATALOG_PROVIDER)
    private readonly catalogProvider: CatalogProvider,
  ) {}

  search(keyword?: string, page?: number): Promise<CatalogItem[]> {
    return this.execute(() => this.catalogProvider.search(keyword, page));
  }

  findById(externalId: string): Promise<CatalogItem | null> {
    return this.execute(() => this.catalogProvider.findById(externalId));
  }

  private async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof CatalogProviderError) {
        throw this.toHttpException(error);
      }

      this.logger.error(
        'Unexpected catalog provider error',
        error instanceof Error ? error.stack : String(error),
      );

      throw new BadGatewayException('Não foi possível consultar o catálogo externo.');
    }
  }

  private toHttpException(error: CatalogProviderError): Error {
    if (error.statusCode === 429 || (error.statusCode !== undefined && error.statusCode >= 500)) {
      return new ServiceUnavailableException(error.message);
    }

    return new BadGatewayException(error.message);
  }
}
