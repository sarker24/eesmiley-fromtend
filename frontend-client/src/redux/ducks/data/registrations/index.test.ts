import { MockStore, DataTransferMock } from 'test-utils';
import { DataRegistrationActionTypes, find, remove } from './index';

let store = MockStore();
const mockTransfer = DataTransferMock(window.sysvars.API_URL);
const token = '"this-is-a-token"';

describe('data/registrations action-creators', () => {
  beforeEach(() => {
    localStorage.clear();
    store = MockStore();
    mockTransfer.reset();
  });

  test('find > success', async () => {
    mockTransfer.onGet('/foodwaste/registrations').replyOnce([200, []]);
    await store.dispatch(find());

    const expectedActions = [
      { type: DataRegistrationActionTypes.FIND_REQUEST },
      {
        payload: [],
        type: DataRegistrationActionTypes.FIND_SUCCESS
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('find > failure', async () => {
    mockTransfer.onGet('/foodwaste/registrations').reply([500, 'error-response']);

    await store.dispatch(find());

    const expectedActions = [
      { type: DataRegistrationActionTypes.FIND_REQUEST },
      {
        meta: {
          analytics: {
            eventType: 'track'
          }
        },
        type: DataRegistrationActionTypes.FIND_FAILURE
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('remove > success', async () => {
    localStorage.setItem('token', token);
    mockTransfer.onDelete('/foodwaste/registrations/7').replyOnce([200, 'success-response']);

    await store.dispatch(remove('7'));

    const expectedActions = [
      { type: DataRegistrationActionTypes.REMOVE_REQUEST },
      {
        payload: '7',
        type: DataRegistrationActionTypes.REMOVE_SUCCESS
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('remove > failure', async () => {
    mockTransfer.onDelete('/foodwaste/registrations/2').replyOnce([404, 'error-response']);

    await store.dispatch(remove('2'));

    const expectedActions = [
      {
        type: DataRegistrationActionTypes.REMOVE_REQUEST
      },
      {
        meta: {
          analytics: {
            eventType: 'track'
          }
        },
        type: DataRegistrationActionTypes.REMOVE_FAILURE
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
