import { MockStore, DataTransferMock } from 'test-utils';
import { deleteRegistration, getRegistrations, RegistrationsActionTypes } from './index';

describe('registrations action-creators', () => {
  let store = MockStore();
  const mockTransfer = DataTransferMock(window.sysvars.API_URL);

  beforeEach(() => {
    store = MockStore();
    mockTransfer.reset();
  });

  test('getRegistrations', async () => {
    mockTransfer.onGet('/foodwaste/registrations').replyOnce([200, 'success-response']);

    await store.dispatch(getRegistrations());

    const expectedActions = [
      {
        payload: 'success-response',
        type: RegistrationsActionTypes.GET_REGISTRATIONS
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('deleteRegistration', async () => {
    mockTransfer.onDelete('/foodwaste/registrations/1').replyOnce([200, 'ok']);

    await store.dispatch(deleteRegistration(1));

    const expectedActions = [{ type: RegistrationsActionTypes.DELETE_REGISTRATION }];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
