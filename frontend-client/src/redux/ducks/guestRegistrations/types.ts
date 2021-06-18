import { GuestType } from 'redux/ducks/guestTypes/types';

export interface Editor {
  currentDate: string;
  idsByDate: {
    [index: string]: number[];
  };
}

export interface GuestRegistration {
  id: number;
  date: string;
  amount: number;
  guestType?: Partial<GuestType>;
  deletedAt?: string;
}

export interface GuestRegistrationState {
  byId: { [index: string]: GuestRegistration };
  // to do later: pagination (needs api changes to support it + sorting by name + hiding implementation of feathers)
  history: number[];
  editor: Editor;
  loading: boolean;
  lastRegistration?: GuestRegistration;
}

export interface CreateGuestRegistration {
  date: string;
  amount: number;
  guestTypeId?: number;
}

export interface GuestRegistrationQuery {
  date?: string;
  startDate?: string;
  endDate?: string;
}

export type GuestRegistrationEditorQuery = Required<Pick<GuestRegistrationQuery, 'date'>>;

export enum GuestRegistrationActionTypes {
  GET_GUEST_REGISTRATION_SUCCESS = 'esmiley/data/guest_registrations/GET_GUEST_REGISTRATION_SUCCESS',
  FIND_GUEST_REGISTRATION_SUCCESS = 'esmiley/data/guest_registrations/FIND_GUEST_REGISTRATION_SUCCESS',
  CREATE_GUEST_REGISTRATION_SUCCESS = 'esmiley/data/guest_registrations/CREATE_GUEST_REGISTRATION_SUCCESS',
  DELETE_GUEST_REGISTRATION_SUCCESS = 'esmiley/data/guest_registrations/DELETE_REGISTRATION_SUCCESS',
  GET_GUEST_REGISTRATION_EDITOR_SUCCESS = 'esmiley/data/guest_registrations/GET_GUEST_REGISTRATION_EDITOR_SUCCESS',
  SET_GUEST_REGISTRATION_EDITOR_DATE = 'esmiley/data/guest_registrations/SET_GUEST_REGISTRATION_EDITOR_DATE',
  GUEST_REGISTRATION_REQUEST = 'esmiley/data/guest_registrations/GUEST_REGISTRATION_REQUEST',
  RESET_GUEST_REGISTRATIONS = 'esmiley/data/guest_registrations/RESET_GUEST_REGISTRATIONS',
  RESET_LAST_REGISTRATION = 'esmiley/data/guest_registrations/RESET_LAST_REGISTRATION'
}

type SetEditorDateAction = {
  type: typeof GuestRegistrationActionTypes.SET_GUEST_REGISTRATION_EDITOR_DATE;
  payload: string;
};

type GetEditorGuestRegistrationsAction = {
  type: typeof GuestRegistrationActionTypes.GET_GUEST_REGISTRATION_EDITOR_SUCCESS;
  payload: GuestRegistration[];
};

type GuestRegistrationRequestAction = {
  type: typeof GuestRegistrationActionTypes.GUEST_REGISTRATION_REQUEST;
};

type CreateGuestRegistrationSuccessAction = {
  type: typeof GuestRegistrationActionTypes.CREATE_GUEST_REGISTRATION_SUCCESS;
  payload: GuestRegistration;
};

type GetGuestRegistrationSuccessAction = {
  type: typeof GuestRegistrationActionTypes.GET_GUEST_REGISTRATION_SUCCESS;
  payload: GuestRegistration;
};

type FindGuestRegistrationSuccessAction = {
  type: typeof GuestRegistrationActionTypes.FIND_GUEST_REGISTRATION_SUCCESS;
  payload: GuestRegistration[];
};

type ResetGuestRegistrationAction = {
  type: typeof GuestRegistrationActionTypes.RESET_GUEST_REGISTRATIONS;
};

type DeleteGuestRegistrationAction = {
  type: typeof GuestRegistrationActionTypes.DELETE_GUEST_REGISTRATION_SUCCESS;
  payload: GuestRegistration;
};

type ResetLastRegistrationAction = {
  type: typeof GuestRegistrationActionTypes.RESET_LAST_REGISTRATION;
};

export type GuestRegistrationActions =
  | SetEditorDateAction
  | GetEditorGuestRegistrationsAction
  | GuestRegistrationRequestAction
  | CreateGuestRegistrationSuccessAction
  | GetGuestRegistrationSuccessAction
  | FindGuestRegistrationSuccessAction
  | ResetGuestRegistrationAction
  | DeleteGuestRegistrationAction
  | ResetLastRegistrationAction;
