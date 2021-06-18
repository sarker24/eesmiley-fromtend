import { EventTypes } from 'redux-segment';
import { AxiosResponse } from 'axios';
import { DataTransfer, DataStorage } from 'frontend-core';
import { createMap } from 'utils/helpers';
import {
  DataRegistrationPointsActions,
  DataRegistrationPointState,
  DataRegistrationPointsActionTypes,
  RegistrationPoint
} from './types';
import { ThunkResult } from 'redux/types';

export * from './types';
export * from './selectors';

const transfer = new DataTransfer({ retryConfig: { retries: 3 } });
const store = new DataStorage();

export const initialState: DataRegistrationPointState = {
  allNodes: [],
  failed: false,
  initial: true,
  initializing: false,
  treeInitializing: false,
  roots: [],
  registrationPointsMap: new Map<string, RegistrationPoint>(),
  tree: []
};

export default function reducer(
  state: DataRegistrationPointState = initialState,
  action: DataRegistrationPointsActions
): DataRegistrationPointState {
  switch (action.type) {
    case DataRegistrationPointsActionTypes.FIND_REQUEST: {
      return { ...state, initializing: true };
    }
    case DataRegistrationPointsActionTypes.FIND_FAILURE: {
      return { ...state, initializing: false, failed: true };
    }
    case DataRegistrationPointsActionTypes.FIND_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        initial: false,
        initializing: false
      };
    }
    case DataRegistrationPointsActionTypes.FIND_TREE_REQUEST: {
      return { ...state, treeInitializing: true };
    }
    case DataRegistrationPointsActionTypes.FIND_TREE_SUCCESS: {
      return { ...state, ...action.payload, treeInitializing: false };
    }
    case DataRegistrationPointsActionTypes.FIND_TREE_FAILURE: {
      return { ...state, treeInitializing: false, failed: true };
    }
    case DataRegistrationPointsActionTypes.UPDATE: {
      return { ...state, roots: action.payload };
    }
    default: {
      return state;
    }
  }
}

// includeSoftDeleted: boolean
// accounts: string;
// [queryParam: string]: any;
export type GetRegistrationPointsOptions = {
  includeSoftDeleted?: boolean;
  accounts?: string;
  [queryParam: string]: any;
};

export const getRegistrationPoints = (
  params: GetRegistrationPointsOptions
): ThunkResult<Promise<DataRegistrationPointsActions>, DataRegistrationPointsActions> => async (
  dispatch
) => {
  dispatch({ type: DataRegistrationPointsActionTypes.FIND_REQUEST });
  const token = store.getData('token') as string;
  // eslint-disable-next-line
  transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  try {
    const response = (await transfer.get(
      '/foodwaste/registration-points',
      { params },
      true
    )) as AxiosResponse<RegistrationPoint[]>;

    const registrationPointsMap = createMap(response.data);
    return dispatch({
      type: DataRegistrationPointsActionTypes.FIND_SUCCESS,
      payload: {
        allNodes: response.data,
        roots: response.data.filter((item: RegistrationPoint) => !item.parentId),
        registrationPointsMap
      }
    });
  } catch (error: unknown) {
    return dispatch({
      type: DataRegistrationPointsActionTypes.FIND_FAILURE,
      meta: {
        analytics: {
          // eslint-disable-next-line
          eventType: EventTypes.track
        }
      }
    });
  }
};

export function findTree(
  params: GetRegistrationPointsOptions = {}
): ThunkResult<Promise<DataRegistrationPointsActions>, DataRegistrationPointsActions> {
  return async (dispatch) => {
    dispatch({ type: DataRegistrationPointsActionTypes.FIND_TREE_REQUEST });

    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = (await transfer.get(
        '/foodwaste/registration-point-trees',
        { params },
        true
      )) as AxiosResponse<RegistrationPoint[]>;

      const registrationPointsMap = createMap(response.data);

      return dispatch({
        type: DataRegistrationPointsActionTypes.FIND_TREE_SUCCESS,
        payload: {
          tree: response.data,
          registrationPointsMap
        }
      });
    } catch (error: unknown) {
      return dispatch({
        type: DataRegistrationPointsActionTypes.FIND_TREE_FAILURE,
        meta: {
          analytics: {
            // eslint-disable-next-line
            eventType: EventTypes.track
          }
        }
      });
    }
  };
}
