import { DataStorage, DataTransfer } from 'frontend-core';
import { AxiosError, AxiosResponse } from 'axios';
import { find as getRegistrationPoints, Registration } from 'redux/ducks/data/registrations';
import moment from 'moment';
import { unformatMass } from 'components/formatted-mass';
import { API_DATE_FORMAT } from 'utils/datetime';
import {
  DataRegistrationPointsActions,
  DataRegistrationPointsActionTypes,
  RegistrationPoint
} from 'redux/ducks/data/registrationPoints';
import {
  RegistrationActions,
  RegistrationActionTypes,
  RegistrationState,
  ScaleStatus,
  StepShape
} from 'redux/ducks/registration/types';
import { ApiError, ErrorActions, showError } from 'redux/ducks/error';
import { ThunkResult } from 'redux/types';

export * from './types';
export * from './selectors';

const transfer = new DataTransfer();
const store = new DataStorage();

const currentDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear());
  date.setHours(0, 0, 0, 0);
  return date;
};

const UpdateDateIntervalInMins = 30;

export const initialState: RegistrationState = {
  weight: 0,
  date: currentDate(),
  step: 0,
  loading: false,
  scaleStatus: {
    isConnected: false
  },
  pageNumber: 0,
  currentNode: null,
  nodesHistory: [],
  dateUpdatedAt: Date.now(),
  lastRegistration: undefined
};

export default function reducer(
  state: RegistrationState = initialState,
  action: RegistrationActions
): RegistrationState {
  switch (action.type) {
    case RegistrationActionTypes.SET_WEIGHT:
      return { ...state, weight: action.payload };
    case RegistrationActionTypes.SET_DATE:
      return { ...state, date: action.payload, dateUpdatedAt: Date.now() };
    case RegistrationActionTypes.SET_COMMENT:
      return { ...state, comment: action.payload };
    case RegistrationActionTypes.REGISTER_REQUEST:
      return { ...state, loading: true };
    case RegistrationActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        comment: undefined,
        weight: 0,
        currentNode: null,
        nodesHistory: [],
        step: 0,
        date: currentDate(),
        loading: false,
        lastRegistration: {
          ...action.payload,
          pointName: state.currentNode.name,
          pointPath: state.nodesHistory.flatMap((pointsByName) => Object.keys(pointsByName))
        },
        dateUpdatedAt: Date.now()
      };

    case RegistrationActionTypes.REGISTER_FAILURE: {
      return { ...state, loading: false };
    }
    case RegistrationActionTypes.UPDATE_STEP:
      return { ...state, step: action.payload };
    case RegistrationActionTypes.UPDATE_REGISTRATION_POINTS:
      return {
        ...state,
        nodesHistory: action.payload.nodesHistory,
        currentNode: action.payload.registrationPoint
      };
    case RegistrationActionTypes.SET_SCALE_STATUS:
      return { ...state, scaleStatus: action.payload };
    case RegistrationActionTypes.UPDATE_PAGINATION:
      return { ...state, pageNumber: action.payload };
    case RegistrationActionTypes.UPDATE_STEPPER:
      return { ...state, pageNumber: 0, step: 0, nodesHistory: action.payload };
    case RegistrationActionTypes.RESET_LAST_REGISTRATION: {
      return { ...state, lastRegistration: undefined };
    }
    default:
      return state;
  }
}

// remove this, after success reset right away
export function registerSuccess(): ThunkResult<
  DataRegistrationPointsActions,
  DataRegistrationPointsActions
> {
  return (dispatch, getState) => {
    const allNodes = getState().data.registrationPoints.allNodes;
    const roots = allNodes.filter((node) => !node.parentId);
    // todo fix this, or figure out why this is done here
    return dispatch({
      type: DataRegistrationPointsActionTypes.UPDATE,
      payload: roots
    });
  };
}

export const updateStep = (
  step: StepShape
): ThunkResult<RegistrationActions, RegistrationActions | DataRegistrationPointsActions> => {
  return (dispatch, getState) => {
    const { dateUpdatedAt } = getState().registration;
    const currentDate = new Date();
    // next step is registration weight page,
    // check set date and update it to current date,
    // if set date was updated more than given interval.
    // this is only necessary, because we allow users
    // to set data and go back to change registration point
    if (step === 1) {
      if (moment(currentDate.getTime()).diff(dateUpdatedAt, 'minutes') > UpdateDateIntervalInMins) {
        dispatch(setDate(currentDate));
      }
    }

    return dispatch({
      type: RegistrationActionTypes.UPDATE_STEP,
      payload: step
    });
  };
};

export const updatePagination = (pageNumber: number): RegistrationActions => ({
  type: RegistrationActionTypes.UPDATE_PAGINATION,
  payload: pageNumber
});

export const setDate = (date: Date): RegistrationActions => ({
  type: RegistrationActionTypes.SET_DATE,
  payload: date
});

