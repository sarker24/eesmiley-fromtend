import moment from 'moment';
import * as dashboard from './index';
import { MockStore, DataTransferMock } from 'test-utils';
import { initialState as initialSettingsState } from '../settings';
import { DashboardActionTypes, Waste, initialState, Improvement, Frequency } from './index';
import { ErrorActionTypes } from 'redux/ducks/error';
import { DataRegistrationPointsActionTypes } from 'redux/ducks/data/registrationPoints';
import { DataHighchartsActionTypes } from 'redux/ducks/data/highcharts';

const settings = {
  ...initialSettingsState,
  expectedWeeklyWaste: {
    [0]: 10203
  },
  registrationsFrequency: {
    [0]: [0, 1, 2, 3]
  }
};

let store = MockStore({ dashboard: dashboard.initialState, settings });
const mockTransfer = DataTransferMock(window.sysvars.API_URL);

describe('[REDUX] Test the dashboard actions and helper functions', () => {
  describe('refreshRegistrationFrequency tests', () => {
    beforeEach(() => {
      mockTransfer.reset();
      store = MockStore({ dashboard: dashboard.initialState, settings });
    });

    test('it can do a call to the API with accounts', async () => {
      mockTransfer.onGet('/foodwaste/registrations/frequency').replyOnce({
        status: 200,
        response: {
          pointerLocation: 54,
          accounts: [
            {
              frequency: 51
            },
            {
              frequency: 13
            }
          ]
        }
      });

      const expectedActions = [
        {
          payload: {
            accounts: [{ frequency: 51 }, { frequency: 13 }],
            pointerLocation: 54
          },
          type: DashboardActionTypes.SET_REGISTRATION_FREQUENCY
        }
      ];

      await store.dispatch(dashboard.refreshRegistrationFrequency());

      expect(store.getActions()).toEqual(expectedActions);
    });

    test('it wont poll for frequencies when no frequency settings are set', async () => {
      store = MockStore({
        settings: { ...initialSettingsState, registrationsFrequency: {} }
      });

      const expectedActions = [
        {
          payload: {
            accounts: [],
            pointerLocation: 0,
            noSettings: true
          },
          type: DashboardActionTypes.SET_REGISTRATION_FREQUENCY
        }
      ];

      await store.dispatch(dashboard.refreshRegistrationFrequency());

      expect(store.getActions()).toEqual(expectedActions);
    });

    test('it can do a call to the API and handle errors', async () => {
      mockTransfer.onGet('/foodwaste/registrations/frequency').replyOnce({
        status: 400,
        response: {
          name: 'BadRequest',
          message: 'JSON-Schema validation failed',
          code: 400,
          errorCode: 'E060',
          className: 'bad-request',
          data: {
            input: {
              start: '2018-09-24',
              period: 'week',
              accounts: '1',
              customerId: 1
            }
          },
          info: "should have required property 'end'"
        }
      });

      const expectedActions = [
        {
          payload: {
            code: 'E060',
            message: 'JSON-Schema validation failed'
          },
          type: ErrorActionTypes.SHOW_ERROR
        }
      ];

      await store.dispatch(dashboard.refreshRegistrationFrequency());

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('refreshImprovements tests', () => {
    beforeEach(() => {
      mockTransfer.reset();
      store = MockStore({ dashboard: dashboard.initialState, settings });
    });

    test('it can do a call to the API with accounts', async () => {
      const data = {
        maxCost: 0,
        improvementCost: 0,
        expectedWeight: 0,
        actualCost: 0,
        days: 7,
        accounts: [],
        accountsWithoutSettings: []
      };

      mockTransfer.onGet('/foodwaste/registrations/improvements').replyOnce({
        response: data
      });

      const expectedActions = [
        {
          type: DashboardActionTypes.SET_IMPROVEMENTS,
          payload: data
        }
      ];

      await store.dispatch(dashboard.refreshImprovements());

      expect(store.getActions()).toEqual(expectedActions);
    });

    test('it can do a call to the API and handle errors', async () => {
      mockTransfer.onGet('/foodwaste/registrations/improvements').replyOnce({
        status: 400,
        response: {
          name: 'BadRequest',
          message: 'JSON-Schema validation failed',
          code: 400,
          errorCode: 'E060',
          className: 'bad-request',
          data: {
            input: {
              start: '2018-09-24',
              period: 'week',
              accounts: '1',
              customerId: 1
            }
          },
          info: "should have required property 'end'"
        }
      });

      const expectedActions = [
        {
          payload: {
            code: 'E060',
            message: 'JSON-Schema validation failed'
          },
          type: ErrorActionTypes.SHOW_ERROR
        }
      ];

      await store.dispatch(dashboard.refreshImprovements());

      expect(store.getActions()).toEqual(expectedActions);
    });

    test('it can stop itself if the settings for expected weekly waste is not set', async () => {
      store = MockStore({
        settings: { ...initialSettingsState, expectedWeeklyWaste: {} }
      });
      const expectedActions = [
        {
          payload: {
            accounts: [],
            accountsWithoutEnoughRegs: [],
            accountsWithoutRegistrationPoints: [],
            accountsWithoutSettings: [],
            improvementCost: 0,
            maxCost: 0,
            noSettings: true
          },
          type: DashboardActionTypes.SET_IMPROVEMENTS
        }
      ];

      await store.dispatch(dashboard.refreshImprovements());

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('refreshExpectedWeeklyWaste tests', () => {
    beforeEach(() => {
      mockTransfer.reset();
      store = MockStore({ dashboard: dashboard.initialState, settings });
    });

    test('it can do a call to the API with accounts', async () => {
      const data: Waste = {
        actualAmount: 20322,
        actualCost: 1510,
        forecastedAmount: 155550,
        expectedAmount: 55550,
        registrationPoints: [],
        accountsWithoutSettings: ['23211'],
        accounts: [
          {
            actualCost: 1293,
            accountId: '12332',
            expectedAmount: 0,
            actualAmount: 0,
            name: 'test',
            trend: [],
            registrationPoints: []
          }
        ]
      };

      mockTransfer.onGet('/foodwaste/registrations/waste').replyOnce({
        response: data
      });

      const expectedActions = [
        {
          payload: data,
          type: 'esmiley/dashboard/SET_EXPECTED_WEEKLY_WASTE'
        }
      ];

      await store.dispatch(dashboard.refreshExpectedWeeklyWaste());

      expect(store.getActions()).toEqual(expectedActions);
    });

    test('it can stop itself if the settings for expected weekly waste is not set', async () => {
      store = MockStore({
        settings: { ...initialSettingsState, expectedWeeklyWaste: {} }
      });
      const expectedActions = [
        {
          payload: {
            accounts: [],
            accountsWithoutSettings: [],
            actualAmount: 0,
            actualCost: 0,
            expectedAmount: 0,
            noSettings: true,
            registrationPoints: []
          },
          type: 'esmiley/dashboard/SET_EXPECTED_WEEKLY_WASTE'
        }
      ];

      await store.dispatch(dashboard.refreshExpectedWeeklyWaste());

      expect(store.getActions()).toEqual(expectedActions);
    });

    test('it can do a call to the API and handle errors', async () => {
      mockTransfer.onGet('/foodwaste/registrations/waste').replyOnce({
        status: 400,
        response: {
          name: 'BadRequest',
          message: 'JSON-Schema validation failed',
          code: 400,
          errorCode: 'E060',
          className: 'bad-request',
          data: {
            input: {
              start: '2018-09-24',
              period: 'week',
              accounts: '1',
              customerId: 1
            }
          },
          info: "should have required property 'end'"
        }
      });
      const expectedActions = [
        {
          payload: {
            code: 'E060',
            message: 'JSON-Schema validation failed'
          },
          type: ErrorActionTypes.SHOW_ERROR
        }
      ];

      await store.dispatch(dashboard.refreshExpectedWeeklyWaste());

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('refresh tests', () => {
    test('it can refresh', async () => {
      store = MockStore({
        dashboard: dashboard.initialState,
        settings: {
          ...initialSettingsState,
          registrationsFrequency: {
            '0': [1, 2]
          },
          expectedWeeklyWaste: {
            '0': 20000
          }
        },
        user: {
          customerId: 33885
        }
      });

      const improvementsPayload: Improvement = {
        accountsWithoutRegistrationPoints: [],
        accountsWithoutSettings: [],
        maxCost: 0,
        improvementCost: 0,
        accounts: [],
        accountsWithoutEnoughRegs: []
      };

      const frequencyPayload: Frequency = {
        pointerLocation: 84,
        accounts: []
      };

      const wastePayload: Waste = {
        actualAmount: 20322,
        actualCost: 1510,
        forecastedAmount: 155550,
        expectedAmount: 55550,
        accountsWithoutSettings: ['23211'],
        registrationPoints: [],
        accounts: [
          {
            actualCost: 1293,
            accountId: '12332',
            expectedAmount: 0,
            actualAmount: 0,
            name: 'test',
            trend: [],
            registrationPoints: []
          }
        ]
      };

      mockTransfer
        .onGet('/foodwaste/registrations/frequency')
        .replyOnce([200, frequencyPayload])
        .onGet('/foodwaste/registrations/improvements')
        .replyOnce([200, improvementsPayload])
        .onGet('/foodwaste/registrations/waste')
        .replyOnce([200, wastePayload])
        .onGet('/foodwaste/registration-points')
        .replyOnce([200, []]);

      await store.dispatch(dashboard.refresh());

      const actions = store.getActions();

      expect(actions).toHaveLength(9);

      expect(
        actions.find((action) => action.type === DashboardActionTypes.SET_REGISTRATION_FREQUENCY)
          .payload
      ).toEqual(frequencyPayload);

      expect(
        actions.find((action) => action.type === DashboardActionTypes.SET_IMPROVEMENTS).payload
      ).toEqual(improvementsPayload);

      expect(
        actions.find((action) => action.type === DashboardActionTypes.SET_EXPECTED_WEEKLY_WASTE)
          .payload
      ).toEqual(wastePayload);
    });
  });

  describe('changeFilter tests', () => {
    test('it can change filter', async () => {
      const startDate = moment().startOf('week').format('YYYY-MM-DD');
      const endDate = moment().endOf('week').format('YYYY-MM-DD');
      store = MockStore({
        dashboard: dashboard.initialState,
        settings
      });
      mockTransfer
        .onGet('/foodwaste/registrations/frequency')
        .reply([200, initialState.data.frequency])
        .onGet('/foodwaste/registrations/improvements')
        .reply([200, initialState.data.improvements])
        .onGet('/foodwaste/registrations/waste')
        .reply([200, initialState.data.foodWaste])
        .onGet('/foodwaste/registration-points')
        .reply([200, []]);

      const filter = {
        dateFilter: {
          startDate,
          endDate,
          interval: 'week'
        },
        accountIds: ['1', '2', '3']
      };

      const expectedActions = [
        {
          payload: {
            startDate,
            endDate,
            interval: 'week'
          },
          type: DashboardActionTypes.SET_TIME_FILTER
        },
        {
          payload: ['1', '2', '3'],
          type: DashboardActionTypes.SET_ACCOUNTS
        },
        { type: DashboardActionTypes.REFRESH },
        {
          payload: initialState.data.frequency,
          type: DashboardActionTypes.SET_REGISTRATION_FREQUENCY
        },
        {
          payload: initialState.data.foodWaste,
          type: DashboardActionTypes.SET_EXPECTED_WEEKLY_WASTE
        },
        {
          payload: initialState.data.improvements,
          type: DashboardActionTypes.SET_IMPROVEMENTS
        },
        {
          type: DataRegistrationPointsActionTypes.FIND_REQUEST
        },
        {
          payload: {
            allNodes: [],
            registrationPointsMap: new Map(),
            roots: []
          },
          type: DataRegistrationPointsActionTypes.FIND_SUCCESS
        },
        {
          type: DataHighchartsActionTypes.SET_HIGHCHARTS_SERIES_REQUEST
        },
        {
          payload: {
            selectedPoint: null,
            series: []
          },
          type: DataHighchartsActionTypes.SET_HIGHCHARTS_SERIES_SUCCESS
        },
        { type: DashboardActionTypes.REFRESH_SUCCESS }
      ];

      await store.dispatch(dashboard.changeFilter(filter));

      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
