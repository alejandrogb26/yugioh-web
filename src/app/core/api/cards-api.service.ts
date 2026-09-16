import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CardDetail,
  CardImage,
  CardSearchParams,
  CardSummary,
  PageResponse,
} from '../models/card.models';

const CARDS_URL = '/api/v1/cards';

@Injectable({ providedIn: 'root' })
export class CardsApiService {
  private readonly http = inject(HttpClient);

  searchCards(search: CardSearchParams): Observable<PageResponse<CardSummary>> {
    let params = new HttpParams();
    const values: ReadonlyArray<[string, string | number | undefined]> = [
      ['name', search.name],
      ['type', search.type],
      ['attribute', search.attribute],
      ['race', search.race],
      ['level', search.level],
      ['page', search.page],
      ['size', search.size],
      ['sort', search.sort],
    ];

    for (const [key, value] of values) {
      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        params = params.set(key, String(value));
      }
    }

    return this.http.get<PageResponse<CardSummary>>(CARDS_URL, { params });
  }

  getCard(id: number): Observable<CardDetail> {
    return this.http.get<CardDetail>(`${CARDS_URL}/${id}`);
  }

  getCardImages(cardId: number): Observable<CardImage[]> {
    return this.http.get<CardImage[]>(`${CARDS_URL}/${cardId}/images`);
  }
}
