import { Injectable, Logger } from '@nestjs/common';
import { CatalogItem, CatalogProvider, CatalogProviderError } from './catalog-provider.interface';

const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';
const TARGET_IMAGE_WIDTH = 640;

interface TicketmasterImage {
  url: string;
  width: number;
  ratio?: string;
}

interface TicketmasterVenue {
  name?: string;
}

interface TicketmasterEvent {
  id: string;
  name: string;
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
    };
  };
  images?: TicketmasterImage[];
  _embedded?: {
    venues?: TicketmasterVenue[];
  };
}

interface TicketmasterSearchResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
}

@Injectable()
export class TicketmasterProvider implements CatalogProvider {
  private readonly logger = new Logger(TicketmasterProvider.name);

  async search(keyword?: string, page = 0): Promise<CatalogItem[]> {
    const apiKey = this.getApiKey();
    const params = new URLSearchParams({
      apikey: apiKey,
      page: String(page),
    });

    if (keyword?.trim()) {
      params.set('keyword', keyword.trim());
    }

    const response = await this.fetchTicketmaster(`${TICKETMASTER_BASE_URL}/events.json?${params}`);

    if (response.status === 404) {
      return [];
    }

    const data = (await this.parseJsonResponse(response)) as TicketmasterSearchResponse;
    const events = data._embedded?.events ?? [];

    return events.map((event) => this.mapEvent(event));
  }

  async findById(externalId: string): Promise<CatalogItem | null> {
    const apiKey = this.getApiKey();
    const response = await this.fetchTicketmaster(
      `${TICKETMASTER_BASE_URL}/events/${encodeURIComponent(externalId)}.json?apikey=${apiKey}`,
    );

    if (response.status === 404) {
      return null;
    }

    const event = (await this.parseJsonResponse(response)) as TicketmasterEvent;

    return this.mapEvent(event);
  }

  private getApiKey(): string {
    const apiKey = process.env.TICKETMASTER_API_KEY?.trim();

    if (!apiKey) {
      throw new CatalogProviderError('Chave da API Ticketmaster não configurada.');
    }

    return apiKey;
  }

  private async fetchTicketmaster(url: string): Promise<Response> {
    try {
      return await fetch(url);
    } catch (error) {
      this.logger.error(
        'Falha de rede ao consultar a Ticketmaster Discovery API',
        error instanceof Error ? error.stack : String(error),
      );
      throw new CatalogProviderError(
        'Não foi possível conectar ao catálogo externo.',
        undefined,
        error,
      );
    }
  }

  private async parseJsonResponse(response: Response): Promise<unknown> {
    if (response.ok) {
      try {
        return await response.json();
      } catch (error) {
        this.logger.error(
          'Resposta inválida da Ticketmaster Discovery API',
          error instanceof Error ? error.stack : String(error),
        );
        throw new CatalogProviderError(
          'Resposta inválida do catálogo externo.',
          response.status,
          error,
        );
      }
    }

    await response.body?.cancel().catch(() => undefined);

    const message = this.mapTicketmasterErrorMessage(response.status);

    this.logger.warn(
      `Ticketmaster Discovery API retornou status ${response.status} para ${response.url}`,
    );

    throw new CatalogProviderError(message, response.status);
  }

  private mapTicketmasterErrorMessage(status: number): string {
    if (status === 429) {
      return 'Catálogo externo temporariamente indisponível (limite de requisições).';
    }

    if (status === 401 || status === 403) {
      return 'Não foi possível autenticar no catálogo externo.';
    }

    if (status >= 500) {
      return 'Catálogo externo temporariamente indisponível.';
    }

    return 'Não foi possível consultar o catálogo externo.';
  }

  private mapEvent(event: TicketmasterEvent): CatalogItem {
    return {
      externalId: event.id,
      name: event.name,
      date: this.resolveEventDate(event),
      imageUrl: this.pickImageUrl(event.images),
      venueName: event._embedded?.venues?.[0]?.name,
    };
  }

  private resolveEventDate(event: TicketmasterEvent): string {
    const localDate = event.dates?.start?.localDate;
    const localTime = event.dates?.start?.localTime;

    if (!localDate) {
      return '';
    }

    if (localTime) {
      return `${localDate}T${localTime}`;
    }

    return localDate;
  }

  private pickImageUrl(images: TicketmasterImage[] | undefined): string | undefined {
    if (!images?.length) {
      return undefined;
    }

    const sorted = [...images].sort((left, right) => {
      const leftDistance = Math.abs(left.width - TARGET_IMAGE_WIDTH);
      const rightDistance = Math.abs(right.width - TARGET_IMAGE_WIDTH);

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }

      const leftPrefersRatio = left.ratio === '16_9' ? 0 : 1;
      const rightPrefersRatio = right.ratio === '16_9' ? 0 : 1;

      return leftPrefersRatio - rightPrefersRatio;
    });

    return sorted[0]?.url;
  }
}
