import { ApiError } from 'redux/ducks/error';
import { GuestRegistration } from 'redux/ducks/guestRegistrations';
import { Basis, Dimension, Period, TimeRange } from 'redux/ducks/reports-new';

export interface Aggregates {
  total?: number;
  min?: number;
  max?: number;
  avg?: number;
}

export interface SeriesData {
  id?: string;
  name?: string;
  unit?: string;
  aggregates?: Aggregates;
  extra?: Extra;
  points?: Array<PointData>;
  series?: Array<SeriesData>;
}

export interface SeriesResponse {
  metrics?: MetricsData[];
  extra?: Extra;
  series: SeriesData[];
}

export interface MetricsResponse {
  metrics: MetricsData[];
}

export interface MetricsData {
  id: string;
  point: number | PointData;
  trend: number;
  unit: string;
}

export interface PointData {
  label: string;
  value: number;
}

export interface Extra {
  target: number;
}
export interface ReportChart<T> {
  isLoading: boolean;
  error: ApiError;
  initialised: boolean;
  data: T;
  dimension?: Dimension;
  basis?: Basis;
  timeRange?: TimeRange;
  period?: Period;
}

export interface ReportDataState {
  foodWasteOverview: ReportChart<SeriesResponse>;
  trendFoodWaste: ReportChart<SeriesResponse>;
  foodWasteMetricsOverview: ReportChart<MetricsResponse>;
  regFrequencyMetrics: ReportChart<MetricsResponse>;
  registrationsPerDay: ReportChart<SeriesResponse>;
  registrationsPerAccount: ReportChart<SeriesResponse>;
  foodWasteStatus: ReportChart<SeriesResponse>;
  foodWasteMetrics: ReportChart<MetricsResponse>;
  foodWastePerAccount: ReportChart<SeriesResponse>;
  guestRegistrations: ReportChart<GuestRegistration[]>;
  salesRegistrations: ReportChart<ReportDataSale[]>;
}

export type ReportDataIdentifier = keyof ReportDataState;
export enum ReportDataActionTypes {
  FETCH_REQUEST = 'reportData/FETCH_REQUEST',
  FETCH_SUCCESS = 'reportData/FETCH_SUCCESS',
  FETCH_FAILURE = 'reportData/FETCH_FAILURE',
  RESET_DATA = 'reportData/RESET_DATA'
}

export interface ReportDataSale {
  customerId: string;
  date: string;
  foodwasteAmount: number;
  foodwasteAmountPerGuest: number;
  foodwasteAmountPerPortion: number;
  foodwasteCost: number;
  foodwasteCostPerGuest: number;
  foodwasteCostPerPortion: number;
  guests: number;
  income: number;
  incomePerGuest: number;
  incomePerPortion: number;
  portions: number;
}
