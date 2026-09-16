import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, catchError, map, switchMap, tap } from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);

  protected readonly card = signal<CardDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedImageId = signal<number | null>(null);
  protected readonly selectedImage = computed<CardImage | null>(() => {
    const images = this.card()?.images ?? [];
    return images.find((image) => image.imageId === this.selectedImageId()) ?? images[0] ?? null;
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => parseCardId(params.get('id'))),
        tap((id) => {
          this.card.set(null);
          this.selectedImageId.set(null);
          this.error.set(id === null ? 'El identificador de carta no es válido.' : null);
          this.loading.set(id !== null);
        }),
        switchMap((id) => {
          if (id === null) {
            return EMPTY;
          }

          return this.cardsApi.getCard(id).pipe(
            catchError((error: unknown) => {
              this.error.set(this.toMessage(error));
              this.loading.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((card) => {
        this.card.set(card);
        this.selectedImageId.set(card.images[0]?.imageId ?? null);
        this.loading.set(false);
      });
  }

  protected selectImage(imageId: number): void {
    this.selectedImageId.set(imageId);
  }

  protected formatDate(date: string | null): string {
    if (date === null) {
      return '—';
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : date;
  }

  protected effectLabel(hasEffect: boolean | null): string {
    return hasEffect === null ? '—' : hasEffect ? 'Sí' : 'No';
  }

  private toMessage(error: unknown): string {
    return error instanceof HttpErrorResponse && error.status === 404
      ? 'Carta no encontrada.'
      : 'No se pudo cargar la carta.';
  }
}

function parseCardId(value: string | null): number | null {
  if (value === null || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
