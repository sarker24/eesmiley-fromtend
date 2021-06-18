import { ApiError, ErrorActions, ErrorActionTypes } from 'redux/ducks/error';
import {
  CreateGuestRegistration,
  GuestRegistration,
  GuestRegistrationActions,
  GuestRegistrationActionTypes,
  GuestRegistrationEditorQuery,
  GuestRegistrationQuery,
  GuestRegistrationState
} from 'redux/ducks/guestRegistrations/types';
import * as registrationActions from 'redux/ducks/registration';
import { API_DATE_FORMAT } from 'utils/datetime';
import moment from 'moment';
import { groupById } from 'utils/normalise';
import { AxiosError, AxiosResponse } from 'axios';
import { DataStorage, DataTransfer } from 'frontend-core';
import { ThunkResult } from 'redux/types';
import { AnyAction } from 'redux';

export * from './types';
export * from './selectors';

const transfer = new DataTransfer({ retryConfig: { retries: 3 } });
const store = new DataStorage();

const guestRegistrationEndpoints = {
  collection: '/foodwaste/guest-registrations',
  resource: (id: number) => `/foodwaste/guest-registrations/${id}`
};

function isEqualByDateAndType(a: GuestRegistration, b: GuestRegistration): boolean {
  const { guestType: guestTypeA = {}, date: dateA } = a;
  const { guestType: guestTypeB = {}, date: dateB } = b;

  return !(guestTypeA.id !== guestTypeB.id || dateA !== dateB);
}

function deleteGuestRegistration(
  state: GuestRegistrationState,
  guestRegistration: GuestRegistration
): GuestRegistrationState {
  const { byId, editor, history } = state;
  const { [guestRegistration.id]: toBeDeleted, ...nextById } = byId;
  const { idsByDate } = editor;

  const nextIdsByDate = idsByDate[guestRegistration.date]
    ? {
        ...idsByDate,
        [guestRegistration.date]: idsByDate[guestRegistration.date].filter(
          (id) => id !== toBeDeleted.id
        )
      }
    : { ...idsByDate };
  const nextHistory = history.filter((id) => id !== toBeDeleted.id);

  return {
    ...state,
    byId: nextById,
    editor: { ...editor, idsByDate: nextIdsByDate },
    history: nextHistory
  };
}

function addGuestRegistration(
  state: GuestRegistrationState,
  guestRegistration: GuestRegistration
): GuestRegistrationState {
  const { editor, history } = state;
  const { idsByDate } = editor;
  const createdById = groupById([guestRegistration]);

  const nextIdsByDate = {
    ...idsByDate,
    [guestRegistration.date]: [...(idsByDate[guestRegistration.date] || []), guestRegistration.id]
  };
  const nextHistory = [...history, guestRegistration.id];

  return {
    ...state,
    byId: { ...state.byId, ...createdById },
    editor: { ...editor, idsByDate: nextIdsByDate },
    history: nextHistory
  };
}

export const initialState: GuestRegistrationState = {
  loading: false,
  byId: {},
  history: [],
  editor: {
    currentDate: moment().format(API_DATE_FORMAT),
    idsByDate: {}
  }
};

export default function reducer(
  state: GuestRegistrationState = initialState,
  action: GuestRegistrationActions
): GuestRegistrationState {
  switch (action.type) {
    case GuestRegistrationActionTypes.GUEST_REGISTRATION_REQUEST: {
      return { ...state, loading: true };
    }

    case GuestRegistrationActionTypes.FIND_GUEST_REGISTRATION_SUCCESS: {
      const guestRegistrations: GuestRegistration[] = action.payload;
      const byId = { ...state.byId, ...groupById<GuestRegistration>(guestRegistrations) };
      const history = guestRegistrations.map((registration) => registration.id);
      return { ...state, byId, history, loading: false };
    }

    case GuestRegistrationActionTypes.GET_GUEST_REGISTRATION_SUCCESS: {
      return { ...state, byId: { ...state.byId, ...groupById([action.payload]) }, loading: false };
    }

    case GuestRegistrationActionTypes.CREATE_GUEST_REGISTRATION_SUCCESS: {
      const guestRegistration: GuestRegistration = action.payload;
      // biz logic: if registration existed on guest type and date, the old one is soft deleted; so we need
      // to check that condition here in client as well
      const duplicateRecord = Object.values(state.byId).find((item) =>
        isEqualByDateAndType(item, guestRegistration)
      );
      const nextState = duplicateRecord
        ? addGuestRegistration(deleteGuestRegistration(state, duplicateRecord), guestRegistration)
        : addGuestRegistration(state, guestRegistration);

      return {
        ...nextState,
        lastRegistration: action.payload,
        loading: false
      };
    }

    case GuestRegistrationActionTypes.DELETE_GUEST_REGISTRATION_SUCCESS: {
      return { ...deleteGuestRegistration(state, action.payload), loading: false };
    }

    case GuestRegistrationActionTypes.SET_GUEST_REGISTRATION_EDITOR_DATE: {
      return { ...state, editor: { ...state.editor, currentDate: action.payload } };
    }

    case GuestRegistrationActionTypes.GET_GUEST_REGISTRATION_EDITOR_SUCCESS: {
      const guestRegistrations: GuestRegistration[] = action.payload;
      const ids: number[] = guestRegistrations.map((item) => item.id);
      const idsByDate = { ...state.editor.idsByDate, [state.editor.currentDate]: ids };
      const groupedById = groupById<GuestRegistration>(guestRegistrations);
      const byId = { ...state.byId, ...groupedById };
      return { ...state, byId, editor: { ...state.editor, idsByDate }, loading: false };
    }

    case GuestRegistrationActionTypes.RESET_GUEST_REGISTRATIONS: {
      return initialState;
    }
    case GuestRegistrationActionTypes.RESET_LAST_REGISTRATION: {
      return { ...state, lastRegistration: undefined };
    }
    default: {
      return state;
    }
  }
}

