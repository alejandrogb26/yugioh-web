import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
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
  let router: Router;
  let title: Title;
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
    router = TestBed.inject(Router);
    title = TestBed.inject(Title);
  });

  it('loads the default list without per-card image metadata requests', () => {
    expect(cardsApi.searchCards).toHaveBeenCalledWith({ page: 0, size: 20, sort: 'name,asc' });
    expect(cardsApi.getCardImages).not.toHaveBeenCalled();
    expect(title.getTitle()).toBe('Cartas | Yu-Gi-Oh! First Generation');
  });

  it.each([-1, 256, 1.5, 'abc'])(
    'blocks invalid level %s without navigating or requesting the API',
    (level) => {
      const component = fixture.componentInstance as unknown as {
        filters: { controls: { level: { setValue(value: number | string): void } } };
        search(): void;
      };
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      cardsApi.searchCards.mockClear();

      component.filters.controls.level.setValue(level);
      component.search();
      fixture.detectChanges();

      expect(cardsApi.searchCards).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain(
        'número entero entre 0 y 255',
      );
    },
  );

  it.each([0, 1, 255])('allows valid level %s searches', (level) => {
    const component = fixture.componentInstance as unknown as {
      filters: { controls: { level: { setValue(value: number): void } } };
      search(): void;
    };
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.filters.controls.level.setValue(level);
    component.search();

    expect(navigate).toHaveBeenCalledOnce();
  });
});
