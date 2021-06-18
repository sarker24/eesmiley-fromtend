// todo: data not needed in client global state, put in containers
import { DataStorage, DataTransfer } from 'frontend-core';
import { AxiosError, AxiosResponse } from 'axios';
import { EventTypes } from 'redux-segment';
import {
  Basis,
  DefaultBasis,
  DefaultDimension,
  DefaultPeriod,
  ReportFilterState
} from 'redux/ducks/reports-new';
import {
  MetricsData,
  MetricsResponse,
  ReportChart,
  ReportDataActionTypes,
  ReportDataIdentifier,
  ReportDataSale,
  ReportDataState,
  SeriesResponse
} from './types';
import { ThunkResult } from 'redux/types';
import { ApiError } from 'redux/ducks/error';
import { GuestRegistration } from 'redux/ducks/guestRegistrations';
import { InjectedIntl } from 'react-intl';
import { Labels } from 'utils/labels';
import moment from 'moment';
import { API_DATE_FORMAT } from 'utils/datetime';

export * from './types';

const transfer = new DataTransfer({ retryConfig: { retries: 3 } });
const store = new DataStorage();

const initialData: ReportChart<SeriesResponse | MetricsResponse> = {
  isLoading: true,
  error: null,
  initialised: false,
  data: {} as SeriesResponse | MetricsResponse,
  basis: DefaultBasis,
  dimension: DefaultDimension,
  period: DefaultPeriod,
  timeRange: {
    from: moment().subtract(1, DefaultPeriod).startOf('isoWeek').format(API_DATE_FORMAT),
    to: moment().subtract(1, DefaultPeriod).endOf('isoWeek').format(API_DATE_FORMAT)
  }
};

export const initialState: ReportDataState = {
  foodWasteOverview: { ...initialData, data: { series: [] } } as ReportChart<SeriesResponse>,
  trendFoodWaste: { ...initialData, data: { series: [] } } as ReportChart<SeriesResponse>,
  foodWasteMetricsOverview: {
    ...initialData,
    data: { metrics: [] }
  } as ReportChart<MetricsResponse>,
  regFrequencyMetrics: { ...initialData, data: { metrics: [] } } as ReportChart<MetricsResponse>,
  registrationsPerDay: { ...initialData, data: { series: [] } } as ReportChart<SeriesResponse>,
  registrationsPerAccount: { ...initialData, data: { series: [] } } as ReportChart<SeriesResponse>,
  foodWasteStatus: { ...initialData, data: { series: [] } } as ReportChart<SeriesResponse>,
  foodWasteMetrics: { ...initialData, data: { metrics: [] } } as ReportChart<MetricsResponse>,
  foodWastePerAccount: { ...initialData, data: { series: [] } } as ReportChart<SeriesResponse>,
  guestRegistrations: { ...initialData, data: [] as GuestRegistration[] },
  salesRegistrations: { ...initialData, data: [] as ReportDataSale[] }
};

export default function reducer(
  state: ReportDataState = initialState,
  action: ReportDataActions
): ReportDataState {
  switch (action.type) {
    case ReportDataActionTypes.FETCH_REQUEST: {
      return {
        ...state,
        [action.payload.identifier]: {
          ...state[action.payload.identifier],
          isLoading: true,
          error: null
        }
      };
    }
    case ReportDataActionTypes.FETCH_FAILURE: {
      return {
        ...state,
        [action.payload.identifier]: {
          ...state[action.payload.identifier],
          isLoading: false,
          error: action.payload.data
        }
      };
    }
    case ReportDataActionTypes.FETCH_SUCCESS: {
      const { identifier, ...payload } = action.payload;
      return {
        ...state,
        [identifier]: {
          ...payload,
          initialised: true,
          isLoading: false,
          error: null
        }
      };
    }
    default: {
      return state;
    }
  }
}

// quick fix for accounts name parameter to avoid refactoring
// better would be non-react intl / passing all required apiParams / updating state to have name prop per filter
export type FetchDataOptions = { intl?: InjectedIntl };

