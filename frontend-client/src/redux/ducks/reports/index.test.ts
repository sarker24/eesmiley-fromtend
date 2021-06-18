import cache from './cache';
import * as reportsDispatch from './index';
import { initialState } from './reducer';
import actions from './actions';
import { browserHistory } from 'react-router';
import { MockStore, DataTransferMock } from 'test-utils';

const registrationsUrl = 'https://www.esmiley.dk/';
const projectsUrl = 'https://www.esmiley.dk/';
const salesUrl = 'https://www.esmiley.dk/';

browserHistory.push = jest.fn();
jest.mock('./cache');

const cacheMock = jest.fn();
(cache as jest.Mock).mockImplementation(() => cacheMock);

const mockTransfer = DataTransferMock(window.sysvars.API_URL);

const defaultState = {
  ui: {
    pages: {
      report: {
        currentTab: 0
      }
    }
  },
  user: {
    customerId: 123
  },
  routing: {
    locationBeforeTransitions: {
      pathname: ''
    }
  }
};

const mockedProjects = [
  {
    id: '123',
    parentProjectId: null,
    name: 'Test',
    customerId: 1337
  },
  {
    id: '124',
    parentProjectId: '123',
    name: 'Test 2',
    customerId: 1337
  }
];

describe('[REDUX] reports v2 > action creators', () => {
  describe('setFilter', () => {
    test('can set filter', async () => {
      expect(reportsDispatch.initFilter).not.toBeNull();
      const dispatchMock = jest.fn();

      const filter = {
        from: '2017-12-13',
        to: '2017-12-25',
        accounts: ['122'],
        interval: null
      };

      await reportsDispatch.initFilter(filter)(dispatchMock, () => {
        return {
          user: defaultState.user,
          reports: initialState,
          settings: { accounts: [{ id: 122 }, { id: defaultState.user }] }
        };
      });

      await expect(dispatchMock).toHaveBeenCalledWith({
        type: actions.SET_FILTER,
        payload: {
          from: '2017-12-13',
          dashboard: 0,
          group: 'auto',
          interval: null,
          to: '2017-12-25',
          accounts: ['122'],
          area: [],
          category: [],
          product: [],
          account: null
        }
      });
    });
  });

  describe('query', () => {
    let store;

    beforeEach(() => {
      const reports = {
        ...initialState,
        filter: {
          to: '2018-08-03',
          from: '2018-04-02',
          accounts: [232, 25981, 122],
          account: 1337
        }
      };
      store = MockStore({ reports });
      mockTransfer.reset();
      cacheMock.mockClear();
    });

    test('can query the dashboards', async () => {
      mockTransfer
        .onGet('/foodwaste/metabase/registrations')
        .replyOnce([200, { url: registrationsUrl }]);
      mockTransfer.onGet('/foodwaste/metabase/projects').replyOnce([200, { url: projectsUrl }]);
      mockTransfer.onGet('/foodwaste/metabase/sales').replyOnce([200, { url: salesUrl }]);
      mockTransfer.onGet('/foodwaste/projects').replyOnce([200, mockedProjects]);

      await store.dispatch(reportsDispatch.query());

      const expectedActions = [
        {
          type: 'esmiley/reports/QUERY_REQUEST'
        }
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });

    test('can query the dashboards with cache', async () => {
      const testUrl = 'https://esmiley.dk';
      cacheMock.mockImplementation(() => ({
        getCachedUrlByParams: () => testUrl,
        put: () => {}
      }));

      await store.dispatch(reportsDispatch.query());

      const expectedActions = [
        {
          type: 'esmiley/reports/QUERY_REQUEST'
        }
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });

    test('can fail querying the dashboards', async () => {
      cacheMock.mockImplementation(() => ({
        getCachedUrlByParams: () => null,
        put: () => {}
      }));

      for (let i in reportsDispatch.endpoints) {
        mockTransfer.onGet(reportsDispatch.endpoints[i]).replyOnce([
          500,
          {
            errorCode: '500',
            message: 'Internal server error'
          }
        ]);
      }

      await store.dispatch(reportsDispatch.query());

      const expectedActions = [
        {
          type: 'esmiley/reports/QUERY_REQUEST'
        }
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('requestApi', () => {
    test('can use requestApi', async () => {
      mockTransfer.reset();
      mockTransfer.onGet('https://esmiley.dk').replyOnce([200, { url: 'https://google.dk' }]);
      const data = await reportsDispatch.requestApi('https://esmiley.dk', {});
      expect(data).toBe('https://google.dk');
    });
  });

  describe('queryProjects', () => {
    test('can query projects', async () => {
      mockTransfer.reset();
      mockTransfer.onGet('/foodwaste/projects').reply([
        200,
        [
          {
            id: '123',
            name: 'Test'
          }
        ]
      ]);

      const store = MockStore({
        reports: {
          ...initialState,
          filter: {
            to: '2018-07-06',
            from: '2018-06-06',
            accounts: [123, 145]
          }
        }
      });

      await store.dispatch(reportsDispatch.queryProjects());

      const expectedActions = [
        {
          payload: {
            accounts: '123,145',
            from: '2018-06-06',
            to: '2018-07-06'
          },
          type: 'esmiley/reports/QUERY_PROJECTS_REQUEST'
        },
        {
          payload: [
            {
              id: '123',
              name: 'Test'
            }
          ],
          type: 'esmiley/reports/QUERY_PROJECTS_SUCCESS'
        }
      ];

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('setReportsDashboardTab', () => {
    test('can set tab', async () => {
      const reports = {
        ...initialState,
        filter: {
          to: '2018-07-06',
          from: '2018-06-06',
          accounts: [123, 145]
        }
      };
      const store = MockStore({ reports });

      await store.dispatch(reportsDispatch.setReportsDashboardTab('foodwaste'));
      await store.dispatch(reportsDispatch.setReportsDashboardTab('projects'));
      await store.dispatch(reportsDispatch.setReportsDashboardTab('sales'));

      const expectedActions = [
        {
          payload: 0,
          type: 'esmiley/ui/pages/report/UPDATE_TAB'
        },
        {
          payload: 1,
          type: 'esmiley/ui/pages/report/UPDATE_TAB'
        },
        {
          payload: 2,
          type: 'esmiley/ui/pages/report/UPDATE_TAB'
        }
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('paramsSerializer', () => {
    test('can serialize parameters', () => {
      const params = {
        nullKey: null,
        undefinedValue: undefined,
        arrayValue: ['test'],
        objectValue: { da: 'test' },
        accounts: ['1251', '26532', '44343'],
        name: 'Name',
        numberValue: 123
      };
      const serializedParams = reportsDispatch.paramsSerializer(params);
      expect(serializedParams).toBe(
        'arrayValue=test&accounts=1251|26532|44343&name=Name&numberValue=123'
      );
    });
  });
});
