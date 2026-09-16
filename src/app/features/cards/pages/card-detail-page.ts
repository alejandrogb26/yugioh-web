import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardsApiService } from '../../../core/api/cards-api.service';
import { CardDetail, CardImage } from '../../../core/models/card.models';

@Component({
  imports: [RouterLink],
  templateUrl: './card-detail-page.html',
  styleUrl: './card-detail-page.css',
})
export class CardDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cardsApi = inject(CardsApiService);

  protected readonly card = signal<CardDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(id) || id < 1) {
      this.error.set('El identificador de carta no es válido.');
      this.loading.set(false);
      return;
    }

    this.cardsApi.getCard(id).subscribe({
      next: (card) => {
        this.card.set(card);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.toMessage(error));
        this.loading.set(false);
      },
    });
  }

  protected firstImage(): CardImage | null {
    return this.card()?.images[0] ?? null;
  }

  private toMessage(error: unknown): string {
    return error instanceof HttpErrorResponse && error.status === 404
      ? 'La carta solicitada no existe.'
      : 'No se pudo cargar la carta.';
  }
}
