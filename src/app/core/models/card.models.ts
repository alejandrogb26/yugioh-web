export interface CardSummary {
  id: number;
  name: string;
  nameEs: string | null;
  cardType: string;
  frameType: string;
  atk: number | null;
  def: number | null;
  level: number | null;
  race: string | null;
  attribute: string | null;
  archetype: string | null;
}

export interface CardDetail extends CardSummary {
  description: string;
  ygoprodeckUrl: string;
  fandomUrl: string | null;
  tcgDate: string | null;
  ocgDate: string | null;
  hasEffect: boolean | null;
  sets: CardSet[];
  images: CardImage[];
}

export interface CardSet {
  id: number;
  setName: string;
  setCode: string;
  setRarity: string | null;
  setRarityCode: string | null;
}

export interface CardImage {
  imageId: number;
  cardId: number;
  imageUrl: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CardSearchParams {
  name?: string;
  type?: string;
  attribute?: string;
  race?: string;
  level?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: 'INVALID_REQUEST' | 'RESOURCE_NOT_FOUND' | 'METHOD_NOT_ALLOWED' | 'INTERNAL_ERROR';
  errors?: Record<string, string[]>;
}
