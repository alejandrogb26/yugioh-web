import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardsApiService } from '../../../core/api/cards-api.service';
import { CardSummary } from '../../../core/models/card.models';

@Component({
  imports: [RouterLink],
  templateUrl: './cards-page.html',
  styleUrl: './cards-page.css',
})
export class CardsPage implements OnInit {
  private readonly cardsApi = inject(CardsApiService);

  protected readonly cards = signal<CardSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cardsApi.searchCards({ page: 0, size: 20, sort: 'name,asc' }).subscribe({
      next: (response) => {
        this.cards.set(response.content);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.toMessage(error));
        this.loading.set(false);
      },
    });
  }

  private toMessage(error: unknown): string {
    return error instanceof HttpErrorResponse
      ? `No se pudo cargar el catálogo (${error.status}).`
      : 'No se pudo cargar el catálogo.';
  }
}
