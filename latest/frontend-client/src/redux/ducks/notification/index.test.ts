import reducer, {
  closeNotification,
  initialState,
  NotificationActions,
  NotificationActionTypes,
  showNotification
} from './index';

describe('[REDUX] Tests the notification actions', () => {
  describe('Reducer tests', () => {
    const message = {
      message: 'Test Error',
      active: true,
      isError: false,
      icon: null
    };

    test(NotificationActionTypes.SHOW_NOTIFICATION, () => {
      const actionInput = {
        type: NotificationActionTypes.SHOW_NOTIFICATION,
        payload: message
      };
      expect(reducer(message, actionInput)).toEqual(message);
    });

    test(NotificationActionTypes.CLOSE_NOTIFICATION, () => {
      const actionInput: NotificationActions = {
        type: NotificationActionTypes.CLOSE_NOTIFICATION
      };
      expect(reducer(initialState, actionInput)).toEqual(initialState);
    });
  });

  test('Test showNotification functionality', () => {
    const action = showNotification('Test message');

    const expectedAction = {
      type: NotificationActionTypes.SHOW_NOTIFICATION
    };

    expect(action).toMatchObject(expectedAction);
  });

  test('Test closeNotification functionality', () => {
    closeNotification();
  });
});
