import { EventTypes } from 'redux-segment';
import { MockStore, DataTransferMock } from 'test-utils';
import reducer, {
  initialState,
  AuthActions,
  AuthActionTypes,
  initLogin,
  login,
  logout
} from './index';

const transferMock = DataTransferMock(window.sysvars.API_URL);

const token = '4567890sdfghjk456789dfghjk6.456789sdfghj456789ghjk435678.4567dfghrtyu3456vbf';

transferMock
  .onPost(`${window.sysvars.LEGACY_API_URL}system-api/tokens/auth`)
  .reply((headers, body) => {
    return (JSON.parse(body) as { password?: string }).password
      ? { status: 200, response: { token } }
      : { status: 401, response: null };
  });

describe('[REDUX] Tests the authentication actions', () => {
  describe('Reducer tests', () => {
    test(AuthActionTypes.LOGIN_INIT, () => {
      const action: AuthActions = {
        type: AuthActionTypes.LOGIN_INIT,
        payload: {
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ',
          isLoggedIn: true
        }
      };
      expect(reducer(initialState, action)).toEqual({
        ...initialState,
        isLoggedIn: true,
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ',
        tokenPayload: {
          admin: true,
          name: 'John Doe',
          sub: '1234567890'
        }
      });
    });

    test(AuthActionTypes.LOGIN_REQUEST, () => {
      const action: AuthActions = {
        type: AuthActionTypes.LOGIN_REQUEST
      };

      const expectedOutput = {
        isLoggedIn: false,
        isLoggingIn: true,
        token: '',
        tokenPayload: null
      };
      expect(reducer(initialState, action)).toEqual(expectedOutput);
    });

    test(AuthActionTypes.LOGIN_SUCCESSFUL, () => {
      const action: AuthActions = {
        type: AuthActionTypes.LOGIN_SUCCESSFUL
      };
      const expectedOutput = {
        token: '',
        tokenPayload: null,
        isLoggedIn: true,
        isLoggingIn: false
      };
      expect(reducer(initialState, action)).toEqual(expectedOutput);
    });

    test(AuthActionTypes.LOGOUT, () => {
      const action: AuthActions = { type: AuthActionTypes.LOGOUT };
      const expectedOutput = {
        token: '',
        isLoggedIn: false,
        isLoggingIn: false,
        tokenPayload: null
      };
      expect(reducer(initialState, action)).toEqual(expectedOutput);
    });
  });

  test('Test initLogin', async () => {
    const store = MockStore();

    await store.dispatch(initLogin());

    const expectedOutput = [
      {
        type: AuthActionTypes.LOGIN_INIT,
        meta: {
          analytics: {
            // eslint-disable-next-line
            eventType: EventTypes.track
          }
        }
      }
    ];
    expect(store.getActions()).toMatchObject(expectedOutput);
  });

  describe('Tests login', () => {
    test('Test login successful', async () => {
      const mockSettings = { currency: 'EUR', unit: 'kg' };
      const mockProfile = {
        customerName: 'heman',
        customerId: '1',
        name: 'heman',
        email: 'heman@mastersoftheuniverse.com',
        nickname: 'master of the universe'
      };

      transferMock
        .onGet('/foodwaste/settings')
        .replyOnce({ response: mockSettings })
        .onGet(`${window['sysvars'].LEGACY_API_URL}system-api/profile`)
        .replyOnce({ response: mockProfile });

      const store = MockStore({ user: {} });
      const expectedActions = [
        {
          type: AuthActionTypes.LOGIN_REQUEST
        },
        {
          type: AuthActionTypes.LOGIN_AUTHENTICATE,
          payload: { token }
        },
        {
          payload: mockProfile,
          type: 'esmiley/user/USER_LOADED'
        },
        {
          payload: mockSettings,
          type: 'esmiley/settings/FETCH'
        },
        {
          type: AuthActionTypes.LOGIN_SUCCESSFUL,
          meta: {
            analytics: [
              {
                eventType: 'track'
              },
              {
                eventPayload: {
                  groupId: 'users',
                  traits: {
                    dealNumber: '1',
                    username: 'heman'
                  },
                  type: 'group'
                },
                eventType: 'group'
              }
            ]
          }
        }
      ];

      await store.dispatch(
        login({
          dealNumber: '1',
          username: 'heman',
          password: 'password'
        })
      );

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  test('Test logout', () => {
    const store = MockStore();

    store.dispatch(logout());

    const expectedOutput = [
      {
        type: AuthActionTypes.LOGOUT,
        meta: {
          analytics: {
            // eslint-disable-next-line
            eventType: EventTypes.track
          }
        }
      }
    ];
    expect(store.getActions()).toEqual(expectedOutput);
  });
});
