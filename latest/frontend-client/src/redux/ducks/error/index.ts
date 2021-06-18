import { browserHistory } from 'react-router';
import * as authDispatch from 'redux/ducks/auth';
import { ThunkResult } from 'redux/types';
import { AnyAction } from 'redux';
import { ErrorActionTypes, ErrorActions, ErrorState } from 'redux/ducks/error/types';

export * from 'redux/ducks/error/types';

export const initialState: ErrorState = {
  code: null,
  message: null,
  active: false
};

export default function reducer(
  state: ErrorState = initialState,
  action: ErrorActions
): ErrorState {
  switch (action.type) {
    case ErrorActionTypes.SHOW_ERROR: {
      const { message, code } = action.payload;
      return {
        code,
        message,
        active: true
      };
    }
    case ErrorActionTypes.CLOSE_ERROR:
      return initialState;

    default:
      return state;
  }
}

export const badTokenErrorCodes = ['E401', 'E054', 'E056', 'E057', 'E058'];

export function showError(
  code: number | string,
  message: string
): ThunkResult<ErrorActions, AnyAction> {
  return (dispatch) => {
    if (badTokenErrorCodes.indexOf(code.toString()) > -1) {
      dispatch(authDispatch.logout());
      browserHistory.push('/auth');
    }
    return dispatch({
      type: ErrorActionTypes.SHOW_ERROR,
      payload: { code, message }
    });
  };
}

export function closeError(): ErrorActions {
  return {
    type: ErrorActionTypes.CLOSE_ERROR
  };
}
