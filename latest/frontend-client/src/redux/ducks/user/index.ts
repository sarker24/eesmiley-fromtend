import { DataTransfer, DataStorage } from 'frontend-core';
import { UserActions, UserProfile, UserState, UserActionTypes } from './types';
import { AxiosResponse } from 'axios';
import { ThunkResult } from 'redux/types';

export * from './types';

const transfer = new DataTransfer();
const store = new DataStorage();

export const initialState: UserState = {
  email: '',
  name: '',
  client: ''
};

export default function reducer(state: UserState = initialState, action: UserActions): UserState {
  switch (action.type) {
    case UserActionTypes.USER_LOADED:
      return { ...state, ...action.payload };
    case UserActionTypes.SET_CLIENT:
      return { ...state, client: action.payload };
    default:
      return state;
  }
}

export function initUser(): ThunkResult<Promise<UserActions>, UserActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // todo requires fixing core api
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const response = (await transfer.get('/system-api/profile', {
      baseURL: window['sysvars'].LEGACY_API_URL
    })) as AxiosResponse<UserProfile>;

    return dispatch({
      type: UserActionTypes.USER_LOADED,
      payload: response.data
    });
  };
}

export function setClient(client: string): UserActions {
  return {
    type: UserActionTypes.SET_CLIENT,
    payload: client
  };
}
