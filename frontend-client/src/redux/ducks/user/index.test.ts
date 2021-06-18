import reducer, { UserActions, UserActionTypes, initUser } from './index';
import { MockStore, DataTransferMock } from 'test-utils';

const user = {
  name: 'heman',
  email: 'heman98@mastersoftheuniverse.com'
};

describe('[REDUX] user reducer tests', () => {
  test(UserActionTypes.USER_LOADED, () => {
    const actionInput: UserActions = {
      type: UserActionTypes.USER_LOADED,
      payload: user
    };
    expect(reducer(user, actionInput)).toEqual(user);
  });
});

describe('[REDUX] user action creators test', () => {
  let store = MockStore();
  const mockTransfer = DataTransferMock(window.sysvars.LEGACY_API_URL);
  const token = '"345678fghj5678.5678fgh5678.q234dfgyui89"';

  beforeEach(() => {
    store = MockStore();
    mockTransfer.reset();
    localStorage.clear();

    mockTransfer.onGet('/system-api/profile').reply((headers) => {
      if (
        headers.Authorization &&
        headers.Authorization === `Bearer ${JSON.parse(token) as string}`
      ) {
        return [200, user];
      } else {
        return [401, 'Unauthorized'];
      }
    });
  });

  test('it should throw error if no token present', async () => {
    await expect(store.dispatch(initUser())).rejects.toEqual(
      new Error('Request failed with status code 401')
    );
  });

  test('it should authenticate with token', async () => {
    localStorage.setItem('token', token);

    await store.dispatch(initUser());

    const expectedActions = [
      {
        payload: {
          email: 'heman98@mastersoftheuniverse.com',
          name: 'heman'
        },
        type: UserActionTypes.USER_LOADED
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
