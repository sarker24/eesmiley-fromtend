import { RegistrationPoint } from 'redux/ducks/data/registrationPoints/types';
import { Registration } from 'redux/ducks/data/registrations';

export type StepShape = 0 | 1 | 2;

export type ConnectionType = 'USB' | 'BLE';
export type ScaleStatus = {
  isConnecting?: boolean;
  isConnected: boolean;
  type?: ConnectionType;
};

export interface RegistrationState {
  weight: number;
  date: Date;
  comment?: string;
  step: StepShape;
  loading: boolean;
  scaleStatus: ScaleStatus;
  pageNumber: number;
  currentNode: RegistrationPoint;
  nodesHistory: { [name: string]: RegistrationPoint[] }[];
  dateUpdatedAt: number;
  lastRegistration?: Registration & {
    pointPath: string[];
    pointName: string;
  };
}

export enum RegistrationActionTypes {
  SET_WEIGHT = 'esmiley/registration/SET_WEIGHT',
  SET_DATE = 'esmiley/registration/SET_DATE',
  SET_SCALE_STATUS = 'esmiley/registration/SET_SCALE_STATUS',
  REGISTER_SUCCESS = 'esmiley/registration/REGISTER_SUCCESS',
  REGISTER_FAILURE = 'esmiley/registration/REGISTER_FAILURE',
  REGISTER_REQUEST = 'esmiley/registration/REGISTER_REQUEST',
  UPDATE_STEP = 'esmiley/registration/UPDATE_STEP',
  UPDATE_PAGINATION = 'esmiley/registration/UPDATE_PAGINATION',
  UPDATE_REGISTRATION_POINTS = 'esmiley/registration/UPDATE_REGISTRATION_POINTS',
  UPDATE_STEPPER = 'esmiley/registration/UPDATE_STEPPER',
  SET_COMMENT = 'esmiley/registration/SET_COMMENT',
  RESET_LAST_REGISTRATION = 'esmiley/registration/RESET_LAST_REGISTRATION'
}

type RegisterSuccessAction = {
  type: typeof RegistrationActionTypes.REGISTER_SUCCESS;
  payload: Registration;
};

type UpdateStepAction = {
  type: typeof RegistrationActionTypes.UPDATE_STEP;
  payload: StepShape;
};

type UpdatePaginationAction = {
  type: typeof RegistrationActionTypes.UPDATE_PAGINATION;
  payload: number;
};

type SetDateAction = {
  type: typeof RegistrationActionTypes.SET_DATE;
  payload: Date;
};

type SetWeightAction = {
  type: typeof RegistrationActionTypes.SET_WEIGHT;
  payload: number;
};

type SetScaleStatusAction = {
  type: typeof RegistrationActionTypes.SET_SCALE_STATUS;
  payload: ScaleStatus;
};

type RegisterRequestAction = {
  type: typeof RegistrationActionTypes.REGISTER_REQUEST;
};

type RegisterRequestFailureAction = {
  type: typeof RegistrationActionTypes.REGISTER_FAILURE;
};

type UpdateRegistrationPointsAction = {
  type: typeof RegistrationActionTypes.UPDATE_REGISTRATION_POINTS;
  payload: {
    nodesHistory: { [name: string]: RegistrationPoint[] }[];
    registrationPoint: RegistrationPoint;
  };
};

type UpdateStepperAction = {
  type: typeof RegistrationActionTypes.UPDATE_STEPPER;
  payload: { [name: string]: RegistrationPoint[] }[];
};

type SetCommentAction = {
  type: typeof RegistrationActionTypes.SET_COMMENT;
  payload: string;
};

type ResetLatRegistrationAction = {
  type: typeof RegistrationActionTypes.RESET_LAST_REGISTRATION;
};

export type RegistrationActions =
  | RegisterSuccessAction
  | UpdateStepAction
  | UpdatePaginationAction
  | SetDateAction
  | SetScaleStatusAction
  | RegisterRequestAction
  | RegisterRequestFailureAction
  | UpdateRegistrationPointsAction
  | UpdateStepperAction
  | SetWeightAction
  | SetCommentAction
  | ResetLatRegistrationAction;
