import { EventTypes } from 'redux-segment';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints/types';

export interface ApiRegistration {
  amount: number; // 12000
  comment?: string;
  cost: string; // "1476"
  co2: string;
  createdAt: string; // "2017-10-12 07:14:57"
  updatedAt?: string;
  customerId: string; // "24767"
  date: string; // "2017-10-12"
  userId: string; // "71171"
  id: string; // "5311"
  registrationPoint: RegistrationPoint;
  unit: string;
  currency: string;
  manual: boolean;
  scale?: boolean;
}

export interface Registration {
  amount: number; // 12000
  comment?: string;
  cost: number; // "1476"
  co2: number;
  createdAt: string; // "2017-10-12 07:14:57"
  updatedAt?: string;
  customerId: number; // "24767"
  date: string; // "2017-10-12"
  userId: number; // "71171"
  id: number; // "5311"
  registrationPoint: RegistrationPoint;
  unit: string;
  currency: string;
  manual: boolean;
  scale?: boolean;
}

export interface DataRegistrationsState {
  data: Registration[];
  loading: boolean;
  failure: boolean;
}

export enum DataRegistrationActionTypes {
  FIND_REQUEST = 'data/registrations/FIND_REQUEST',
  FIND_SUCCESS = 'data/registrations/FIND_SUCCESS',
  FIND_FAILURE = 'data/registrations/FIND_FAILURE',
  REMOVE_REQUEST = 'data/registrations/REMOVE_REQUEST',
  REMOVE_SUCCESS = 'data/registrations/REMOVE_SUCCESS',
  REMOVE_FAILURE = 'data/registrations/REMOVE_FAILURE'
}

type RemoveRegistrationRequestAction = {
  type: typeof DataRegistrationActionTypes.REMOVE_REQUEST;
};

type RemoveRegistrationSuccessAction = {
  type: typeof DataRegistrationActionTypes.REMOVE_SUCCESS;
  payload: string;
};

type RemoveRegistrationFailure = {
  type: typeof DataRegistrationActionTypes.REMOVE_FAILURE;
  meta?: {
    analytics: {
      eventType: EventTypes;
    };
  };
};

type FindRegistrationRequestAction = {
  type: typeof DataRegistrationActionTypes.FIND_REQUEST;
};

type FindRegistrationSuccessAction = {
  type: typeof DataRegistrationActionTypes.FIND_SUCCESS;
  payload: Registration[];
};

type FindRegistrationFailureAction = {
  type: typeof DataRegistrationActionTypes.FIND_FAILURE;
  meta?: {
    analytics: {
      eventType: EventTypes;
    };
  };
};

export type DataRegistrationActions =
  | RemoveRegistrationRequestAction
  | RemoveRegistrationSuccessAction
  | RemoveRegistrationFailure
  | FindRegistrationRequestAction
  | FindRegistrationSuccessAction
  | FindRegistrationFailureAction;
