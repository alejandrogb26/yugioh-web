import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CardsApiService } from '../../../core/api/cards-api.service';
import {
  CardDetail,
  CardImage,
  CardSearchParams,
  CardSummary,
  PageResponse,
} from '../../../core/models/card.models';
import { CardDetailPage } from './card-detail-page';

const CARD: CardDetail = {
  id: 32864,
  name: 'Dark Magician',
  nameEs: 'Mago Oscuro',
  cardType: 'Normal Monster',
  frameType: 'normal',
  description: 'The ultimate wizard in terms of attack and defense.',
  atk: 2500,
  def: 2100,
  level: 7,
  race: 'Spellcaster',
  attribute: 'DARK',
  archetype: null,
  ygoprodeckUrl: 'https://ygoprodeck.com/card/46986414',
  fandomUrl: 'https://yugioh.fandom.com/wiki/Dark_Magician',
  tcgDate: '2002-03-08',
  ocgDate: '1999-02-04',
  hasEffect: false,
  sets: [
    {
      id: 1,
      setName: 'Legend of Blue Eyes',
      setCode: 'LOB-005',
      setRarity: 'Ultra Rare',
      setRarityCode: 'UR',
    },
    { id: 2, setName: 'Starter Deck', setCode: 'SDY-006', setRarity: null, setRarityCode: null },
  ],
  images: [
    { imageId: 1, cardId: 32864, imageUrl: '/api/v1/images/1.jpg' },
    { imageId: 2, cardId: 32864, imageUrl: '/api/v1/images/2.jpg' },
  ],
};

describe('CardDetailPage', () => {
  let fixture: ComponentFixture<CardDetailPage>;
  let params: BehaviorSubject<ParamMap>;
  let title: Title;
  const cardsApi = {
    searchCards: vi.fn<(params: CardSearchParams) => Observable<PageResponse<CardSummary>>>(),
    getCard: vi.fn<(id: number) => Observable<CardDetail>>(),
    getCardImages: vi.fn<(id: number) => Observable<CardImage[]>>(),
  };

  beforeEach(async () => {
    params = new BehaviorSubject(convertToParamMap({ id: '32864' }));
    cardsApi.searchCards.mockReset();
    cardsApi.getCard.mockReset();
    cardsApi.getCardImages.mockReset();
    cardsApi.getCard.mockReturnValue(of(CARD));

    await TestBed.configureTestingModule({
      imports: [CardDetailPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params, snapshot: { paramMap: params.value } },
        },
        { provide: CardsApiService, useValue: cardsApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardDetailPage);
    fixture.detectChanges();
    title = TestBed.inject(Title);
  });

  it('loads a valid ID and renders its public detail, sets and secure external links', () => {
    expect(cardsApi.getCard).toHaveBeenCalledWith(32864);
    expect(cardsApi.getCardImages).not.toHaveBeenCalled();
    expect(title.getTitle()).toBe('Dark Magician | Yu-Gi-Oh! First Generation');

    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Dark Magician');
    expect(page.textContent).toContain('08/03/2002');
    expect(page.textContent?.indexOf('Legend of Blue Eyes')).toBeLessThan(
      page.textContent?.indexOf('Starter Deck') ?? -1,
    );
    expect(page.querySelector('img')?.getAttribute('src')).toBe('/api/v1/images/1.jpg');
    expect(
      page.querySelector('a[href="https://ygoprodeck.com/card/46986414"]')?.getAttribute('rel'),
    ).toBe('noopener noreferrer');
  });

  it.each(['abc', '0', '-1', '1.5', '9007199254740992'])(
    'does not request the API for invalid ID %s',
    (id) => {
      cardsApi.getCard.mockClear();
      params.next(convertToParamMap({ id }));
      fixture.detectChanges();

      expect(cardsApi.getCard).not.toHaveBeenCalled();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain(
        'identificador de carta no es válido',
      );
    },
  );

  it('shows loading and then the correct card when the route ID changes', () => {
    const request = new Subject<CardDetail>();
    cardsApi.getCard.mockClear();
    cardsApi.getCard.mockReturnValue(request);
    params.next(convertToParamMap({ id: '777' }));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Cargando carta');
    expect(cardsApi.getCard).toHaveBeenCalledWith(777);

    request.next({ ...CARD, id: 777, name: 'Summoned Skull', images: [] });
    request.complete();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Summoned Skull');
  });

  it('shows a not-found message for a 404 response', () => {
    cardsApi.getCard.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 404 })));
    params.next(convertToParamMap({ id: '404' }));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Carta no encontrada');
    expect(title.getTitle()).toBe('Carta no encontrada | Yu-Gi-Oh! First Generation');
  });

  it('shows a generic message for other request errors', () => {
    cardsApi.getCard.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 500 })));
    params.next(convertToParamMap({ id: '500' }));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No se pudo cargar la carta',
    );
  });

  it('renders cards without images or sets without null-like output or image requests', () => {
    cardsApi.getCard.mockReturnValueOnce(
      of({
        ...CARD,
        id: 999,
        nameEs: null,
        atk: null,
        def: null,
        level: null,
        race: null,
        attribute: null,
        archetype: null,
        fandomUrl: null,
        tcgDate: null,
        ocgDate: null,
        hasEffect: null,
        sets: [],
        images: [],
      }),
    );
    params.next(convertToParamMap({ id: '999' }));
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('No hay imágenes registradas');
    expect(page.textContent).toContain('No hay sets registrados');
    expect(page.textContent).not.toContain('null');
    expect(page.textContent).not.toContain('undefined');
    expect(cardsApi.getCardImages).not.toHaveBeenCalled();
  });

  it('selects another image without a metadata request', () => {
    const page = fixture.nativeElement as HTMLElement;
    const buttons = page.querySelectorAll<HTMLButtonElement>('.image-picker button');

    buttons[1]?.click();
    fixture.detectChanges();

    expect(page.querySelector('img')?.getAttribute('src')).toBe('/api/v1/images/2.jpg');
    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('true');
    expect(cardsApi.getCardImages).not.toHaveBeenCalled();
  });
});