export function fetchData(
  identifier: ReportDataIdentifier,
  options: FetchDataOptions = {}
): ThunkResult<Promise<ReportDataActions>, ReportDataActions> {
  return (dispatch, getState) => {
    const { reportData, newReports: reportFilters } = getState();

    if (!reportData[identifier].isLoading) {
      dispatch({
        type: ReportDataActionTypes.FETCH_REQUEST,
        payload: { identifier }
      });
    }

    //  do not make api requests if filter has been just changes,
    // but not updated completely (eg available registration points are being fetched)
    if (!reportFilters.isInitialized || reportFilters.loading) {
      return;
    }

    return requestData(identifier, reportFilters, options)
      .then((data) => {
        return dispatch({
          type: ReportDataActionTypes.FETCH_SUCCESS,
          payload: {
            identifier,
            data,
            selectedGuestTypeNames: reportFilters.selectedGuestTypeNames,
            basis: reportFilters.basis,
            dimension: reportFilters.dimension,
            period: reportFilters.period,
            timeRange: reportFilters.timeRange
          }
        });
      })
      .catch((error: unknown) => {
        return dispatch({
          type: ReportDataActionTypes.FETCH_FAILURE,
          payload: { identifier, data: (error as AxiosError<ApiError>).response.data },
          meta: {
            analytics: {
              // eslint-disable-next-line
              eventType: EventTypes.track
            }
          }
        });
      });
  };
}

function requestData(
  identifier: ReportDataIdentifier,
  reportFilter: ReportFilterState,
  options: FetchDataOptions = {}
): Promise<SeriesResponse | MetricsResponse | ReportDataSale[] | GuestRegistration[]> {
  const {
    timeRange,
    period,
    filter: {
      accounts,
      selectedRegistrationPoints: { area, category, product },
      order
    },
    basis,
    dimension,
    selectedGuestTypeNames,
    guestTypeIdsByName
  } = reportFilter;
  const token = store.getData('token') as string;
  // eslint-disable-next-line
  transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const config = {
    params: {
      ...timeRange,
      dimension,
      period,
      accounts: accounts.join(','),
      area: area.length > 0 ? area.join(',') : undefined,
      category: category.length > 0 ? category.join(',') : undefined,
      product: product.length > 0 ? product.join(',') : undefined,
      order
    }
  };

  if (selectedGuestTypeNames.length > 0) {
    config.params['guestTypes'] = selectedGuestTypeNames
      .flatMap((name) => guestTypeIdsByName[name])
      .join(',');
  }

  switch (identifier) {
    case 'salesRegistrations': {
      const config = {
        params: { dimension, accounts: accounts.join(','), from: timeRange.from, to: timeRange.to }
      };
      const endpoint = 'foodwaste/reports/sales';
      return transfer
        .get(endpoint, config)
        .then((response: AxiosResponse<ReportDataSale[]>) => response.data);
    }
    case 'guestRegistrations': {
      const configParams = {
        params: { accounts: accounts.join(','), startDate: timeRange.from, endDate: timeRange.to }
      };

      if (selectedGuestTypeNames.length > 0) {
        configParams.params['guestTypes'] = selectedGuestTypeNames
          .flatMap((name) => guestTypeIdsByName[name])
          .join(',');
      }

      const endpoint = 'foodwaste/guest-registrations';
      return transfer
        .get(endpoint, configParams)
        .then((response: AxiosResponse<GuestRegistration[]>) => response.data);
    }
    case 'foodWasteMetricsOverview': {
      // quick fix, since per-guest / total is not separated in state
      // todo: separate total + per-guest so we can also utilize caching instead of making request every time
      const topMetricEndpoints = [
        'foodwaste/reports/foodwaste-top-metrics',
        'foodwaste/reports/foodwaste-per-guest-top-metrics'
      ];
      const responsePromises: Promise<AxiosResponse<MetricsResponse>>[] = [];
      for (const endpoint of topMetricEndpoints) {
        responsePromises.push(transfer.get(endpoint, config));
      }
      return Promise.all(responsePromises).then((responses) => {
        const metrics = responses
          .reduce((metrics, response) => metrics.concat(response.data.metrics), [] as MetricsData[])
          .filter((metric) =>
            ['foodwasteCurrentPeriod', 'foodwastePerGuestCurrentPeriod'].includes(metric.id)
          );
        return { metrics };
      });
    }

    case 'foodWastePerAccount': {
      const endpoint = 'foodwaste/reports/accounts';
      const { accounts, area, category, product, order, ...commonParams } = config.params;
      const { intl } = options;
      const filters = [reportFilter.filter, ...reportFilter.comparisonFilters];
      const accountQuery: any[] = filters.map((filter, index) => ({
        ...Object.assign({}, intl ? { name: `${intl.messages['base.group']}${index + 1}` } : {}),
        accounts: filter.accounts.join(','),
        ...Object.keys(filter.selectedRegistrationPoints).reduce(
          (labels, label: Labels) =>
            filter.selectedRegistrationPoints[label].length > 0
              ? { ...labels, [label]: filter.selectedRegistrationPoints[label].join(',') }
              : labels,
          {}
        ),
        order: filter.order
      }));
      const accountQueriesBase64: string = btoa(JSON.stringify(accountQuery));
      const resource = basis === 'total' ? basis : 'perGuest';
      const accountsConfig = {
        params: { ...commonParams, accountsQuery: accountQueriesBase64, resource }
      };
      return transfer
        .get(endpoint, accountsConfig)
        .then((response: AxiosResponse<SeriesResponse>) => {
          return response.data;
        });
    }
  }

  return getEndpoint(identifier, basis, config).then((response) => {
    return response.data;
  });
}

