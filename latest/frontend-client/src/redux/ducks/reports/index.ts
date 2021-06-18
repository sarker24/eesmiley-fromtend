/*
 * Action creators for the Reports (v2)
 */

import { ThunkAction } from 'redux-thunk';
import actions from './actions';
import Cache from './cache';
import * as errorDispatch from 'redux/ducks/error';
import { AxiosResponse, AxiosError } from 'axios';
import { DataTransfer } from 'frontend-core';
import { browserHistory } from 'react-router';
import isEqual from 'lodash/isEqual';

import { multipleAccountsFilterSelector, routeParamsSelector } from './selectors';
import { createMap } from 'utils/helpers';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { Labels, LABELS } from 'utils/labels';
import { recalculatePointHierarchy } from 'utils/label-tree';
import { RegistrationPointsByLabel } from 'redux/ducks/reports-new/selectors';

const cache = new Cache();

export const dashboardIds = {
  FOOD_WASTE: 0,
  PROJECTS: 1,
  SALES: 2
};
export const dashboardKeys = {
  FOOD_WASTE: 'foodwaste',
  PROJECTS: 'projects',
  SALES: 'sales'
};

// refactor out into Api utils or similar
export const endpoints = {
  metabaseRegistrations: '/foodwaste/metabase/registrations',
  metabaseProjects: '/foodwaste/metabase/projects',
  metabaseSales: '/foodwaste/metabase/sales',
  reportRegistrations: '/foodwaste/registrations',
  reportProjects: '/foodwaste/projects',
  registrationPoints: '/foodwaste/registration-points'
};

type ThunkResult<R> = ThunkAction<R, any, null, any>;

export const paramsSerializer = (params) => {
  let parts = [];

  for (let key in params) {
    let val = params[key];
    if (val === null || typeof val === 'undefined') {
      continue;
    }

    if (typeof val == 'object') {
      if (!val.length) {
        continue;
      }
      val = [val.join('|')];
    } else {
      val = [val];
    }

    val.forEach((v) => {
      parts.push(key + '=' + v);
    });
  }

  return parts.join('&');
};

const transfer = new DataTransfer({
  paramsSerializer: paramsSerializer
});

export const initRegistrationPoints = () => {
  return async (dispatch, getState) => {
    const {
      user: { customerId },
      settings: { accounts }
    } = getState();
    const accountIds = accounts.map((account) => account.id);
    const allAccounts = [...accountIds, customerId].join(',');
    const params = { includeSoftDeleted: true, accounts: allAccounts };
    const { data: registrationPoints } = await transfer.get(
      endpoints.registrationPoints,
      {
        params
      },
      true
    );

    const byName = registrationPoints.reduce((nameMap, point) => {
      if (!nameMap.get(point.name)) {
        nameMap.set(point.name, []);
      }
      const ids = nameMap.get(point.name);
      nameMap.set(point.name, [...ids, point.id]);

      return nameMap;
    }, new Map());
    return dispatch({
      type: actions.INIT_POINTS,
      payload: { allById: createMap(registrationPoints), allByName: byName }
    });
  };
};

export const getAvailableRegistrationPoints = () => {
  return async (dispatch, getState) => {
    const { reports } = getState();
    const {
      filter,
      registrationPoints: { allById }
    } = reports;

    const accounts = filter.accounts && filter.accounts.join(',');

    const params = Object.assign(
      {},
      filter.from && { startDate: filter.from },
      filter.to && { endDate: filter.to },
      accounts && { accounts },
      { reportFormat: true }
    );

    const response = await transfer.get(endpoints.reportRegistrations, {
      params
    });

    const idsWithAncestors = response.data.flatMap(({ registrationPoint }) => [
      ...(registrationPoint.path ? registrationPoint.path.split('.') : []),
      registrationPoint.id
    ]);

    const registrationPoints = idsWithAncestors.map((id) => allById.get(id));
    const available = registrationPoints.reduce((labels, current) => {
      if (!labels[current.label]) {
        labels[current.label] = new Set();
      }

      labels[current.label].add(current);
      return labels;
    }, {});

    LABELS.forEach((label) => {
      available[label] = available[label] ? Array.from(available[label]) : [];
    });

    return dispatch({
      type: actions.QUERY_REPORT_REGISTRATION_POINTS,
      payload: available
    });
  };
};

