import { EventTypes } from 'redux-segment';

export enum AuthActionTypes {
  LOGIN_INIT = 'esmiley/auth/INIT',
  LOGIN_REQUEST = 'esmiley/auth/LOGIN_REQUEST',
  LOGIN_SUCCESSFUL = 'esmiley/auth/LOGIN_SUCCESSFUL',
  LOGOUT_SUCCESSFUL = 'esmiley/auth/LOGOUT_SUCCESSFUL',
  LOGIN_FAILURE = 'esmiley/auth/LOGIN_FAILURE',
  LOGIN_AUTHENTICATE = 'esmiley/auth/LOGIN_AUTHENTICATE',
  LOGOUT = 'esmiley/auth/LOGOUT'
}

export type Credentials = {
  dealNumber: string;
  username: string;
  password: string;
};

export interface TokenPayload {
  customerId: number;
  userId: number;
  exp: number;
  isAdmin?: boolean;
}

export interface AuthState {
  token: string;
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  // derived data from token, make selector
  tokenPayload?: TokenPayload;
}

type LoginInitAction = {
  type: typeof AuthActionTypes.LOGIN_INIT;
  payload: {
    token?: string;
    isLoggedIn: boolean;
  };
  meta?: {
    analytics: {
      eventType: EventTypes;
    };
  };
};

type LoginRequestAction = {
  type: typeof AuthActionTypes.LOGIN_REQUEST;
};

type LoginAuthenticateAction = {
  type: typeof AuthActionTypes.LOGIN_AUTHENTICATE;
  payload: {
    token: string;
  };
};

type LoginSuccessAction = {
  type: typeof AuthActionTypes.LOGIN_SUCCESSFUL;
  meta?: {
    analytics: {
      eventType: EventTypes;
      eventPayload?: {
        type: string;
        groupId: string;
        traits: {
          dealNumber: string;
          username: string;
        };
      };
    }[];
  };
};

type LoginFailure = {
  type: typeof AuthActionTypes.LOGIN_FAILURE;
};

type LogoutAction = {
  type: typeof AuthActionTypes.LOGOUT;
  meta?: {
    analytics: {
      eventType: EventTypes;
    };
  };
};

type LogoutSuccessAction = {
  type: typeof AuthActionTypes.LOGOUT_SUCCESSFUL;
};

export type AuthActions =
  | LoginInitAction
  | LoginRequestAction
  | LoginAuthenticateAction
  | LoginSuccessAction
  | LoginFailure
  | LogoutAction
  | LogoutSuccessAction;