function createWithFlow(
  guestRegistration: CreateGuestRegistration
): ThunkResult<Promise<AnyAction>, AnyAction> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    dispatch({ type: GuestRegistrationActionTypes.GUEST_REGISTRATION_REQUEST });

    try {
      const response = (await transfer.post(
        guestRegistrationEndpoints.collection,
        guestRegistration
      )) as AxiosResponse<GuestRegistration>;

      dispatch({
        type: GuestRegistrationActionTypes.CREATE_GUEST_REGISTRATION_SUCCESS,
        payload: response.data
      });
      return dispatch(registrationActions.updateStep(0));
    } catch (error: unknown) {
      const { errorCode: code, message } = (error as AxiosError<ApiError>).response.data;
      return dispatch({
        type: ErrorActionTypes.SHOW_ERROR,
        payload: { code, message }
      });
    }
  };
}

function getEditorRegistrations(
  query: GuestRegistrationEditorQuery
): ThunkResult<
  Promise<GuestRegistrationActions | ErrorActions>,
  GuestRegistrationActions | ErrorActions
> {
  return async (dispatch) => {
    dispatch({
      type: GuestRegistrationActionTypes.SET_GUEST_REGISTRATION_EDITOR_DATE,
      payload: query.date
    });
    dispatch({ type: GuestRegistrationActionTypes.GUEST_REGISTRATION_REQUEST });

    try {
      const response = (await transfer.get(
        guestRegistrationEndpoints.collection,
        { params: query },
        true
      )) as AxiosResponse<GuestRegistration[]>;
      return dispatch({
        type: GuestRegistrationActionTypes.GET_GUEST_REGISTRATION_EDITOR_SUCCESS,
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

function getById(
  id: number
): ThunkResult<
  Promise<GuestRegistrationActions | ErrorActions>,
  GuestRegistrationActions | ErrorActions
> {
  return async (dispatch) => {
    dispatch({ type: GuestRegistrationActionTypes.GUEST_REGISTRATION_REQUEST });
    try {
      const response = (await transfer.get(
        guestRegistrationEndpoints.resource(id),
        {},
        true
      )) as AxiosResponse<GuestRegistration>;
      return dispatch({
        type: GuestRegistrationActionTypes.GET_GUEST_REGISTRATION_SUCCESS,
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

function getAll(
  query: GuestRegistrationQuery
): ThunkResult<
  Promise<GuestRegistrationActions | ErrorActions>,
  GuestRegistrationActions | ErrorActions
> {
  return async (dispatch) => {
    dispatch({ type: GuestRegistrationActionTypes.GUEST_REGISTRATION_REQUEST });
    try {
      const response = (await transfer.get(
        guestRegistrationEndpoints.collection,
        { params: query },
        true
      )) as AxiosResponse<GuestRegistration[]>;
      return dispatch({
        type: GuestRegistrationActionTypes.FIND_GUEST_REGISTRATION_SUCCESS,
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

function deleteById(
  id: number
): ThunkResult<
  Promise<GuestRegistrationActions | ErrorActions>,
  GuestRegistrationActions | ErrorActions
> {
  return async (dispatch) => {
    dispatch({ type: GuestRegistrationActionTypes.GUEST_REGISTRATION_REQUEST });
    try {
      const token = store.getData('token') as string;
      // eslint-disable-next-line
      transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = (await transfer.delete(
        guestRegistrationEndpoints.resource(id)
      )) as AxiosResponse<GuestRegistration>;
      return dispatch({
        type: GuestRegistrationActionTypes.DELETE_GUEST_REGISTRATION_SUCCESS,
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

function reset(): GuestRegistrationActions {
  return { type: GuestRegistrationActionTypes.RESET_GUEST_REGISTRATIONS };
}

function resetLastRegistration(): GuestRegistrationActions {
  return { type: GuestRegistrationActionTypes.RESET_LAST_REGISTRATION };
}

export {
  createWithFlow,
  getById,
  getAll,
  deleteById,
  getEditorRegistrations,
  reset,
  resetLastRegistration
};
