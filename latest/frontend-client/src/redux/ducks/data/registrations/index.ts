import { DataStorage, DataTransfer } from 'frontend-core';
import { AxiosResponse } from 'axios';
import moment from 'moment';
import { EventTypes } from 'redux-segment';
import {
  ApiRegistration,
  DataRegistrationActions,
  DataRegistrationsState,
  DataRegistrationActionTypes
} from './types';
import { ThunkResult } from 'redux/types';
export * from './types';
export * from './selectors';

const transfer = new DataTransfer({ retryConfig: { retries: 3 } });
const store = new DataStorage();

export const initialState: DataRegistrationsState = {
  data: [],
  loading: false,
  failure: false
};

export default function reducer(
  state: DataRegistrationsState = initialState,
  action: DataRegistrationActions
): DataRegistrationsState {
  switch (action.type) {
    case DataRegistrationActionTypes.FIND_REQUEST: {
      return { ...state, loading: true };
    }
    case DataRegistrationActionTypes.FIND_FAILURE: {
      return { ...state, loading: false, failure: true };
    }
    case DataRegistrationActionTypes.FIND_SUCCESS: {
      return {
        ...state,
        loading: false,
        failure: false,
        data: action.payload
      };
    }
    case DataRegistrationActionTypes.REMOVE_SUCCESS: {
      state.data.splice(
        state.data.indexOf(state.data.find((data) => data.id === parseInt(action.payload))),
        1
      );
      return state;
    }
    case DataRegistrationActionTypes.REMOVE_REQUEST:
    case DataRegistrationActionTypes.REMOVE_FAILURE:
    default: {
      return state;
    }
  }
}

export function find(
  start = moment().subtract(1, 'month'),
  end = moment(),
  multiple = false
): ThunkResult<Promise<DataRegistrationActions>, DataRegistrationActions> {
  return async (dispatch, getStore) => {
    const { dashboard } = getStore();
    const accounts = dashboard.accounts;

    dispatch({
      type: DataRegistrationActionTypes.FIND_REQUEST
    });

    const config = {
      params: {
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD')
      }
    };

    if (accounts.length > 0 && multiple) {
      config.params['accounts'] = accounts.join(',');
    }

    try {
      const response = (await transfer.get(
        '/foodwaste/registrations',
        config,
        true
      )) as AxiosResponse<ApiRegistration[]>;
      return dispatch({
        type: DataRegistrationActionTypes.FIND_SUCCESS,
        payload: response.data.map((registration) => ({
          ...registration,
          co2: parseInt(registration.co2),
          cost: parseInt(registration.cost),
          customerId: parseInt(registration.customerId),
          userId: parseInt(registration.userId),
          id: parseInt(registration.id)
        }))
      });
    } catch (err: unknown) {
      return dispatch({
        type: DataRegistrationActionTypes.FIND_FAILURE,
        meta: {
          analytics: {
            // eslint-disable-next-line
            eventType: EventTypes.track
          }
        }
      });
    }
  };
}

export function remove(
  id: string
): ThunkResult<Promise<DataRegistrationActions>, DataRegistrationActions> {
  return async (dispatch) => {
    dispatch({
      type: DataRegistrationActionTypes.REMOVE_REQUEST
    });

    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      await transfer.delete(`/foodwaste/registrations/${id}`, { params: {} });
      return dispatch({
        type: DataRegistrationActionTypes.REMOVE_SUCCESS,
        payload: id
      });
    } catch (err: unknown) {
      return dispatch({
        type: DataRegistrationActionTypes.REMOVE_FAILURE,
        meta: {
          analytics: {
            // eslint-disable-next-line
            eventType: EventTypes.track
          }
        }
      });
    }
  };
}
