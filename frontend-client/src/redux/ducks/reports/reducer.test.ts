import reducer, * as reports from './reducer';
import actions from './actions';

describe('[REDUX] reports v2 > reducer', () => {

  test('returns the initial state', () => {
    const result = reducer(reports.initialState);
    expect(result).toEqual(reports.initialState);
  });

  test(actions.SET_FILTER, () => {
    const result = reducer(undefined, {
      type: actions.SET_FILTER,
      payload: {
        from: '2018-12-12',
        to: '2018-12-19',
        dashboard: 0,
        group: 'auto',
        interval: 'week',
        accounts: [5223,2332,343]
      }
    });

    const expectedState = Object.assign({}, reports.initialState, {
      filter: {
        from: '2018-12-12',
        to: '2018-12-19',
        dashboard: 0,
        group: 'auto',
        interval: 'week',
        accounts: [5223,2332,343],
        area: [],
        category: [],
        product: [],
        account: null
      }
    });
    expect(result).toEqual({ ...expectedState, filterUpdatedTime: result.filterUpdatedTime });
  });

  test(actions.QUERY_REQUEST, () => {

    expect(reports.initialState.loading).toBeFalsy();

    const result = reducer(reports.initialState, {
      type: actions.QUERY_REQUEST
    });

    expect(result.loading).toBeTruthy();
  });

  test(actions.QUERY_SUCCESS, () => {

    const result = reducer(Object.assign(reports.initialState, { loading: true }), {
      type: actions.QUERY_SUCCESS
    });

    expect(result.loading).toBeFalsy();
  });

  test(actions.QUERY_FAILURE, () => {

    const result = reducer(Object.assign(reports.initialState, { loading: true }), {
      type: actions.QUERY_FAILURE
    });

    expect(result.loading).toBeFalsy();
  });

  const makeDashboardTest = (dashboard) => {

    const result = reducer(reports.initialState, {
      type: actions['QUERY_DASHBOARD_' + dashboard + '_REQUEST'],
      payload: {
        from: '2018-12-12',
        to: '2018-12-19',
        dashboard: 0,
        group: 'auto',
        interval: 'week',
        accounts: [5223,2332,343]
      }
    });


    const result2 = reducer(reports.initialState, {
      type: actions['QUERY_DASHBOARD_' + dashboard + '_SUCCESS'],
      payload: 'https://esmiley.dk'
    });

    const result3 = reducer(reports.initialState, {
      type: actions['QUERY_DASHBOARD_' + dashboard + '_FAILURE'],
      payload: {
        errorCode: 500,
        message: 'Test'
      }
    });
  };

  for (let i in actions) {
    if (i.indexOf('QUERY_DASHBOARD_') === 0 && i.indexOf('_REQUEST') > 0) {
      makeDashboardTest(i.substring(i.indexOf('QUERY_DASHBOARD_') + 16, i.indexOf('_REQUEST')));
    }
  }
});