/*
 * After input filter params (period and/or accounts) change,
 * we need to filter out already selected points that might
 * not exist anymore as follows:
 * 1. Map current ids into names and back to ids according to new available points
 * 2. Validate parent-child relations
 * */
const validateSelectedPoints = () => {
  return (dispatch, getState) => {
    const {
      filter,
      registrationPoints: { allById, allByName, available }
    } = getState().reports;

    const afterAvailabilityChange: RegistrationPointsByLabel = LABELS.reduce<RegistrationPointsByLabel>(
      (result, label) => {
        const availableInLabel: RegistrationPoint[] = available[label];
        const currentNamesInLabel = [
          ...new Set(filter[label].map((id) => allById.get(id).name))
        ] as string[];
        const currentNodes: RegistrationPoint[] = currentNamesInLabel
          // @ts-ignore
          .flatMap((name) => allByName.get(name))
          .map((id) => allById.get(id));
        const nextNodes: RegistrationPoint[] = currentNodes.filter((node) =>
          availableInLabel.some((available) => available.id === node.id)
        );
        result[label] = nextNodes;
        return result;
      },
      {} as RegistrationPointsByLabel
    );

    const nextFilter: RegistrationPointsByLabel = recalculatePointHierarchy(
      afterAvailabilityChange
    );

    return dispatch({
      type: actions.SET_FILTER,
      payload: {
        area: nextFilter.area.map((node) => node.id),
        category: nextFilter.category.map((node) => node.id),
        product: nextFilter.product.map((node) => node.id)
      }
    });
  };
};

export const setSelectedPoints = (label: Labels, names: string[]) => {
  return (dispatch, getState) => {
    const {
      reports: {
        filter,
        registrationPoints: { allById, allByName, available }
      }
    } = getState();
    const availableInLabel: RegistrationPoint[] = available[label];
    // @ts-ignore
    const selectedIds: RegistrationPoint[] = names.flatMap((name) =>
      allByName.get(name).map((id) => allById.get(id))
    );
    const selectedNodes: RegistrationPoint[] = selectedIds.filter((selected) =>
      availableInLabel.some((available) => available.id === selected.id)
    );

    const stateAsNodes: RegistrationPointsByLabel = LABELS.reduce<RegistrationPointsByLabel>(
      (state, label) => {
        if (state[label]) {
          return state;
        }
        state[label] = filter[label].map((id) => allById.get(id));
        return state;
      },
      { [label]: selectedNodes } as RegistrationPointsByLabel
    );

    const nextFilter: RegistrationPointsByLabel = recalculatePointHierarchy(stateAsNodes);
    return dispatch({
      type: actions.SET_FILTER,
      payload: {
        area: nextFilter.area.map((node) => node.id),
        category: nextFilter.category.map((node) => node.id),
        product: nextFilter.product.map((node) => node.id)
      }
    });
  };
};

export const setAccounts = (accounts: Array<string>) => {
  return async (dispatch, getState) => {
    const currentCustomerId: string = getState().user.customerId.toString();
    const newAccounts: Array<string> = accounts || [currentCustomerId];
    const currentAccounts: Array<string> = getState().reports.filter.accounts || [];

    if (!isEqual(currentAccounts, newAccounts)) {
      await dispatch({
        type: actions.SET_ACCOUNT_IDS,
        payload: accounts
      });

      await dispatch(getAvailableRegistrationPoints());
      await dispatch(validateSelectedPoints());
      return dispatch(queryProjects());
    }
  };
};

/*
 * Use initial filter (parsed from url) to populate reports data: flow
 * -fetch all registration points
 * -set filter data (projectId, period and accounts)
 * -fetch available registration points based on the filter data
 * -preselect & validate initial registration points
 * -setup project data
 * -invoke search to fetch metabase data
 * */
export const setFilterAndInitReports = (initialFilter) => {
  const { area, category, product, ...filter } = initialFilter;
  return async (dispatch) => {
    await dispatch(initRegistrationPoints());
    await dispatch(initFilter(filter));
    await dispatch(getAvailableRegistrationPoints());
    await dispatch(setSelectedPoints('product', product));
    await dispatch(setSelectedPoints('category', category));
    await dispatch(setSelectedPoints('area', area));
    await dispatch(validateSelectedPoints());
    await dispatch(queryProjects());
    return dispatch(search());
  };
};