export const setComment = (comment: string): RegistrationActions => ({
  type: RegistrationActionTypes.SET_COMMENT,
  payload: comment
});

export const setScaleStatus = (status: ScaleStatus): RegistrationActions => ({
  type: RegistrationActionTypes.SET_SCALE_STATUS,
  payload: status
});

// fix to not return api response => void | action
export function register(): ThunkResult<
  Promise<RegistrationActions | ErrorActions>,
  RegistrationActions | DataRegistrationPointsActions
> {
  return async (dispatch, getState) => {
    const {
      scaleStatus: { isConnected: isScaleConnected },
      date,
      weight,
      comment,
      currentNode: selectedRegistrationPoint
    } = getState().registration;
    const { unit } = getState().settings;
    const allNodes = getState().data.registrationPoints.allNodes;
    const roots = allNodes.filter((node) => !node.parentId);
    const amount = parseInt((unformatMass(weight) as number).toFixed(0));

    if (!selectedRegistrationPoint) {
      return Promise.reject({ selectedRegistrationPoint });
    }

    if (amount < 100) {
      return Promise.reject({ amount });
    }

    dispatch({
      type: RegistrationActionTypes.REGISTER_REQUEST
    });

    const data = {
      scale: isScaleConnected,
      amount,
      comment,
      date: moment(date).format(API_DATE_FORMAT),
      registrationPointId: parseInt(selectedRegistrationPoint.id),
      unit
    };

    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = (await transfer.post(
        '/foodwaste/registrations',
        data
      )) as AxiosResponse<Registration>;
      // why is this done?
      await dispatch(getRegistrationPoints());

      // todo fix this, or figure out why this is done here,
      // we only need to store id refs here in registration state slice,
      // not update other state slices
      dispatch({
        type: DataRegistrationPointsActionTypes.UPDATE,
        payload: roots
      });

      return dispatch({
        type: RegistrationActionTypes.REGISTER_SUCCESS,
        payload: response.data
      });
    } catch (err: unknown) {
      dispatch({
        type: RegistrationActionTypes.REGISTER_FAILURE
      });

      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(showError(errorCode, message));
    }
  };
}

export function selectRegistrationPoint(
  registrationPoint: RegistrationPoint,
  registerDirectly?: boolean
): ThunkResult<
  RegistrationActions | DataRegistrationPointsActions,
  RegistrationActions | DataRegistrationPointsActions
> {
  return (dispatch, getState) => {
    const { allNodes, roots } = getState().data.registrationPoints;
    const { nodesHistory } = getState().registration;
    const newRoots = allNodes.filter(
      (node: RegistrationPoint) =>
        node.parentId === registrationPoint.id && node.active && !node.deletedAt
    );

    dispatch({ type: RegistrationActionTypes.UPDATE_PAGINATION, payload: 0 });
    dispatch({
      type: RegistrationActionTypes.UPDATE_REGISTRATION_POINTS,
      payload: {
        nodesHistory: [...nodesHistory, { [registrationPoint.name]: roots }],
        registrationPoint
      }
    });

    if (registerDirectly || newRoots.length === 0) {
      dispatch({
        type: DataRegistrationPointsActionTypes.UPDATE,
        payload: newRoots
      });
      return dispatch(updateStep(1));
    } else {
      return dispatch({
        type: DataRegistrationPointsActionTypes.UPDATE,
        payload: newRoots
      });
    }
  };
}

export function selectGuestRegistration(): RegistrationActions {
  return { type: RegistrationActionTypes.UPDATE_STEP, payload: 2 };
}

export function updateStepper(
  index: number,
  property: string
): ThunkResult<RegistrationActions, RegistrationActions | DataRegistrationPointsActions> {
  return (dispatch, getState) => {
    const { nodesHistory } = getState().registration;
    const newNodes = nodesHistory[index][property];

    dispatch({
      type: DataRegistrationPointsActionTypes.UPDATE,
      payload: newNodes
    });
    return dispatch({
      type: RegistrationActionTypes.UPDATE_STEPPER,
      payload: nodesHistory.slice(0, index)
    });
  };
}

export function resetStepper(): ThunkResult<
  RegistrationActions,
  RegistrationActions | DataRegistrationPointsActions
> {
  return (dispatch, getState) => {
    const allNodes = getState().data.registrationPoints.allNodes;
    const roots = allNodes.filter((node) => !node.parentId);

    dispatch({
      type: DataRegistrationPointsActionTypes.UPDATE,
      payload: roots
    });
    return dispatch({
      type: RegistrationActionTypes.UPDATE_STEPPER,
      payload: []
    });
  };
}

export function setWeight(weight: number): RegistrationActions {
  return {
    type: RegistrationActionTypes.SET_WEIGHT,
    payload: weight
  };
}

export function resetLastRegistration(): RegistrationActions {
  return { type: RegistrationActionTypes.RESET_LAST_REGISTRATION };
}