function getEndpoint(
  identifier: string,
  basis: Basis,
  config: unknown
): Promise<AxiosResponse<MetricsResponse | SeriesResponse>> {
  switch (identifier) {
    case 'foodWasteMetrics': {
      const url =
        basis === 'total'
          ? 'foodwaste/reports/foodwaste-top-metrics'
          : 'foodwaste/reports/foodwaste-per-guest-top-metrics';
      return transfer.get(url, config) as Promise<AxiosResponse<MetricsResponse>>;
    }
    case 'foodWasteOverview': {
      const url =
        basis === 'total'
          ? 'foodwaste/reports/foodwaste-overview'
          : 'foodwaste/reports/foodwaste-per-guest-overview';
      return transfer.get(url, config) as Promise<AxiosResponse<SeriesResponse>>;
    }
    case 'foodWasteStatus': {
      const url =
        basis === 'total'
          ? 'foodwaste/reports/foodwaste-status'
          : 'foodwaste/reports/foodwaste-per-guest-status';
      return transfer.get(url, config) as Promise<AxiosResponse<SeriesResponse>>;
    }
    case 'trendFoodWaste': {
      const url =
        basis === 'total'
          ? 'foodwaste/reports/foodwaste-trend'
          : 'foodwaste/reports/foodwaste-per-guest-trend';
      return transfer.get(url, config) as Promise<AxiosResponse<SeriesResponse>>;
    }
    case 'registrationsPerAccount': {
      const url = 'foodwaste/reports/frequency-per-account';
      return transfer.get(url, config) as Promise<AxiosResponse<SeriesResponse>>;
    }
    case 'registrationsPerDay': {
      const url = 'foodwaste/reports/frequency-average-per-day';
      return transfer.get(url, config) as Promise<AxiosResponse<SeriesResponse>>;
    }
    case 'regFrequencyMetrics': {
      const url = 'foodwaste/reports/frequency-top-metrics';
      return transfer.get(url, config) as Promise<AxiosResponse<MetricsResponse>>;
    }
    case 'foodWastePerAccount': {
      const url = 'foodwaste/reports/accounts';
      return transfer.get(url, config) as Promise<AxiosResponse<SeriesResponse>>;
    }
  }
}

type FetchReportDataRequestAction = {
  type: typeof ReportDataActionTypes.FETCH_REQUEST;
  payload: { identifier: ReportDataIdentifier };
};

type FetchReportDataSuccessAction = {
  type: typeof ReportDataActionTypes.FETCH_SUCCESS;
  payload: {
    identifier: ReportDataIdentifier;
    data: SeriesResponse | MetricsResponse | ReportDataSale[] | GuestRegistration[];
  };
};

type FetchReportDataFailureAction = {
  type: typeof ReportDataActionTypes.FETCH_FAILURE;
  payload: { identifier: ReportDataIdentifier; data: ApiError };
  meta?: {
    analytics: {
      eventType: EventTypes;
    };
  };
};

type ResetReportDataAction = {
  type: typeof ReportDataActionTypes.RESET_DATA;
  payload: { identifier: ReportDataIdentifier };
};

export type ReportDataActions =
  | FetchReportDataRequestAction
  | FetchReportDataSuccessAction
  | FetchReportDataFailureAction
  | ResetReportDataAction;
