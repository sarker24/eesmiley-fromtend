export enum NotificationActionTypes {
  SHOW_NOTIFICATION = 'esmiley/notification/SHOW_NOTIFICATION',
  CLOSE_NOTIFICATION = 'esmiley/notification/CLOSE_NOTIFICATION'
}

export interface NotificationState {
  message: string;
  active: boolean;
  isError: boolean;
  icon: JSX.Element;
}

type ShowNotificationAction = {
  type: typeof NotificationActionTypes.SHOW_NOTIFICATION;
  payload: {
    message: string;
    isError: boolean;
    icon: JSX.Element;
  };
};

type CloseNotificationAction = {
  type: typeof NotificationActionTypes.CLOSE_NOTIFICATION;
};

export type NotificationActions = ShowNotificationAction | CloseNotificationAction;
