export enum TipActionTypes {
  FETCH_REQUEST = 'esmiley/tips/FETCH_REQUEST',
  FETCH_SUCCESS = 'esmiley/tips/FETCH_SUCCESS',
  FETCH_FAILURE = 'esmiley/tips/FETCH_FAILURE'
}

interface LocalisedText {
  [locale: string]: string;
}

export interface ITip {
  title: LocalisedText;
  imageUrl: string;
  content: LocalisedText;
}

export interface ApiTip extends ITip {
  isActive: boolean;
  id: string; // todo number
}

export interface TipState {
  tips: ITip[];
  initializing: boolean;
  initial: boolean;
  loaded: boolean;
  failed: boolean;
}

type FetchTipsRequestAction = {
  type: typeof TipActionTypes.FETCH_REQUEST;
};

type FetchTipsSuccessAction = {
  type: typeof TipActionTypes.FETCH_SUCCESS;
  payload: ITip[];
};

type FetchTipsFailureAction = {
  type: typeof TipActionTypes.FETCH_FAILURE;
  payload: { errorCode: number; message: string };
};

export type TipActions = FetchTipsRequestAction | FetchTipsSuccessAction | FetchTipsFailureAction;
