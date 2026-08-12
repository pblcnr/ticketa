import { Module } from '@nestjs/common';
import { GuardsModule } from '../../shared/guards/guards.module';
import { CatalogController } from './controllers/catalog.controller';
import { CATALOG_PROVIDER } from './providers/catalog-provider.interface';
import { TicketmasterProvider } from './providers/ticketmaster.provider';
import { CatalogService } from './services/catalog.service';

@Module({
  imports: [GuardsModule],
  controllers: [CatalogController],
  providers: [
    CatalogService,
    {
      provide: CATALOG_PROVIDER,
      useClass: TicketmasterProvider,
    },
  ],
})
export class CatalogModule {}
