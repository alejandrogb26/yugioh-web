import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { vi } from 'vitest';
import { CardsApiService } from '../../../core/api/cards-api.service';
import {
  CardDetail,
  CardImage,
  CardSearchParams,
  CardSummary,
  PageResponse,
} from '../../../core/models/card.models';
import { CardsPage } from './cards-page';

describe('CardsPage', () => {
  let fixture: ComponentFixture<CardsPage>;
  const cardsApi = {
    searchCards: vi.fn<(params: CardSearchParams) => Observable<PageResponse<CardSummary>>>(),
    getCard: vi.fn<(id: number) => Observable<CardDetail>>(),
    getCardImages: vi.fn<(id: number) => Observable<CardImage[]>>(),
  };

  beforeEach(async () => {
    const page: PageResponse<CardSummary> = {
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
    cardsApi.searchCards.mockReset();
    cardsApi.getCard.mockReset();
    cardsApi.getCardImages.mockReset();
    cardsApi.searchCards.mockReturnValue(of(page));

    await TestBed.configureTestingModule({
      imports: [CardsPage],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({})),
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
        { provide: CardsApiService, useValue: cardsApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardsPage);
    fixture.detectChanges();
  });

  it('loads the default list without per-card image metadata requests', () => {
    expect(cardsApi.searchCards).toHaveBeenCalledWith({ page: 0, size: 20, sort: 'name,asc' });
    expect(cardsApi.getCardImages).not.toHaveBeenCalled();
  });
});
