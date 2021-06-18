import { Auth, DataStorage } from 'frontend-core';
import * as settingsDispatch from 'redux/ducks/settings';
import * as errorDispatch from 'redux/ducks/error';
import { EventTypes } from 'redux-segment';
import { AxiosError } from 'axios';
import * as userDispatch from 'redux/ducks/user';
import {
  AuthActions,
  AuthState,
  AuthActionTypes,
  TokenPayload,
  Credentials
} from 'redux/ducks/auth/types';
import { ApiError, ErrorActions } from 'redux/ducks/error/types';
import { ThunkResult } from 'redux/types';

export * from './types';

export const initialState: AuthState = {
  token: '',
  isLoggedIn: false,
  isLoggingIn: false,
  tokenPayload: null
};

const store = new DataStorage();
const auth = new Auth();

export default function reducer(state: AuthState = initialState, action: AuthActions): AuthState {
  switch (action.type) {
    case AuthActionTypes.LOGIN_INIT: {
      const { token, isLoggedIn } = action.payload;
      const { tokenPayload: oldTokenPayload } = state;

      // todo side-effects out of reducers
      // probably belongs to action creator or auth service
      const tokenPayload = token && token !== '' ? decodeJWT(token) : oldTokenPayload;

      if (tokenPayload && tokenPayload.exp) {
        // todo requires fixing core.store api; doesnt make sense to stringify primitives
        // eslint-disable-next-line
        // @ts-ignore
        store.setData('tokenExpiry', tokenPayload.exp);
      }

      const tokenExpiry = store.getData('tokenExpiry') as number;
      if (tokenExpiry && tokenExpiry < Date.now() / 1000) {
        return {
          token: '',
          isLoggedIn: false,
          isLoggingIn: false,
          tokenPayload: null
        };
      }

      return {
        ...state,
        token,
        isLoggedIn,
        tokenPayload
      };
    }
    case AuthActionTypes.LOGIN_REQUEST:
      return { ...state, isLoggingIn: true };

    case AuthActionTypes.LOGIN_SUCCESSFUL:
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn: true
      };

    case AuthActionTypes.LOGIN_AUTHENTICATE: {
      const tokenPayload =
        action.payload.token && action.payload.token != '' ? decodeJWT(action.payload.token) : null;

      if (tokenPayload && tokenPayload.exp) {
        // todo requires fixing core.store api; doesnt make sense to stringify primitives
        // eslint-disable-next-line
        // @ts-ignore
        store.setData('tokenExpiry', tokenPayload.exp);
      }

      return {
        ...state,
        token: action.payload.token,
        tokenPayload
      };
    }
    case AuthActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        token: null,
        isLoggedIn: false,
        tokenPayload: null,
        isLoggingIn: false
      };

    case AuthActionTypes.LOGOUT: {
      return {
        ...state,
        token: '',
        tokenPayload: null
      };
    }
    case AuthActionTypes.LOGOUT_SUCCESSFUL: {
      // todo side effects to action creators
      store.clearData('tokenExpiry');
      return {
        ...state,
        token: '',
        tokenPayload: null,
        isLoggedIn: false
      };
    }

    default:
      return state;
  }
}

export function decodeJWT(token: string, section = 1): TokenPayload | undefined {
  const base64Url = token.split('.')[section];

  if (base64Url == undefined) {
    return undefined;
  }

  const base64 = base64Url.replace('-', '+').replace('_', '/');
  try {
    return JSON.parse(window.atob(base64)) as TokenPayload;
  } catch (err) {
    return undefined;
  }
}

/**
 * Init method, adds a token to localstorage or retrieves it
 * @param {string} token Token given to the authentication service
 */
export function initLogin(token?: string): ThunkResult<Promise<AuthActions>, AuthActions> {
  return async (dispatch) => {
    const authToken = auth.initLogin(token) as string;

    if (authToken) {
      await dispatch(settingsDispatch.fetch());
      await dispatch(userDispatch.initUser());
    }
    return dispatch({
      type: AuthActionTypes.LOGIN_INIT,
      payload: {
        token: authToken,
        isLoggedIn: !!authToken
      },
      meta: {
        analytics: {
          // eslint-disable-next-line
          eventType: EventTypes.track
        }
      }
    });
  };
}

export function login(
  credentials: Credentials,
  errorMessage?: string
): ThunkResult<Promise<AuthActions>, AuthActions | ErrorActions> {
  return async (dispatch, getState) => {
    const { client } = getState().user;

    dispatch({
      type: AuthActionTypes.LOGIN_REQUEST
    });

    try {
      const token = (await auth.login(credentials, { client })) as string;
      await Promise.all([
        dispatch({
          type: AuthActionTypes.LOGIN_AUTHENTICATE,
          payload: { token }
        }),
        dispatch(settingsDispatch.fetch()),
        dispatch(userDispatch.initUser())
      ]);

      return dispatch({
        type: AuthActionTypes.LOGIN_SUCCESSFUL,
        meta: {
          analytics: [
            {
              // eslint-disable-next-line
              eventType: EventTypes.track
            },
            {
              // eslint-disable-next-line
              eventType: EventTypes.group,
              eventPayload: {
                type: 'group',
                groupId: 'users',
                traits: {
                  dealNumber: credentials.dealNumber,
                  username: credentials.username
                }
              }
            }
          ]
        }
      });
    } catch (err: unknown) {
      const { data, status } = (err as AxiosError<ApiError>).response;
      dispatch(
        status === 401
          ? errorDispatch.showError(String(status), errorMessage)
          : errorDispatch.showError(String(status), data.message)
      );
      return dispatch({
        type: AuthActionTypes.LOGIN_FAILURE
      });
    }
  };
}

export function logoutSuccessful(): AuthActions {
  return {
    type: AuthActionTypes.LOGOUT_SUCCESSFUL
  };
}

export function logout(): AuthActions {
  auth.logout();
  return {
    type: AuthActionTypes.LOGOUT,
    meta: {
      analytics: {
        // eslint-disable-next-line
        eventType: EventTypes.track
      }
    }
  };
}
