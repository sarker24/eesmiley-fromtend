import * as errorDispatch from 'redux/ducks/error';
import { DataStorage, DataTransfer } from 'frontend-core';
import { AxiosResponse, AxiosError } from 'axios';
import { EventTypes } from 'redux-segment';
import { ContentActions, ContentActionTypes } from './types';
import { ApiError, ErrorActions } from 'redux/ducks/error';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { ThunkResult } from 'redux/types';

export * from './types';

const transfer = new DataTransfer({ retryConfig: { retries: 3 } });
const store = new DataStorage();

export interface ContentState {
  registrationPoints: RegistrationPoint[];
  registrationPointsFailed: boolean;
  isRegistrationPointsFetched: boolean;
}

export const initialState: ContentState = {
  registrationPoints: [],
  registrationPointsFailed: false,
  isRegistrationPointsFetched: false
};

interface IPatchObject {
  op: string;
  path: string;
  value: string | any | any[] | number;
}

export default function reducer(
  state: ContentState = initialState,
  action: ContentActions
): ContentState {
  switch (action.type) {
    case ContentActionTypes.GET_REGISTRATION_POINTS:
      return {
        ...state,
        registrationPoints: action.payload,
        isRegistrationPointsFetched: true,
        registrationPointsFailed: false
      };

    case ContentActionTypes.UPDATE_REGISTRATION_POINT: {
      const nextRegistrationPoints = state.registrationPoints.slice();
      const updatedRegistrationPointIndex = nextRegistrationPoints.findIndex(
        (x) => x.id === action.payload.id
      );
      nextRegistrationPoints[updatedRegistrationPointIndex] = action.payload;

      return {
        ...state,
        registrationPoints: nextRegistrationPoints
      };
    }
    case ContentActionTypes.FETCH_REGISTRATION_POINTS:
      return {
        ...state,
        registrationPointsFailed: false,
        isRegistrationPointsFetched: false
      };

    case ContentActionTypes.FAIL_REGISTRATION_POINTS:
      return {
        ...state,
        registrationPointsFailed: true
      };

    default:
      return Object.assign({}, initialState, state);
  }
}

export function getRegistrationPoints(): ThunkResult<
  Promise<ContentActions | ErrorActions>,
  ContentActions
> {
  return async (dispatch) => {
    dispatch({
      type: ContentActionTypes.FETCH_REGISTRATION_POINTS
    });
    // todo: authService.getToken
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = (await transfer.get(
        `/foodwaste/registration-points?$sort[id]=1`
      )) as AxiosResponse<RegistrationPoint[]>;
      return dispatch({
        type: ContentActionTypes.GET_REGISTRATION_POINTS,
        payload: response.data
      });
    } catch (err: unknown) {
      const { response } = err as AxiosError<ApiError>;
      if (!response || !response.status) {
        return dispatch({
          type: ContentActionTypes.FAIL_REGISTRATION_POINTS,
          meta: {
            analytics: {
              // eslint-disable-next-line
              eventType: EventTypes.track
            }
          }
        });
      }
      const { errorCode, message } = response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

export function updateRegistrationPoint(
  id: number,
  patchObject: IPatchObject[]
): ThunkResult<Promise<ContentActions | ErrorActions>, ContentActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const patch = patchObject.map((obj: IPatchObject) => {
      if (obj.value && typeof obj.value === 'object') {
        obj.value = sanitizeItemForSubmission(obj.value);
      }
      return obj;
    });

    try {
      const response = (await transfer.patch(
        `/foodwaste/registration-points/${id}`,
        patch
      )) as AxiosResponse<RegistrationPoint>;
      return dispatch({
        type: ContentActionTypes.UPDATE_REGISTRATION_POINT,
        payload: response.data
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

function sanitizeItemForSubmission(item: { id?: string }) {
  if (item.hasOwnProperty('id') && isNaN(parseInt(item.id))) {
    delete item.id;
  }

  return item;
}

export function createRegistrationPoint(
  registrationPoint: Omit<RegistrationPoint, 'id'>
): ThunkResult<Promise<ContentActions | ErrorActions>, ContentActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = (await transfer.post(
        `/foodwaste/registration-points`,
        registrationPoint
      )) as AxiosResponse<RegistrationPoint>;
      return dispatch({
        type: ContentActionTypes.CREATE_REGISTRATION_POINT,
        payload: response.data,
        meta: {
          analytics: {
            // eslint-disable-next-line
            eventType: EventTypes.track
          }
        }
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

export function deleteRegistrationPoint(
  id: number
): ThunkResult<Promise<ContentActions | ErrorActions>, ContentActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = (await transfer.delete(
        `/foodwaste/registration-points/${id}`
      )) as AxiosResponse<RegistrationPoint>;
      return dispatch({
        type: ContentActionTypes.DELETE_REGISTRATION_POINT,
        payload: response.data.name
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}
