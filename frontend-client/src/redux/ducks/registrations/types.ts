import { Registration } from 'redux/ducks/data/registrations';

export interface RegistrationsState {
  registrations: Registration[];
}

export enum RegistrationsActionTypes {
  GET_REGISTRATIONS = 'esmiley/registrations/GET_REGISTRATIONS',
  DELETE_REGISTRATION = 'esmiley/registrations/DELETE_REGISTRATION'
}

type GetRegistrationsAction = {
  type: typeof RegistrationsActionTypes.GET_REGISTRATIONS;
  payload: Registration[];
};

type DeleteRegistrationsAction = {
  type: typeof RegistrationsActionTypes.DELETE_REGISTRATION;
};

export type RegistrationsActions = GetRegistrationsAction | DeleteRegistrationsAction;
