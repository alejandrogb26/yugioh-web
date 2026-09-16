import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { CardsApiService } from '../../../core/api/cards-api.service';
import { CardSummary, PageResponse } from '../../../core/models/card.models';
import {
  CardsCatalogState,
  DEFAULT_PAGE,
  PAGE_SIZES,
  SORT_DIRECTIONS,
  SORT_FIELDS,
  SortDirection,
  SortField,
  cardsCatalogQueryParams,
  changeCardsCatalogPage,
  changeCardsCatalogSize,
  changeCardsCatalogSort,
  clearCardsCatalogFilters,
  parseCardsCatalogState,
  searchCardsCatalog,
} from '../cards-catalog-state';

const SORT_LABELS: Readonly<Record<SortField, string>> = {
  id: 'ID',
  name: 'Nombre',
  nameEs: 'Nombre español',
  cardType: 'Tipo',
  attribute: 'Atributo',
  race: 'Raza',
  level: 'Nivel',
  atk: 'ATK',
  def: 'DEF',
  tcgDate: 'Fecha TCG',
  ocgDate: 'Fecha OCG',
};

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cards-page.html',
  styleUrl: './cards-page.css',
})
export class CardsPage implements OnInit {
  private readonly cardsApi = inject(CardsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly pageSizes = PAGE_SIZES;
  protected readonly sortFields = SORT_FIELDS;
  protected readonly sortDirections = SORT_DIRECTIONS;
  protected readonly sortLabels = SORT_LABELS;
  protected readonly catalogState = signal<CardsCatalogState>(
    parseCardsCatalogState(this.route.snapshot.queryParamMap),
  );
  protected readonly response = signal<PageResponse<CardSummary> | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly sortField = computed<SortField>(
    () => this.catalogState().sort.split(',')[0] as SortField,
  );
  protected readonly sortDirection = computed<SortDirection>(
    () => this.catalogState().sort.split(',')[1] as SortDirection,
  );
  protected readonly filters = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    type: new FormControl('', { nonNullable: true }),
    attribute: new FormControl('', { nonNullable: true }),
    race: new FormControl('', { nonNullable: true }),
    level: new FormControl<number | null>(null),
  });

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((query) => parseCardsCatalogState(query)),
        distinctUntilChanged(
          (previous, current) => JSON.stringify(previous) === JSON.stringify(current),
        ),
        tap((state) => {
          this.catalogState.set(state);
          this.filters.patchValue(
            {
              name: state.name ?? '',
              type: state.type ?? '',
              attribute: state.attribute ?? '',
              race: state.race ?? '',
              level: state.level ?? null,
            },
            { emitEvent: false },
          );
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap((state) =>
          this.cardsApi.searchCards(state).pipe(
            catchError((error: unknown) => {
              this.error.set(this.toMessage(error));
              this.loading.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.response.set(response);
          this.loading.set(false);
        },
      });
  }

  protected search(): void {
    this.navigate(searchCardsCatalog(this.catalogState(), this.filters.getRawValue()));
  }

  protected clearFilters(): void {
    this.filters.reset({ name: '', type: '', attribute: '', race: '', level: null });
    this.navigate(clearCardsCatalogFilters(this.catalogState()));
  }

  protected changeSortField(value: string): void {
    this.navigate(changeCardsCatalogSort(this.catalogState(), value, this.sortDirection()));
  }

  protected changeSortDirection(value: string): void {
    this.navigate(changeCardsCatalogSort(this.catalogState(), this.sortField(), value));
  }

  protected changeSize(value: string): void {
    const size = Number(value);
    this.navigate(changeCardsCatalogSize(this.catalogState(), size));
  }

  protected previousPage(): void {
    const state = this.catalogState();
    if (state.page > DEFAULT_PAGE) {
      this.navigate(changeCardsCatalogPage(state, state.page - 1));
    }
  }

  protected nextPage(): void {
    const response = this.response();
    const state = this.catalogState();
    if (response && !response.last) {
      this.navigate(changeCardsCatalogPage(state, state.page + 1));
    }
  }

  private navigate(state: CardsCatalogState): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cardsCatalogQueryParams(state),
    });
  }

  private toMessage(error: unknown): string {
    return error instanceof HttpErrorResponse
      ? `No se pudo cargar el catálogo (${error.status}).`
      : 'No se pudo cargar el catálogo.';
  }
}
