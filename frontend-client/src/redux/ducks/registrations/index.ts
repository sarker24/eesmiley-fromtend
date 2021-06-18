import { DataTransfer, DataStorage } from 'frontend-core';
import { AxiosResponse, AxiosError } from 'axios';
import moment, { Moment } from 'moment';
import * as errorDispatch from 'redux/ducks/error';
import { RegistrationsActionTypes, RegistrationsActions, RegistrationsState } from './types';
import { Registration } from 'redux/ducks/data/registrations';
import { ApiError, ErrorActions } from 'redux/ducks/error/types';
import { ThunkResult } from 'redux/types';
import { createSelector } from 'reselect';
import { RootState } from 'redux/rootReducer';
import { groupBy } from 'utils/array';

export * from './types';

const transfer = new DataTransfer();
const store = new DataStorage();

export const initialState: RegistrationsState = {
  registrations: []
};

// TODO remove, pointless state slice
export default function reducer(
  state: RegistrationsState = initialState,
  action: RegistrationsActions
): RegistrationsState {
  switch (action.type) {
    case RegistrationsActionTypes.GET_REGISTRATIONS:
      return {
        ...state,
        registrations: action.payload
      };
    default:
      return state;
  }
}

export function getRegistrations(
  start: Moment = moment(),
  end: Moment = moment()
): ThunkResult<Promise<RegistrationsActions | ErrorActions>, RegistrationsActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = (await transfer.get('/foodwaste/registrations', {
        params: {
          startDate: start.format('YYYY-MM-DD'),
          endDate: end.format('YYYY-MM-DD')
        }
      })) as AxiosResponse<Registration[]>;
      return dispatch({
        type: RegistrationsActionTypes.GET_REGISTRATIONS,
        payload: response.data
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

export function deleteRegistration(
  id: number | string
): ThunkResult<Promise<RegistrationsActions | ErrorActions>, RegistrationsActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      await transfer.delete(`/foodwaste/registrations/${id}`);
      return dispatch({
        type: RegistrationsActionTypes.DELETE_REGISTRATION
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

export const getRegistrationsByDate = createSelector(
  (state: RootState) => state.registrations.registrations,
  (registrations) => groupBy(registrations, 'date')
);
