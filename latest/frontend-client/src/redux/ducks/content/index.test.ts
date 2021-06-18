import * as contentDispatch from './index';
import { MockStore, DataTransferMock } from 'test-utils';
import { ContentActions, ContentActionTypes } from 'redux/ducks/content/types';
import { initialState } from './index';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';

const transferMock = DataTransferMock(window.sysvars.API_URL);
const store = MockStore();

describe('[REDUX] content', () => {
  describe('Reducer tests', () => {
    beforeEach(() => {
      transferMock.reset();
      store.clearActions();
    });

    test(ContentActionTypes.GET_REGISTRATION_POINTS, () => {
      const registrationPoints: RegistrationPoint[] = [
        {
          id: '1',
          name: 'test',
          amount: 100,
          costPerkg: 200,
          co2Perkg: null,
          active: true,
          label: 'area'
        }
      ];

      const action: ContentActions = {
        type: ContentActionTypes.GET_REGISTRATION_POINTS,
        payload: registrationPoints
      };

      const getRegistrationPoints = contentDispatch.default(initialState, action);

      expect(getRegistrationPoints).toEqual({
        isRegistrationPointsFetched: true,
        registrationPointsFailed: false,
        registrationPoints
      });
    });
  });

  test('getRegistrationPoints', async () => {
    const data = {
      registrationPoints: [
        {
          id: 1,
          name: 'test product 1'
        },
        {
          id: 2,
          name: 'test product 2'
        },
        {
          id: 3,
          name: 'test product 3'
        }
      ]
    };

    transferMock.onGet('/foodwaste/registration-points').replyOnce({
      status: 200,
      response: data.registrationPoints
    });

    await store.dispatch(contentDispatch.getRegistrationPoints());

    const expectedActions = [
      { type: ContentActionTypes.FETCH_REGISTRATION_POINTS },
      {
        type: ContentActionTypes.GET_REGISTRATION_POINTS,
        payload: data.registrationPoints
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('updateRegistrationPoint', async () => {
    const id = 123;
    const patchObject = [
      {
        op: 'replace',
        path: '/name',
        value: 'Test'
      }
    ];
    transferMock
      .onPatch(`/foodwaste/registration-points/${id}`)
      .replyOnce({ status: 200, response: null });

    await store.dispatch(contentDispatch.updateRegistrationPoint(id, patchObject));

    const expectedActions = [
      {
        type: 'esmiley/content/FETCH_REGISTRATION_POINTS'
      },
      {
        payload: [
          {
            id: 1,
            name: 'test product 1'
          },
          {
            id: 2,
            name: 'test product 2'
          },
          {
            id: 3,
            name: 'test product 3'
          }
        ],
        type: 'esmiley/content/GET_REGISTRATION_POINTS'
      },
      {
        payload: null,
        type: 'esmiley/content/UPDATE_REGISTRATION_POINT'
      }
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
