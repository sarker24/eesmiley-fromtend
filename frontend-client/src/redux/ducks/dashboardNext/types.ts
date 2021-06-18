import { MassUnit } from 'utils/number-format';
import { ApiError } from 'redux/ducks/error';
import { Growth } from 'metrics/StatusBar';

// doesnt make sense to use redux for dashboard,
// but it was quickest to copy old implementation

export enum DashboardActionTypes {
  FETCH_REQUEST = 'esmiley/dashboard/FETCH_REQUEST',
  FETCH_SUCCESS = 'esmiley/dashboard/FETCH_SUCCESS',
  FETCH_ERROR = 'esmiley/dashboard/FETCH_ERROR'
}

export interface UnitPoint {
  unit: MassUnit | '%';
  value: number;
}

const supportedDashboardMetrics = [
  'registration_frequency',
  'per_guest_waste',
  'total_waste',
  'co2_waste',
  'per_guest_saved',
  'per_guest_avoidable'
] as const;

export type DashboardMetricId = typeof supportedDashboardMetrics[number];

export interface ApiDashboardMetric {
  id: DashboardMetricId;
  point: UnitPoint;
  trend?: number;
  target?: UnitPoint;
}

export interface StatusMetric extends Omit<ApiDashboardMetric, 'trend'> {
  status: UnitPoint;
  growth: Growth;
}

export interface DashboardState {
  metrics: StatusMetric[];
  state: 'init' | 'idle' | 'loading';
}

type FetchRequest = {
  type: typeof DashboardActionTypes.FETCH_REQUEST;
};

type FetchSuccess = {
  type: typeof DashboardActionTypes.FETCH_SUCCESS;
  payload: StatusMetric[];
};

type FetchError = {
  type: typeof DashboardActionTypes.FETCH_ERROR;
  payload: ApiError;
};

export type DashboardActions = FetchRequest | FetchSuccess | FetchError;
