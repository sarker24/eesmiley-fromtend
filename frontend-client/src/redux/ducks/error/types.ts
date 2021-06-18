export enum ErrorActionTypes {
  SHOW_ERROR = 'esmiley/error/SHOW_ERROR',
  CLOSE_ERROR = 'esmiley/error/CLOSE_ERROR'
}

export type ApiError = {
  errorCode: number;
  message: string;
  data?: unknown;
};

export interface ErrorState {
  code: string | number;
  message: string;
  active: boolean;
}

export type ErrorPayload = {
  code: number | string;
  message: string;
};

type ShowErrorAction = {
  type: typeof ErrorActionTypes.SHOW_ERROR;
  payload: ErrorPayload;
};

type CloseErrorAction = {
  type: typeof ErrorActionTypes.CLOSE_ERROR;
};

export type ErrorActions = ShowErrorAction | CloseErrorAction;
