import { compare } from 'fast-json-patch';
import {
  CreateGuestType,
  GuestTypeQuery,
  GuestType,
  GuestTypeState,
  GuestTypeActions
} from 'redux/ducks/guestTypes/types';
import { ApiError, ErrorActions, ErrorActionTypes } from 'redux/ducks/error';
import { AxiosError, AxiosResponse } from 'axios';
import { DataStorage, DataTransfer } from 'frontend-core';
import { ThunkResult } from 'redux/types';

export * from './types';

const transfer = new DataTransfer({ retryConfig: { retries: 3 } });
const store = new DataStorage();

const guestTypeEndpoints = {
  collection: '/foodwaste/guest-types',
  resource: (id: number) => `/foodwaste/guest-types/${id}`
};

const initialState: GuestTypeState = {
  guestTypes: [],
  loading: false
};

export enum GuestTypeActionTypes {
  GET_GUEST_TYPE_SUCCESS = 'esmiley/data/guesttypes/GET_GUEST_TYPE_SUCCESS',
  FIND_GUEST_TYPE_SUCCESS = 'esmiley/data/guesttypes/FIND_GUEST_TYPE_SUCCESS',
  UPDATE_GUEST_TYPE_SUCCESS = 'esmiley/data/guesttypes/UPDATE_GUEST_TYPE_SUCCESS',
  CREATE_GUEST_TYPE_SUCCESS = 'esmiley/data/guesttypes/CREATE_GUEST_TYPE_SUCCESS',
  REMOVE_GUEST_TYPE_SUCCESS = 'esmiley/data/guesttypes/REMOVE_GUEST_TYPE_SUCCESS',
  GUEST_TYPE_REQUEST = 'esmiley/data/guesttypes/GUEST_TYPE_REQUEST'
}

function reducer(state: GuestTypeState = initialState, action: GuestTypeActions): GuestTypeState {
  switch (action.type) {
    case GuestTypeActionTypes.GUEST_TYPE_REQUEST: {
      return { ...state, loading: true };
    }
    case GuestTypeActionTypes.FIND_GUEST_TYPE_SUCCESS: {
      const guestTypes: GuestType[] = action.payload;
      return { ...state, guestTypes, loading: false };
    }
    case GuestTypeActionTypes.GET_GUEST_TYPE_SUCCESS: {
      const guestType: GuestType = action.payload;
      const guestTypes = [...state.guestTypes, guestType];
      return { ...state, guestTypes, loading: false };
    }
    case GuestTypeActionTypes.UPDATE_GUEST_TYPE_SUCCESS: {
      const guestType: GuestType = action.payload;
      const guestTypes = state.guestTypes.map((oldGuestType) =>
        oldGuestType.id == guestType.id ? guestType : oldGuestType
      );
      return { ...state, guestTypes, loading: false };
    }
    case GuestTypeActionTypes.CREATE_GUEST_TYPE_SUCCESS: {
      const guestType: GuestType = action.payload;
      const guestTypes = [...state.guestTypes, guestType];
      return { ...state, guestTypes, loading: false };
    }
    case GuestTypeActionTypes.REMOVE_GUEST_TYPE_SUCCESS: {
      const { id } = action.payload;
      const guestTypes = state.guestTypes.filter((guestType) => guestType.id !== id);
      return { ...state, guestTypes, loading: false };
    }
    default: {
      return state;
    }
  }
}

export function create(
  guestType: CreateGuestType
): ThunkResult<Promise<GuestTypeActions | ErrorActions>, GuestTypeActions | ErrorActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    dispatch({
      type: GuestTypeActionTypes.GUEST_TYPE_REQUEST
    });

    try {
      const response = (await transfer.post(
        guestTypeEndpoints.collection,
        guestType
      )) as AxiosResponse<GuestType>;
      return dispatch({
        type: GuestTypeActionTypes.CREATE_GUEST_TYPE_SUCCESS,
        payload: response.data
      });
    } catch (error: unknown) {
      const { errorCode: code, message } = (error as AxiosError<ApiError>).response.data;
      return dispatch({
        type: ErrorActionTypes.SHOW_ERROR,
        payload: { code, message }
      });
    }
  };
}

export function update(
  guestType: GuestType
): ThunkResult<Promise<GuestTypeActions | ErrorActions>, GuestTypeActions | ErrorActions> {
  return async (dispatch, getState) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const original = getState().guestTypes.guestTypes.find(({ id }) => id === guestType.id);
    const update = { ...original, ...guestType };
    const patchOps = compare(original, update);

    dispatch({
      type: GuestTypeActionTypes.GUEST_TYPE_REQUEST
    });

    try {
      const response = (await transfer.patch(
        guestTypeEndpoints.resource(guestType.id),
        patchOps
      )) as AxiosResponse<GuestType>;
      return dispatch({
        type: GuestTypeActionTypes.UPDATE_GUEST_TYPE_SUCCESS,
        payload: response.data
      });
    } catch (error: unknown) {
      const { errorCode: code, message } = (error as AxiosError<ApiError>).response.data;
      return dispatch({
        type: ErrorActionTypes.SHOW_ERROR,
        payload: { code, message }
      });
    }
  };
}

export function deleteById(
  id: number
): ThunkResult<Promise<GuestTypeActions | ErrorActions>, GuestTypeActions | ErrorActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    dispatch({
      type: GuestTypeActionTypes.GUEST_TYPE_REQUEST
    });

    try {
      const response = (await transfer.delete(
        guestTypeEndpoints.resource(id)
      )) as AxiosResponse<GuestType>;
      return dispatch({
        type: GuestTypeActionTypes.REMOVE_GUEST_TYPE_SUCCESS,
        payload: response.data
      });
    } catch (error: unknown) {
      const { errorCode: code, message } = (error as AxiosError<ApiError>).response.data;
      return dispatch({
        type: ErrorActionTypes.SHOW_ERROR,
        payload: { code, message }
      });
    }
  };
}

export function getById(
  id: number
): ThunkResult<Promise<GuestTypeActions | ErrorActions>, GuestTypeActions | ErrorActions> {
  return async (dispatch) => {
    dispatch({
      type: GuestTypeActionTypes.GUEST_TYPE_REQUEST
    });

    try {
      const response = (await transfer.get(
        guestTypeEndpoints.resource(id),
        {},
        true
      )) as AxiosResponse<GuestType>;
      return dispatch({
        type: GuestTypeActionTypes.GET_GUEST_TYPE_SUCCESS,
        payload: response.data
      });
    } catch (error: unknown) {
      const { errorCode: code, message } = (error as AxiosError<ApiError>).response.data;
      return dispatch({
        type: ErrorActionTypes.SHOW_ERROR,
        payload: { code, message }
      });
    }
  };
}

export function getAll(
  query: GuestTypeQuery = null
): ThunkResult<Promise<GuestTypeActions | ErrorActions>, GuestTypeActions | ErrorActions> {
  return async (dispatch) => {
    dispatch({
      type: GuestTypeActionTypes.GUEST_TYPE_REQUEST
    });
    try {
      const response = (await transfer.get(
        guestTypeEndpoints.collection,
        {
          params: query
        },
        true
      )) as AxiosResponse<GuestType[]>;

      return dispatch({
        type: GuestTypeActionTypes.FIND_GUEST_TYPE_SUCCESS,
        payload: response.data
      });
    } catch (error: unknown) {
      const { errorCode: code, message } = (error as AxiosError<ApiError>).response.data;
      return dispatch({
        type: ErrorActionTypes.SHOW_ERROR,
        payload: { code, message }
      });
    }
  };
}

export default reducer;
