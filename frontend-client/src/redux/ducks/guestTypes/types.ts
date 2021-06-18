import { GuestTypeActionTypes } from 'redux/ducks/guestTypes/index';

export interface GuestType {
  id: number;
  name: string;
  image?: string;
  active: boolean;
  deletedAt?: string;
}

export interface CreateGuestType {
  name: string;
  image?: string;
}

export interface GuestTypeQuery {
  name?: string;
  active?: boolean;
}

type GetAllGuestTypesSuccessAction = {
  type: typeof GuestTypeActionTypes.FIND_GUEST_TYPE_SUCCESS;
  payload: GuestType[];
};

type GetGuestTypeSuccessAction = {
  type: typeof GuestTypeActionTypes.GET_GUEST_TYPE_SUCCESS;
  payload: GuestType;
};

type DeleteGuestTypeSuccessAction = {
  type: typeof GuestTypeActionTypes.REMOVE_GUEST_TYPE_SUCCESS;
  payload: GuestType;
};

type UpdateGuestTypeSuccessAction = {
  type: typeof GuestTypeActionTypes.UPDATE_GUEST_TYPE_SUCCESS;
  payload: GuestType;
};

type CreateGuestTypeSuccessAction = {
  type: typeof GuestTypeActionTypes.CREATE_GUEST_TYPE_SUCCESS;
  payload: GuestType;
};

type GuestTypeRequestAction = {
  type: typeof GuestTypeActionTypes.GUEST_TYPE_REQUEST;
};

export type GuestTypeActions =
  | GetAllGuestTypesSuccessAction
  | GetGuestTypeSuccessAction
  | DeleteGuestTypeSuccessAction
  | UpdateGuestTypeSuccessAction
  | CreateGuestTypeSuccessAction
  | GuestTypeRequestAction;

export interface GuestTypeState {
  guestTypes: GuestType[];
  loading: boolean;
}
