import { convertToParamMap } from '@angular/router';
import {
  CardsCatalogState,
  cardsCatalogQueryParams,
  changeCardsCatalogPage,
  changeCardsCatalogSize,
  changeCardsCatalogSort,
  clearCardsCatalogFilters,
  parseCardsCatalogState,
  searchCardsCatalog,
} from './cards-catalog-state';

const FILTERED_STATE: CardsCatalogState = {
  name: 'Dragon',
  type: 'Effect Monster',
  attribute: 'DARK',
  race: 'Dragon',
  level: 7,
  page: 2,
  size: 50,
  sort: 'atk,desc',
};

describe('cards catalog state', () => {
  it('uses the default state for /cards', () => {
    expect(parseCardsCatalogState(convertToParamMap({}))).toEqual({
      page: 0,
      size: 20,
      sort: 'name,asc',
    });
  });

  it('parses supported query parameters', () => {
    expect(parseCardsCatalogState(convertToParamMap(FILTERED_STATE))).toEqual(FILTERED_STATE);
  });

  it('normalizes invalid page, size, level and sort values', () => {
    expect(
      parseCardsCatalogState(
        convertToParamMap({ page: '-1', size: '101', level: '256', sort: 'unknown,sideways' }),
      ),
    ).toEqual({ page: 0, size: 20, sort: 'name,asc' });
  });

  it('omits default values and empty filters from generated URLs', () => {
    expect(cardsCatalogQueryParams(parseCardsCatalogState(convertToParamMap({})))).toEqual({
      name: null,
      type: null,
      attribute: null,
      race: null,
      level: null,
      page: null,
      size: null,
      sort: null,
    });
  });

  it('searches with trimmed filters, preserves size and sort, and resets the page', () => {
    expect(
      searchCardsCatalog(FILTERED_STATE, {
        name: '  Blue-Eyes  ',
        type: ' ',
        attribute: ' LIGHT ',
        race: '',
        level: 8,
      }),
    ).toEqual({
      name: 'Blue-Eyes',
      attribute: 'LIGHT',
      level: 8,
      page: 0,
      size: 50,
      sort: 'atk,desc',
    });
  });

  it('clears filters while preserving size and sort', () => {
    expect(clearCardsCatalogFilters(FILTERED_STATE)).toEqual({
      page: 0,
      size: 50,
      sort: 'atk,desc',
    });
  });

  it('does not generate a negative page', () => {
    expect(changeCardsCatalogPage({ ...FILTERED_STATE, page: 0 }, -1)).toEqual({
      ...FILTERED_STATE,
      page: 0,
    });
  });

  it('changes page while preserving filters, size and sort', () => {
    expect(changeCardsCatalogPage(FILTERED_STATE, 3)).toEqual({ ...FILTERED_STATE, page: 3 });
  });

  it('changes page size and resets the page', () => {
    expect(changeCardsCatalogSize(FILTERED_STATE, 100)).toEqual({
      ...FILTERED_STATE,
      size: 100,
      page: 0,
    });
  });

  it('changes sort and resets the page', () => {
    expect(changeCardsCatalogSort(FILTERED_STATE, 'nameEs', 'asc')).toEqual({
      ...FILTERED_STATE,
      sort: 'nameEs,asc',
      page: 0,
    });
  });
});
