import { AxiosError } from 'axios';
import { ApiError } from 'redux/ducks/error';
import { EventTypes } from 'redux-segment';

export interface MediaState {
  list: Media[];
  soundList: Media[];
  loading: boolean;
  recentlyCreated: Media;
}

export interface Media {
  id: string;
  url: string;
  fileId: string;
  service: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  customerId: string;
  userId: string;
  name?: string;
}

export enum MediaActionTypes {
  FIND_REQUEST = 'esmiley/media/FIND_REQUEST',
  FIND_SUCCESS = 'esmiley/media/FIND_SUCCESS',
  FIND_FAILURE = 'esmiley/media/FIND_FAILURE',
  CREATE_REQUEST = 'esmiley/media/CREATE_REQUEST',
  CREATE_SUCCESS = 'esmiley/media/CREATE_SUCCESS',
  CREATE_FAILURE = 'esmiley/media/CREATE_FAILURE',
  FETCH_NOTIFICATION_SOUNDS_SUCCESS = 'esmiley/media/FETCH_NOTIFICATION_SOUNDS_SUCCESS',
  FETCH_NOTIFICATION_SOUNDS_FAILURE = 'esmiley/media/FETCH_NOTIFICATION_SOUNDS_FAILURE'
}

export type CreateMediaOptions = {
  name?: string;
  lastModifiedDate?: Date;
  file: File | Blob;
};

type CreateMediaRequestAction = {
  type: typeof MediaActionTypes.CREATE_REQUEST;
  payload: Blob | File;
};

type CreateMediaSuccessAction = {
  type: typeof MediaActionTypes.CREATE_SUCCESS;
  payload: Media;
};

type CreateMediaFailureAction = {
  type: typeof MediaActionTypes.CREATE_FAILURE;
  payload: AxiosError<ApiError>;
  meta?: {
    analytics: {
      eventType: EventTypes;
    };
  };
};

type FindMediaRequestAction = {
  type: typeof MediaActionTypes.FIND_REQUEST;
};

type FindMediaSuccessAction = {
  type: typeof MediaActionTypes.FIND_SUCCESS;
  payload: Media[];
};

type FindMediaFailureAction = {
  type: typeof MediaActionTypes.FIND_FAILURE;
  payload: AxiosError<ApiError>;
  meta?: {
    analytics: {
      eventType: EventTypes;
    };
  };
};

type FetchSoundsSuccessAction = {
  type: typeof MediaActionTypes.FETCH_NOTIFICATION_SOUNDS_SUCCESS;
  payload: Media[];
};

type FetchSoundsFailureAction = {
  type: typeof MediaActionTypes.FETCH_NOTIFICATION_SOUNDS_FAILURE;
  payload: AxiosError<ApiError>;
  meta?: {
    analytics: {
      eventType: EventTypes;
    };
  };
};

export type MediaActions =
  | CreateMediaRequestAction
  | CreateMediaSuccessAction
  | CreateMediaFailureAction
  | FindMediaRequestAction
  | FindMediaSuccessAction
  | FindMediaFailureAction
  | FetchSoundsSuccessAction
  | FetchSoundsFailureAction;