export const initFilter = (initialFilter) => {
  return async (dispatch, getState) => {
    const {
      user: { customerId },
      settings: { accounts },
      reports: { filter }
    } = getState();
    const validAccountIds = new Set([
      customerId,
      ...accounts.map((account) => account.id)
    ]) as Set<number>;
    const prevalidAccountFilter = initialFilter.accounts || filter.accounts || [];
    const validAccountFilter = prevalidAccountFilter.filter((accountId) =>
      validAccountIds.has(parseInt(accountId))
    ) as number[];
    const selectedAccounts =
      validAccountFilter.length > 0
        ? validAccountFilter.map((id) => id.toString())
        : ([customerId.toString()] as string[]);
    const nextFilter = { ...filter, ...initialFilter, accounts: selectedAccounts };

    return dispatch({
      type: actions.SET_FILTER,
      payload: nextFilter
    });
  };
};

let timeoutId;

export const setPeriodAndSearch = (period) => {
  return async (dispatch) => {
    await dispatch(setPeriod(period));
    return dispatch(search(period));
  };
};

export const setPeriod = (period) => {
  return async (dispatch) => {
    if (period.from && period.to) {
      await dispatch({
        type: actions.SET_PERIOD,
        payload: period
      });

      await dispatch(getAvailableRegistrationPoints());
      return dispatch(validateSelectedPoints());
    }
  };
};

export const search = (criteria?: {}): ThunkResult<void> => {
  return async (dispatch, getState) => {
    const {
      reports: { searchCriteria, filter }
    } = getState();

    const nextCriteria = criteria ? { ...searchCriteria, ...criteria } : { ...filter };

    await dispatch({
      type: actions.SET_SEARCH_CRITERIA,
      payload: nextCriteria
    });

    return dispatch(query());
  };
};

export const resetFilter = (): ThunkResult<void> => {
  return async (dispatch, getState) => {
    const { routing } = getState();
    cache.persistReportsPath(getState().user.id, null);
    await dispatch({
      type: actions.RESET_FILTER
    });

    if ('/reports/foodwaste' !== routing.locationBeforeTransitions.pathname) {
      browserHistory.push('/reports/foodwaste');
    }

    return dispatch(search());
  };
};

/**
 * Query the metabase with the given parameters
 * @param noRouteUpdate
 * @returns {(dispatch:any, getState:any)=>ThunkResult}
 */
