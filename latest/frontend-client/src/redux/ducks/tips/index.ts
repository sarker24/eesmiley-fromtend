import { AxiosResponse, AxiosError } from 'axios';
import { DataTransfer } from 'frontend-core';
import * as errorDispatch from 'redux/ducks/error';
import { ApiError } from 'redux/ducks/error/types';
import { ApiTip, TipActionTypes, TipActions, TipState } from 'redux/ducks/tips/types';
import { ThunkResult } from 'redux/types';

export * from './types';

export const initialState: TipState = {
  tips: [],
  initializing: false,
  initial: true,
  loaded: false,
  failed: false
};

export default function reducer(state: TipState = initialState, action: TipActions): TipState {
  switch (action.type) {
    case TipActionTypes.FETCH_REQUEST:
      return {
        ...state,
        initializing: true
      };
    case TipActionTypes.FETCH_SUCCESS:
      return {
        ...state,
        tips: action.payload,
        initial: false,
        loaded: true,
        initializing: false,
        failed: false
      };
    case TipActionTypes.FETCH_FAILURE:
      return {
        ...state,
        initializing: false,
        failed: true
      };
    default:
      return state;
  }
}

const transfer = new DataTransfer();

export function fetchTips(): ThunkResult<Promise<TipActions>, TipActions> {
  return async (dispatch) => {
    dispatch({
      type: TipActionTypes.FETCH_REQUEST
    });

    try {
      const response = (await transfer.get('/foodwaste/tips', {}, true)) as AxiosResponse<ApiTip[]>;
      const tips = response.data.filter((tip) => tip.isActive);
      return dispatch({
        type: TipActionTypes.FETCH_SUCCESS,
        payload: tips
      });
    } catch (err: unknown) {
      const { response } = err as AxiosError<ApiError>;
      if (response) {
        const { errorCode, message } = response.data;
        dispatch(errorDispatch.showError(errorCode, message));
        return dispatch({
          type: TipActionTypes.FETCH_FAILURE,
          payload: { errorCode, message }
        });
      }
    }
  };
}
