import { AxiosResponse, AxiosError } from 'axios';
import { DataStorage, DataTransfer } from 'frontend-core';
import * as errorDispatch from 'redux/ducks/error';
import { API_DATE_FORMAT } from 'utils/datetime';
import { Moment } from 'moment';
import { CreateSale, SalesActionTypes, Sale, SalesActions, SalesState } from './types';
import { ApiError, ErrorActions } from 'redux/ducks/error/types';
import { ThunkResult } from 'redux/types';

export * from './types';

export const initialState: SalesState = {
  sales: [],
  lastSale: undefined
};

export default function reducer(
  state: SalesState = initialState,
  action: SalesActions
): SalesState {
  switch (action.type) {
    case SalesActionTypes.SUBMIT_SALES:
      return { ...state, lastSale: action.payload, sales: [...state.sales, action.payload] };

    case SalesActionTypes.GET_SALES:
      return { ...state, sales: action.payload };
    default:
      return state;
  }
}

const transfer = new DataTransfer();
const store = new DataStorage();

interface SaleOptions {
  start?: Moment;
  end?: Moment;
}

export function getSales(
  options: SaleOptions = {}
): ThunkResult<Promise<SalesActions | ErrorActions>, SalesActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    const start = options.start && options.start.format(API_DATE_FORMAT);
    const end = options.end && options.end.format(API_DATE_FORMAT);
    const params = Object.assign({}, start && { start }, end && { end });

    // need to fix at core lib
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = (await transfer.get('/foodwaste/sales', {
        params
      })) as AxiosResponse<Sale[]>;
      return dispatch({
        type: SalesActionTypes.GET_SALES,
        payload: response.data
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

export function submitSales(
  data: CreateSale
): ThunkResult<Promise<SalesActions | ErrorActions>, SalesActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    if (!data.date) {
      try {
        const response = (await transfer.post('/foodwaste/sales', data)) as AxiosResponse<Sale>;
        return dispatch({
          type: SalesActionTypes.SUBMIT_SALES,
          payload: response.data
        });
      } catch (err: unknown) {
        const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
        return dispatch(errorDispatch.showError(errorCode, message));
      }
    }

    // TODO Change this when the service-foodwaste is fixed so it dosen't make more than 1 sales registration per date
    // Delete all sales registrations at the given date and then create a new sales registration at the date
    const params = { date: data.date };
    try {
      await transfer.delete('/foodwaste/sales', { params });
      const response = (await transfer.post('/foodwaste/sales', data)) as AxiosResponse<Sale>;
      return dispatch({
        type: SalesActionTypes.SUBMIT_SALES,
        payload: response.data
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}
