import { Labels } from 'utils/labels';
import { EventTypes } from 'redux-segment';

export interface RegistrationPoint {
  id: string;
  parentId?: string;
  path?: string;
  name: string;
  cost?: number;
  image?: string | null;
  userId?: string | null;
  amount: number;
  costPerkg: number;
  co2Perkg: number;
  customerId?: string;
  active: boolean;
  deletedAt?: string | null;
  label: Labels;
  children?: RegistrationPoint[];
}

export interface DataRegistrationPointState {
  failed: boolean;
  initial: boolean;
  initializing: boolean;
  roots: RegistrationPoint[];
  allNodes: RegistrationPoint[];
  registrationPointsMap: Map<string, RegistrationPoint>;
  treeInitializing: boolean;
  tree: RegistrationPoint[];
}

export enum DataRegistrationPointsActionTypes {
  FIND_REQUEST = 'data/registrationPoints/FIND_REQUEST',
  FIND_SUCCESS = 'data/registrationPoints/FIND_SUCCESS',
  FIND_FAILURE = 'data/registrationPoints/FIND_FAILURE',
  FIND_TREE_REQUEST = 'data/registrationPoints/FIND_TREE_REQUEST',
  FIND_TREE_SUCCESS = 'data/registrationPoints/FIND_TREE_SUCCESS',
  FIND_TREE_FAILURE = 'data/registrationPoints/FIND_TREE_FAILURE',
  UPDATE = 'data/registrationPoints/UPDATE'
}

type FindRegistrationPointRequestAction = {
  type: typeof DataRegistrationPointsActionTypes.FIND_REQUEST;
};

// todo selectors instead of derivated state
type FindRegistrationPointSuccessAction = {
  type: typeof DataRegistrationPointsActionTypes.FIND_SUCCESS;
  payload: {
    allNodes: RegistrationPoint[];
    roots: RegistrationPoint[];
    registrationPointsMap: Map<string, RegistrationPoint>;
  };
};

type FindRegistrationPointFailureAction = {
  type: typeof DataRegistrationPointsActionTypes.FIND_FAILURE;
  meta?: {
    analytics: {
      eventType: EventTypes;
    };
  };
};

type FindTreeRequestAction = {
  type: typeof DataRegistrationPointsActionTypes.FIND_TREE_REQUEST;
};

// todo selectors instead of derivated state
type FindTreeSuccessAction = {
  type: typeof DataRegistrationPointsActionTypes.FIND_TREE_SUCCESS;
  payload: {
    tree: RegistrationPoint[];
    registrationPointsMap: Map<string, RegistrationPoint>;
  };
};

type FindTreeFailureAction = {
  type: typeof DataRegistrationPointsActionTypes.FIND_TREE_FAILURE;
  meta?: {
    analytics: {
      eventType: EventTypes;
    };
  };
};

type UpdateRegistrationPointAction = {
  type: typeof DataRegistrationPointsActionTypes.UPDATE;
  payload: RegistrationPoint[];
};

export type DataRegistrationPointsActions =
  | FindRegistrationPointRequestAction
  | FindRegistrationPointSuccessAction
  | FindRegistrationPointFailureAction
  | FindTreeRequestAction
  | FindTreeSuccessAction
  | FindTreeFailureAction
  | UpdateRegistrationPointAction;
