import { Params, ParamMap } from '@angular/router';
import { CardSearchParams } from '../../core/models/card.models';

export const DEFAULT_PAGE = 0;
export const DEFAULT_SIZE = 20;
export const DEFAULT_SORT = 'name,asc';
export const PAGE_SIZES = [10, 20, 50, 100] as const;
export const SORT_FIELDS = [
  'id',
  'name',
  'nameEs',
  'cardType',
  'attribute',
  'race',
  'level',
  'atk',
  'def',
  'tcgDate',
  'ocgDate',
] as const;
export const SORT_DIRECTIONS = ['asc', 'desc'] as const;

export type SortField = (typeof SORT_FIELDS)[number];
export type SortDirection = (typeof SORT_DIRECTIONS)[number];
export type SortValue = `${SortField},${SortDirection}`;

export interface CardsCatalogState extends CardSearchParams {
  page: number;
  size: number;
  sort: SortValue;
}

export interface CardsCatalogFilters {
  name: string;
  type: string;
  attribute: string;
  race: string;
  level: number | null;
}

export function parseCardsCatalogState(query: ParamMap): CardsCatalogState {
  const sort = parseSort(query.get('sort'));

  return {
    name: trimOrUndefined(query.get('name')),
    type: trimOrUndefined(query.get('type')),
    attribute: trimOrUndefined(query.get('attribute')),
    race: trimOrUndefined(query.get('race')),
    level: parseLevel(query.get('level')),
    page: parsePage(query.get('page')),
    size: parseSize(query.get('size')),
    sort,
  };
}

export function cardsCatalogQueryParams(state: CardsCatalogState): Params {
  return {
    name: state.name ?? null,
    type: state.type ?? null,
    attribute: state.attribute ?? null,
    race: state.race ?? null,
    level: state.level === undefined ? null : String(state.level),
    page: state.page === DEFAULT_PAGE ? null : String(state.page),
    size: state.size === DEFAULT_SIZE ? null : String(state.size),
    sort: state.sort === DEFAULT_SORT ? null : state.sort,
  };
}

export function searchCardsCatalog(
  state: CardsCatalogState,
  filters: CardsCatalogFilters,
): CardsCatalogState {
  return {
    ...state,
    name: trimOrUndefined(filters.name),
    type: trimOrUndefined(filters.type),
    attribute: trimOrUndefined(filters.attribute),
    race: trimOrUndefined(filters.race),
    level: validLevel(filters.level),
    page: DEFAULT_PAGE,
  };
}

export function clearCardsCatalogFilters(state: CardsCatalogState): CardsCatalogState {
  return {
    ...state,
    name: undefined,
    type: undefined,
    attribute: undefined,
    race: undefined,
    level: undefined,
    page: DEFAULT_PAGE,
  };
}

export function changeCardsCatalogPage(state: CardsCatalogState, page: number): CardsCatalogState {
  return Number.isSafeInteger(page) && page >= DEFAULT_PAGE ? { ...state, page } : state;
}

export function changeCardsCatalogSize(state: CardsCatalogState, size: number): CardsCatalogState {
  return (PAGE_SIZES as readonly number[]).includes(size)
    ? { ...state, size, page: DEFAULT_PAGE }
    : state;
}

export function changeCardsCatalogSort(
  state: CardsCatalogState,
  field: string,
  direction: string,
): CardsCatalogState {
  return isSortField(field) && isSortDirection(direction)
    ? { ...state, sort: `${field},${direction}`, page: DEFAULT_PAGE }
    : state;
}

export function isSortField(value: string): value is SortField {
  return (SORT_FIELDS as readonly string[]).includes(value);
}

export function isSortDirection(value: string): value is SortDirection {
  return (SORT_DIRECTIONS as readonly string[]).includes(value);
}

function trimOrUndefined(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function parsePage(value: string | null): number {
  return parseInteger(value, DEFAULT_PAGE, (number) => number >= 0);
}

function parseSize(value: string | null): number {
  return parseInteger(value, DEFAULT_SIZE, (number) => number >= 1 && number <= 100);
}

function parseLevel(value: string | null): number | undefined {
  const parsed = parseInteger(value, Number.NaN, (number) => number >= 0 && number <= 255);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function validLevel(level: number | null): number | undefined {
  return level !== null && Number.isInteger(level) && level >= 0 && level <= 255
    ? level
    : undefined;
}

function parseInteger(
  value: string | null,
  fallback: number,
  isValid: (number: number) => boolean,
): number {
  if (value === null || !/^(0|[1-9]\d*)$/.test(value)) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && isValid(parsed) ? parsed : fallback;
}

function parseSort(value: string | null): SortValue {
  if (value === null) {
    return DEFAULT_SORT;
  }

  const [field, direction, extra] = value.split(',');
  if (extra !== undefined || field === undefined || direction === undefined) {
    return DEFAULT_SORT;
  }

  return isSortField(field) && isSortDirection(direction) ? `${field},${direction}` : DEFAULT_SORT;
}
