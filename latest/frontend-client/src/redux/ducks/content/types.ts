import { EventTypes } from 'redux-segment';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';

export enum ContentActionTypes {
  GET_REGISTRATION_POINTS = 'esmiley/content/GET_REGISTRATION_POINTS',
  UPDATE_REGISTRATION_POINT = 'esmiley/content/UPDATE_REGISTRATION_POINT',
  CREATE_REGISTRATION_POINT = 'esmiley/content/CREATE_REGISTRATION_POINT',
  DELETE_REGISTRATION_POINT = 'esmiley/content/DELETE_REGISTRATION_POINT',
  FETCH_REGISTRATION_POINTS = 'esmiley/content/FETCH_REGISTRATION_POINTS',
  FAIL_REGISTRATION_POINTS = 'esmiley/content/FAIL_REGISTRATION_POINTS',
  REPORT_SET_CONTENT = 'esmiley/content/report/SET_CONTENT'
}

type FetchRegistrationPointAction = {
  type: typeof ContentActionTypes.FETCH_REGISTRATION_POINTS;
};

type GetRegistrationPointAction = {
  type: typeof ContentActionTypes.GET_REGISTRATION_POINTS;
  payload: RegistrationPoint[];
};

type FailRegistrationPointAction = {
  type: typeof ContentActionTypes.FAIL_REGISTRATION_POINTS;
  meta?: {
    analytics: {
      eventType: EventTypes;
    };
  };
};

type UpdateRegistrationPointAction = {
  type: typeof ContentActionTypes.UPDATE_REGISTRATION_POINT;
  payload: RegistrationPoint;
};

type CreateRegistrationPointAction = {
  type: typeof ContentActionTypes.CREATE_REGISTRATION_POINT;
  payload: Omit<RegistrationPoint, 'id'>;
  meta: {
    analytics: {
      eventType: EventTypes;
    };
  };
};

type DeleteRegistrationPointAction = {
  type: typeof ContentActionTypes.DELETE_REGISTRATION_POINT;
  payload: string;
};

export type ContentActions =
  | FetchRegistrationPointAction
  | GetRegistrationPointAction
  | FailRegistrationPointAction
  | UpdateRegistrationPointAction
  | CreateRegistrationPointAction
  | DeleteRegistrationPointAction;