export const query = (noRouteUpdate?: boolean): ThunkResult<void> => {
  return async (dispatch, getState) => {
    await dispatch({
      type: actions.QUERY_REQUEST
    });

    const searchCriteria = Object.assign({}, getState().reports.searchCriteria);
    const dashboard: any = getDashboardById(searchCriteria.dashboard);

    if ((searchCriteria.from == null || searchCriteria.to == null) && dashboard.timeFilter) {
      return;
    }

    if (!noRouteUpdate) {
      await dispatch(updateRouteParams({ persistToCache: true }));
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    timeoutId = setTimeout(() => {
      return new Promise((resolve, reject) => {
        // @ts-ignore
        return resolve(getDashboardById(searchCriteria.dashboard).queryFunc()(dispatch, getState));
      })
        .then((data: any) => {
          dispatch({
            type: actions.QUERY_SUCCESS,
            payload: data
          });
          return data;
        })
        .catch((reason: string) => {
          dispatch({
            type: actions.QUERY_FAILURE,
            payload: reason
          });
          return reason;
        });
    }, 100);
  };
};

/**
 * Helper function for using the DataTransfer class
 * @param endpoint
 * @param params
 * @returns {Promise<T>}
 */
export const requestApi = (endpoint: string, params: {}) => {
  return new Promise((resolve, reject) => {
    transfer
      .get(endpoint, { params })
      .then((resp: AxiosResponse) => {
        const { url } = resp.data;
        resolve(url);
      })
      .catch((err: AxiosError) => {
        reject(err);
      });
  });
};

/**
 * Helper function for when the DataTransfer class fails a request
 * @param dispatch
 * @param actionType
 */
export const onRequestApiError = (dispatch, actionType) => (err: AxiosError) => {
  if (err.response.data) {
    const { errorCode, message } = err.response.data;
    dispatch(errorDispatch.showError(errorCode, message));
    dispatch({
      type: actionType,
      payload: message
    });

    return Promise.reject(err.response.data);
  }

  dispatch({
    type: actionType,
    payload: err.response.status
  });

  return Promise.reject(err.response);
};

/**
 * Get registrations dashboard url
 * @returns {(dispatch:any, getState:any)=>Promise<TResult|string>}
 */
export const queryRegistrationsDashboard = (): ThunkResult<void> => {
  return (dispatch, getState) => {
    const {
      reports: { searchCriteria }
    } = getState();
    const apiParams = multipleAccountsFilterSelector(searchCriteria);

    if (!apiParams.to || !apiParams.from) {
      dispatch({
        type: actions.QUERY_DASHBOARD_REGISTRATIONS_FAILURE
      });
      return Promise.reject(null);
    }

    dispatch({
      type: actions.QUERY_DASHBOARD_REGISTRATIONS_REQUEST,
      payload: apiParams
    });

    const cachedUrl = cache.getCachedUrlByParams('registrations', apiParams);

    if (cachedUrl != null) {
      dispatch({
        type: actions.QUERY_DASHBOARD_REGISTRATIONS_SUCCESS,
        payload: cachedUrl
      });

      return Promise.resolve(cachedUrl);
    } else {
      return requestApi(endpoints.metabaseRegistrations, apiParams)
        .then((url: string) => {
          dispatch({
            type: actions.QUERY_DASHBOARD_REGISTRATIONS_SUCCESS,
            payload: url
          });

          return Promise.resolve(url);
        })
        .catch(onRequestApiError(dispatch, actions.QUERY_DASHBOARD_REGISTRATIONS_FAILURE));
    }
  };
};

/**
 * Get projects dashboard url
 * @returns {(dispatch:any, getState:any)=>Promise<TResult|string>}
 */
export const queryProjectsDashboard = (): ThunkResult<void> => {
  return (dispatch, getState) => {
    let state = Object.assign({}, getState());
    const filter = {
      id: state.reports.searchCriteria.id,
      account: state.reports.searchCriteria.account
    };

    if (filter.id == undefined || filter.account == undefined) {
      dispatch({
        type: actions.QUERY_DASHBOARD_PROJECTS_FAILURE
      });
      return Promise.resolve(null);
    }

    dispatch({
      type: actions.QUERY_DASHBOARD_PROJECTS_REQUEST,
      payload: filter
    });

    const cachedUrl = cache.getCachedUrlByParams('projects', filter);
    if (cachedUrl != null) {
      dispatch({
        type: actions.QUERY_DASHBOARD_PROJECTS_SUCCESS,
        payload: cachedUrl
      });

      return Promise.resolve(cachedUrl);
    } else {
      return requestApi(endpoints.metabaseProjects, filter)
        .then((url: string) => {
          dispatch({
            type: actions.QUERY_DASHBOARD_PROJECTS_SUCCESS,
            payload: url
          });

          return Promise.resolve(url);
        })
        .catch(onRequestApiError(dispatch, actions.QUERY_DASHBOARD_PROJECTS_FAILURE));
    }
  };
};

/**
 * Get sales dashboard url
 * @returns {(dispatch:any, getState:any)=>ThunkResult}
 */
export const querySalesDashboard = (): ThunkResult<void> => {
  return (dispatch, getState) => {
    const filter = multipleAccountsFilterSelector(
      Object.assign({}, getState().reports.searchCriteria)
    );

    if (filter.to == undefined || filter.from == undefined) {
      dispatch({
        type: actions.QUERY_DASHBOARD_SALES_FAILURE
      });
      return Promise.reject(null);
    }

    dispatch({
      type: actions.QUERY_DASHBOARD_SALES_REQUEST,
      payload: filter
    });

    const cachedUrl = cache.getCachedUrlByParams('sales', filter);
    if (cachedUrl != null) {
      dispatch({
        type: actions.QUERY_DASHBOARD_SALES_SUCCESS,
        payload: cachedUrl
      });

      return Promise.resolve(cachedUrl);
    } else {
      return requestApi(endpoints.metabaseSales, filter)
        .then((url: string) => {
          dispatch({
            type: actions.QUERY_DASHBOARD_SALES_SUCCESS,
            payload: url
          });

          return Promise.resolve(url);
        })
        .catch(onRequestApiError(dispatch, actions.QUERY_DASHBOARD_SALES_FAILURE));
    }
  };
};

/**
 * Query projects
 * @returns {(dispatch:any, getState:any)=>Promise<TResult|{}[]>}
 */
export const queryProjects = (): ThunkResult<any> => {
  return async (dispatch, getState) => {
    const filter = multipleAccountsFilterSelector(Object.assign({}, getState().reports.filter));
    await dispatch({
      type: actions.QUERY_PROJECTS_REQUEST,
      payload: filter
    });
    return new Promise((resolve, reject) => {
      transfer
        .get(endpoints.reportProjects, {
          params: {
            accounts: filter.accounts
          }
        })
        .then((resp: AxiosResponse) => {
          resolve(resp.data);
        })
        .catch((err: AxiosError) => {
          dispatch({
            type: actions.QUERY_PROJECTS_FAILURE,
            payload: err.response.data
          });

          reject(err);
        });
    }).then((data: {}[]) => {
      dispatch({
        type: actions.QUERY_PROJECTS_SUCCESS,
        payload: data
      });

      return data;
    });
  };
};

export const tabMap = {
  0: 'foodwaste',
  1: 'projects',
  2: 'sales'
};

export const updateRouteParams = (
  { persistToCache }: { persistToCache: boolean } = { persistToCache: false }
): ThunkResult<any> => {
  return (dispatch, getState) => {
    const {
      reports: {
        searchCriteria: rawCriteria,
        registrationPoints: { allById }
      },
      routing: { locationBeforeTransitions },
      user
    } = getState();
    const dashboardId = tabMap[rawCriteria.dashboard];

    const searchCriteria = LABELS.reduce(
      (result, label) => {
        result[label] = [...new Set(rawCriteria[label].map((id) => allById.get(id).name))];
        return result;
      },
      { ...rawCriteria }
    );

    const basePath = '/reports/' + dashboardId;
    const { path: subPath, search: nextSearch } = routeParamsSelector({
      filter: searchCriteria,
      dashboardId
    });
    const nextPath = basePath + '/' + subPath;

    if (
      locationBeforeTransitions &&
      (nextPath !== locationBeforeTransitions.pathname ||
        nextSearch !== locationBeforeTransitions.search)
    ) {
      browserHistory.push(nextPath + nextSearch);
    }

    if (persistToCache) {
      cache.persistReportsPath(user.id, nextPath + nextSearch);
    }
  };
};

export const setReportsDashboardTab = (dashboard: string) => {
  return async (dispatch) => {
    let tab = 0;

    switch (dashboard) {
      case 'foodwaste':
      case 'registrations':
        tab = 0;
        break;
      case 'projects':
        tab = 1;
        break;
      case 'sales':
        tab = 2;
        break;
    }

    return await dispatch({
      type: 'esmiley/ui/pages/report/UPDATE_TAB',
      payload: tab
    });
  };
};

export const getReportsPath = () => {
  return (dispatch, getState) => {
    return cache.getReportsPath(getState().user.id);
  };
};

/**
 * Settings that define the dashboards
 * @type {{}}
 */
export const dashboardSettings = {
  [dashboardIds.FOOD_WASTE]: {
    id: 0,
    name: 'food_waste',
    queryFunc: queryRegistrationsDashboard,
    timeFilter: true,
    domainFilter: true,
    projectsFilter: false
  },
  [dashboardIds.PROJECTS]: {
    id: 1,
    name: 'projects',
    queryFunc: queryProjectsDashboard,
    timeFilter: false,
    domainFilter: false,
    projectsFilter: true
  },
  [dashboardIds.SALES]: {
    id: 2,
    name: 'report.sales_tab',
    queryFunc: querySalesDashboard,
    timeFilter: true,
    domainFilter: false,
    projectsFilter: false
  }
};

/**
 * Get dashboard by id
 * @param id
 * @returns {any}
 */
export const getDashboardById = (id) => {
  for (let i in dashboardSettings) {
    if (dashboardSettings[i].id == id) {
      return dashboardSettings[i];
    }
  }

  return {
    queryFunc: () => {
      return () => {};
    }
  };
};
