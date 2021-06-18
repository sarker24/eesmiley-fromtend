import { DataTransfer } from 'frontend-core';
import * as errorDispatch from 'redux/ducks/error';
import { AxiosResponse, AxiosError } from 'axios';
import {
  DashboardActions,
  DashboardState,
  DashboardActionTypes,
  ApiDashboardMetric
} from './types';
import { ApiError, ErrorActions } from 'redux/ducks/error';
import { ThunkResult } from 'redux/types';
import { Period, TimeRange } from 'redux/ducks/reports-new';
import { mapToStatusMetrics } from 'redux/ducks/dashboardNext/util';

export * from './types';

export const initialState: DashboardState = {
  state: 'init',
  metrics: []
};

export default function (state = initialState, action: DashboardActions): DashboardState {
  switch (action.type) {
    case DashboardActionTypes.FETCH_REQUEST: {
      return { ...state, state: 'loading' };
    }

    case DashboardActionTypes.FETCH_SUCCESS: {
      return { ...state, metrics: action.payload, state: 'idle' };
    }

    case DashboardActionTypes.FETCH_ERROR: {
      return {
        ...state,
        state: 'idle'
      };
    }

    default: {
      return state;
    }
  }
}

const transfer = new DataTransfer();

export interface FetchOptions {
  customerIds: number[];
  timeRange: TimeRange;
  period: Period;
}

export const fetchMetrics = (
  options: FetchOptions
): ThunkResult<Promise<DashboardActions | ErrorActions>, DashboardActions> => async (dispatch) => {
  const {
    customerIds,
    timeRange: { from, to },
    period
  } = options;

  dispatch({ type: DashboardActionTypes.FETCH_REQUEST });

  const params = {
    from,
    to,
    period,
    accounts: customerIds.join(',')
  };

  try {
    const response = (await transfer.get(
      '/foodwaste/dashboard',
      { params },
      true
    )) as AxiosResponse<{ metrics: ApiDashboardMetric[] }>;

    return dispatch({
      type: DashboardActionTypes.FETCH_SUCCESS,
      payload: mapToStatusMetrics(response.data.metrics)
    });
  } catch (err: unknown) {
    const error = err as AxiosError<ApiError>;
    const { errorCode, message } = error.response.data;
    dispatch({ type: DashboardActionTypes.FETCH_ERROR, payload: error.response.data });
    return dispatch(errorDispatch.showError(errorCode, message));
  }
};
