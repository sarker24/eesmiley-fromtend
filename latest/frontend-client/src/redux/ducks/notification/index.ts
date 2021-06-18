import { NotificationActionTypes, NotificationActions, NotificationState } from './types';

export * from './types';

export const initialState: NotificationState = {
  message: null,
  active: false,
  isError: false,
  icon: null
};

export default function reducer(
  state: NotificationState = initialState,
  action: NotificationActions
): NotificationState {
  switch (action.type) {
    case NotificationActionTypes.SHOW_NOTIFICATION: {
      const { message, isError, icon } = action.payload;
      return {
        message,
        active: true,
        isError: isError,
        icon
      };
    }
    case NotificationActionTypes.CLOSE_NOTIFICATION:
      return initialState;

    default:
      return state;
  }
}

export function showNotification(
  message: string,
  isError?: boolean,
  icon?: JSX.Element
): NotificationActions {
  return {
    type: NotificationActionTypes.SHOW_NOTIFICATION,
    payload: {
      message,
      isError,
      icon
    }
  };
}

export function closeNotification(): NotificationActions {
  return { type: NotificationActionTypes.CLOSE_NOTIFICATION };
}
