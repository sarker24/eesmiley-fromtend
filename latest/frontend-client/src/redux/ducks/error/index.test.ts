import reducer, {
  initialState,
  ErrorActionTypes,
  ErrorActions,
  showError,
  closeError
} from './index';
import { MockStore } from 'test-utils';

describe('[REDUX] Tests the error actions', () => {
  describe('Reducer tests', () => {
    const error = {
      code: 'E200',
      message: 'Test Error',
      active: true
    };

    test(ErrorActionTypes.SHOW_ERROR, () => {
      const actionInput: ErrorActions = {
        type: ErrorActionTypes.SHOW_ERROR,
        payload: error
      };
      expect(reducer(error, actionInput)).toEqual(error);
    });

    test(ErrorActionTypes.CLOSE_ERROR, () => {
      const actionInput: ErrorActions = {
        type: ErrorActionTypes.CLOSE_ERROR
      };
      expect(reducer(error, actionInput)).toEqual(initialState);
    });
  });

  test('Test showError functionality', () => {
    const store = MockStore();
    store.dispatch(showError('E400', 'Test message'));

    const expectedAction = [
      {
        type: ErrorActionTypes.SHOW_ERROR
      }
    ];

    expect(store.getActions()).toMatchObject(expectedAction);
  });

  test('Test closeError functionality', () => {
    const store = MockStore();
    store.dispatch(closeError());

    const expectedAction = [
      {
        type: ErrorActionTypes.CLOSE_ERROR
      }
    ];

    expect(store.getActions()).toMatchObject(expectedAction);
  });
});
