export interface Aggregates {
  min?: number;
  max?: number;
  avg?: number;
  total?: number;
}

export interface Point {
  label: string;
  value: number;
}

export interface Series {
  id: string;
  name?: string;
  unit: string | null;
  aggregates: Aggregates;
  points: Point[];
}

// TODO: update ts so we can use omit<Series, 'points'>
export interface NestedSeries {
  id: string;
  name?: string;
  unit: string | null;
  aggregates: Aggregates;
  series: MixedSeries[];
}

export type MixedSeries = Series | NestedSeries;

export interface Metric {
  id: string;
  trend: number;
  unit: string | null;
  point: Point | number;
}

export interface Extra {
  target?: number;
}

export type Period = 'year' | 'quarter' | 'month' | 'week' | 'day' | 'custom';

export interface AccountQuery {
  name?: string; // optional name for the group, mainly for client
  accounts: number[] | string;
  areas?: number[];
  categories?: number[];
  products?: number[];
}
