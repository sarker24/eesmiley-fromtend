import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { AxiosError } from 'axios';
import { ApiError } from 'redux/ducks/error';
import { GuestType } from 'redux/ducks/guestTypes';

export type CachedFilter = {
  state: NestedPartial<ReportFilterState>;
};

export enum ReportActionTypes {
  FILTER_INIT_REQUEST = 'esmiley/reports/FILTER_INIT_REQUEST',
  FILTER_INIT_REG_POINTS_REQUEST = 'esmiley/reports/FILTER_INIT_REG_POINTS_REQUEST',
  FILTER_INIT_REG_POINTS_SUCCESS = 'esmiley/reports/FILTER_INIT_REG_POINTS_SUCCESS',
  FILTER_INIT_SUCCESS = 'esmiley/reports/FILTER_INIT_SUCCESS',

  FILTER_CHANGE_REQUEST = 'esmiley/reports/FILTER_CHANGE_REQUEST',
  FILTER_CHANGE_SUCCESS = 'esmiley/reports/FILTER_CHANGE_SUCCESS',

  FILTER_ADD_COMPARE_REQUEST = 'esmiley/reports/FILTER_ADD_COMPARE_REQUEST',
  FILTER_ADD_COMPARE_SUCCESS = 'esmiley/reports/FILTER_ADD_COMPARE_SUCCESS',

  FILTER_REMOVE_COMPARE_SUCCESS = 'esmiley/reports/FILTER_REMOVE_COMPARE_SUCCESS',

  FILTER_CHANGE_COMPARE_REQUEST = 'esmiley/reports/FILTER_CHANGE_COMPARE_REQUEST',
  FILTER_CHANGE_COMPARE_SUCCESS = 'esmiley/reports/FILTER_CHANGE_COMPARE_SUCCESS',

  FILTER_ERROR = 'esmiley/reports/FILTER_RELOAD_ALL_ERROR',

  FILTER_INIT_GUEST_TYPE_REQUEST = 'esmiley/reports/FILTER_INIT_GUEST_TYPE_REQUEST',
  FILTER_INIT_GUEST_TYPE_SUCCESS = 'esmiley/reports/FILTER_INIT_GUEST_TYPE_SUCCESS'
}

export type Order = 'asc' | 'desc';
export type Period = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
export type Basis = 'per-guest' | 'total';
export type Dimension = 'weight' | 'cost' | 'co2';
export type TimeRange = { from: string; to: string };

export interface AccountPointFilter {
  accounts: string[];
  selectedRegistrationPoints: RegistrationPointIds;
  availableRegistrationPoints: RegistrationPointIds;
  registrations: ReportRegistration[];
  order: Order;
}

export interface RegistrationPointIds {
  area: string[];
  category: string[];
  product: string[];
}

export interface RegistrationPoints {
  byId: Map<string, RegistrationPoint>;
  byName: Map<string, string[]>;
}

export interface ReportRegistration {
  amount: number;
  cost: string;
  co2: string;
  customerId: string;
  date: string;
  id: string;
  registrationPoint: ReportRegistrationPoint;
  comment?: string;
}

export interface ReportRegistrationPoint {
  id: string;
  label: string;
  name: string;
  parentId: string;
  path: string;
}

export interface ReportFilterState {
  timeRange: TimeRange;
  period: Period;
  dimension: Dimension;
  basis: Basis;
  guestTypesById: { [id: number]: GuestType };
  guestTypeIdsByName: { [name: string]: number[] };
  selectedGuestTypeNames: string[];
  registrationPoints: RegistrationPoints;
  filter: AccountPointFilter;
  comparisonFilters: AccountPointFilter[];
  isInitialized: boolean;
  isInitializing: boolean;
  loading: boolean;
  error: string;
  pending?: {
    timeRange: TimeRange;
    period: Period;
    dimension: Dimension;
    basis: Basis;
  };
}

export type AccountPointFilterUpdate = NestedPartial<
  Omit<AccountPointFilter, 'availableRegistrationPoints'>
>;

type InitFilterRequestAction = {
  type: typeof ReportActionTypes.FILTER_INIT_REQUEST;
};

type ChangeFilterRequestAction = {
  type: typeof ReportActionTypes.FILTER_CHANGE_REQUEST;
  payload?: Partial<ReportFilterState>;
};
type ChangeFilterSuccessAction = {
  type: typeof ReportActionTypes.FILTER_CHANGE_SUCCESS;
  payload: Partial<ReportFilterState>;
};

type InitFilterSuccessAction = {
  type: typeof ReportActionTypes.FILTER_INIT_SUCCESS;
};

type InitRegistrationPointsRequestAction = {
  type: typeof ReportActionTypes.FILTER_INIT_REG_POINTS_REQUEST;
};

type InitRegistrationPointsSuccessAction = {
  type: typeof ReportActionTypes.FILTER_INIT_REG_POINTS_SUCCESS;
  payload: {
    registrationPoints: {
      byId: Map<string, RegistrationPoint>;
      byName: Map<string, string[]>;
    };
  };
};

type InitGuestTypeRequestAction = {
  type: typeof ReportActionTypes.FILTER_INIT_GUEST_TYPE_REQUEST;
};

type InitGuestTypeSuccessAction = {
  type: typeof ReportActionTypes.FILTER_INIT_GUEST_TYPE_SUCCESS;
  payload: {
    guestTypesById: { [id: number]: GuestType };
    guestTypeIdsByName: { [name: string]: number[] };
    selectedGuestTypeNames: string[];
  };
};

type RemoveComparisonFilterSuccessAction = {
  type: typeof ReportActionTypes.FILTER_REMOVE_COMPARE_SUCCESS;
  payload: number;
};

type ChangeCompareFilterRequestAction = {
  type: typeof ReportActionTypes.FILTER_CHANGE_COMPARE_REQUEST;
};

type ChangeCompareFilterSuccessAction = {
  type: typeof ReportActionTypes.FILTER_CHANGE_COMPARE_SUCCESS;
  payload: { key: number; filter: AccountPointFilter };
};

type AddCompareFilterSuccessAction = {
  type: typeof ReportActionTypes.FILTER_ADD_COMPARE_SUCCESS;
  payload: AccountPointFilter;
};

type ReportErrorAction = {
  type: typeof ReportActionTypes.FILTER_ERROR;
  payload: AxiosError<ApiError>;
};

export type ReportActions =
  | InitFilterRequestAction
  | ChangeFilterRequestAction
  | ChangeFilterSuccessAction
  | InitFilterSuccessAction
  | InitRegistrationPointsRequestAction
  | InitRegistrationPointsSuccessAction
  | ChangeCompareFilterRequestAction
  | RemoveComparisonFilterSuccessAction
  | ChangeCompareFilterSuccessAction
  | AddCompareFilterSuccessAction
  | InitGuestTypeRequestAction
  | InitGuestTypeSuccessAction
  | ReportErrorAction;
