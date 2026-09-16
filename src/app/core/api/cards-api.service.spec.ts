import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { CardsApiService } from './cards-api.service';
import { CardDetail, CardImage, CardSummary, PageResponse } from '../models/card.models';

describe('CardsApiService', () => {
  let service: CardsApiService;
  let httpTesting: HttpTestingController;

  const summary: CardSummary = {
    id: 1,
    name: 'Blue-Eyes White Dragon',
    nameEs: 'Dragón Blanco de Ojos Azules',
    cardType: 'Normal Monster',
    frameType: 'normal',
    atk: 3000,
    def: 2500,
    level: 8,
    race: 'Dragon',
    attribute: 'LIGHT',
    archetype: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CardsApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('requests the card list with non-empty search parameters', () => {
    let response: PageResponse<CardSummary> | undefined;

    service
      .searchCards({
        name: 'Dragón Blanco',
        attribute: 'LIGHT',
        race: '',
        page: 0,
        size: 20,
        sort: 'name,asc',
      })
      .subscribe((value) => (response = value));

    const request = httpTesting.expectOne((request) => request.url === '/api/v1/cards');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('name')).toBe('Dragón Blanco');
    expect(request.request.params.get('attribute')).toBe('LIGHT');
    expect(request.request.params.get('race')).toBeNull();
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('20');
    expect(request.request.params.get('sort')).toBe('name,asc');

    const page: PageResponse<CardSummary> = {
      content: [summary],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    };
    request.flush(page);

    expect(response).toEqual(page);
  });

  it('requests a card detail with a relative URL', () => {
    let response: CardDetail | undefined;
    const detail: CardDetail = {
      ...summary,
      description: 'Legendary dragon.',
      ygoprodeckUrl: 'https://ygoprodeck.com/card/89631139',
      fandomUrl: null,
      tcgDate: null,
      ocgDate: null,
      hasEffect: false,
      sets: [],
      images: [],
    };

    service.getCard(1).subscribe((value) => (response = value));

    const request = httpTesting.expectOne('/api/v1/cards/1');
    expect(request.request.method).toBe('GET');
    request.flush(detail);

    expect(response).toEqual(detail);
  });

  it('requests image metadata without downloading JPEG content', () => {
    let response: CardImage[] | undefined;
    const images: CardImage[] = [{ imageId: 10, cardId: 1, imageUrl: '/api/v1/images/10.jpg' }];

    service.getCardImages(1).subscribe((value) => (response = value));

    const request = httpTesting.expectOne('/api/v1/cards/1/images');
    expect(request.request.method).toBe('GET');
    request.flush(images);

    expect(response).toEqual(images);
  });
});
