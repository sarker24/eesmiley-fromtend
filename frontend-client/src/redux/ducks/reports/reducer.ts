/*
 * Redux reducer for the Reports (v2)
 */

import actions from './actions';
import moment from 'moment';
import { Project } from 'redux/ducks/projects';

export interface IAction<T, P> {
  readonly type: T;
  readonly payload?: P;
}

export interface IDashboard {
  readonly url: string | null;
  readonly loading: boolean;
  readonly error: boolean;
  readonly success: boolean;
}

export interface IFilterParams {
  from: string;
  to: string;
  interval?: string;
  accounts?: string[];
  account?: string;
  category?: string[];
  product?: string[];
  area?: string[];
}

export interface IState {
  filter: IFilterParams;
  searchCriteria: {};
  loaded: boolean;
  selectedProject?: Project;
  loading: boolean;
  dashboards: {
    registrations: IDashboard;
    projects: IDashboard;
    sales: IDashboard;
  };
  projects: {
    success: boolean;
    error: boolean;
    data: {}[];
    loading: boolean;
  };
  registrationPoints: any;
  filterUpdatedTime?: number;
}

const defaultFilter = {
  from: null,
  to: null,
  interval: null,
  group: 'auto',
  dashboard: 0,
  area: [],
  category: [],
  product: [],
  accounts: [],
  account: null
};

/**
 * Initial state
 * @type {{filter: {from: string; to: string}; loading: boolean; dashboards: {registrations: {url: any; loading: boolean; error: boolean; success: boolean}; projects: {url: any; loading: boolean; error: boolean; success: boolean}; sales: {url: any; loading: boolean; error: boolean; success: boolean}}}}
 */
export const initialState: IState = {
  filter: Object.assign({}, defaultFilter, {
    interval: 'week',
    from: moment().startOf('isoWeek').format('YYYY-MM-DD'),
    to: moment().format('YYYY-MM-DD')
  }),
  searchCriteria: Object.assign({}, defaultFilter),
  selectedProject: null,
  loading: false,
  loaded: false,
  dashboards: {
    registrations: {
      url: null,
      loading: false,
      error: false,
      success: false
    },
    projects: {
      url: null,
      loading: false,
      error: false,
      success: false
    },
    sales: {
      url: null,
      loading: false,
      error: false,
      success: false
    }
  },
  projects: {
    loading: false,
    success: false,
    error: false,
    data: []
  },
  registrationPoints: {
    allById: new Map(),
    allByName: new Map(),
    available: {
      area: [],
      category: [],
      product: []
    }
  }
};

/**
 * Helper function for setting the state of the various dashboards in the report page
 * @param loading
 * @param error
 * @param success
 * @param url
 * @returns {{error: boolean, loading: boolean, success: boolean, url: string}}
 */
const setDashboardState = (loading: boolean, error: boolean, success: boolean, url?: string) => {
  return {
    error: error,
    loading: loading,
    success: success,
    url: url
  };
};

/**
 *
 * @param state
 * @param action
 * @returns Object
 */
const reducer = (
  state: IState = Object.assign({}, initialState),
  action: IAction<string, any> = { type: '' }
) => {
  switch (action.type) {
    case actions.INIT_POINTS: {
      const { allById, allByName } = action.payload;
      const registrationPoints = { ...state.registrationPoints, allById, allByName };
      return { ...state, registrationPoints };
    }

    case actions.QUERY_REPORT_REGISTRATION_POINTS: {
      const available = { ...state.registrationPoints.available, ...action.payload };
      const registrationPoints = { ...state.registrationPoints, available };
      return { ...state, registrationPoints };
    }

    case actions.SET_FILTER: {
      if (action.payload.accounts) {
        if (typeof action.payload.accounts == 'string') {
          action.payload.accounts = action.payload.accounts.split(',');
        }
      }

      const filter = { ...state.filter, ...action.payload };
      return { ...state, filter, filterUpdatedTime: moment().unix() };
    }

    /* Modify filter without changing filterUpdatedTime */
    case actions.MODIFY_FILTER: {
      return { ...state, filter: action.payload };
    }

    case actions.SET_ACCOUNT_IDS: {
      const accounts = action.payload;
      const filter = { ...state.filter, accounts };
      return { ...state, filter };
    }

    case actions.SET_PERIOD: {
      const period = action.payload;
      const filter = { ...state.filter, ...period };
      return { ...state, filter };
    }

    /* Actions for querying dashboards */

    case actions.SET_SEARCH_CRITERIA: {
      const searchCriteria = action.payload;
      return { ...state, searchCriteria };
    }
    case actions.QUERY_REQUEST: {
      return { ...state, loading: true };
    }

    case actions.QUERY_FAILURE:
    case actions.QUERY_SUCCESS: {
      return { ...state, loading: false, loaded: true };
    }

    /* Registrations */
    case actions.QUERY_DASHBOARD_REGISTRATIONS_REQUEST: {
      const registrations = setDashboardState(
        true,
        false,
        false,
        state.dashboards.registrations.url
      );
      const dashboards = { ...state.dashboards, registrations };
      return { ...state, dashboards, loaded: true };
    }
    case actions.QUERY_DASHBOARD_REGISTRATIONS_SUCCESS: {
      const registrations = setDashboardState(false, false, true, action.payload);
      const dashboards = { ...state.dashboards, registrations };
      return { ...state, dashboards, loaded: true };
    }
    case actions.QUERY_DASHBOARD_REGISTRATIONS_FAILURE: {
      const registrations = setDashboardState(false, true, false, '');
      const dashboards = { ...state.dashboards, registrations };
      return { ...state, dashboards, loaded: true };
    }

    /* Projects */
    case actions.QUERY_DASHBOARD_PROJECTS_REQUEST: {
      const projects = setDashboardState(true, false, false, state.dashboards.projects.url);
      const dashboards = { ...state.dashboards, projects };
      return { ...state, dashboards };
    }
    case actions.QUERY_DASHBOARD_PROJECTS_SUCCESS: {
      const projects = setDashboardState(false, false, true, action.payload);
      const dashboards = { ...state.dashboards, projects };
      return { ...state, dashboards };
    }
    case actions.QUERY_DASHBOARD_PROJECTS_FAILURE: {
      const projects = setDashboardState(false, true, false, '');
      const dashboards = { ...state.dashboards, projects };
      return { ...state, dashboards };
    }
    case actions.SET_SELECTED_PROJECT: {
      const selectedProject = action.payload;
      const searchCriteria = {
        ...state.searchCriteria,
        id: selectedProject.id,
        account: selectedProject.customerId
      };
      return { ...state, selectedProject, searchCriteria };
    }

    /* Sales */
    case actions.QUERY_DASHBOARD_SALES_REQUEST: {
      const sales = setDashboardState(true, false, false, state.dashboards.sales.url);
      const dashboards = { ...state.dashboards, sales };
      return { ...state, dashboards };
    }
    case actions.QUERY_DASHBOARD_SALES_SUCCESS: {
      const sales = setDashboardState(false, false, true, action.payload);
      const dashboards = { ...state.dashboards, sales };
      return { ...state, dashboards };
    }
    case actions.QUERY_DASHBOARD_SALES_FAILURE: {
      const sales = setDashboardState(false, true, false, '');
      const dashboards = { ...state.dashboards, sales };
      return { ...state, dashboards };
    }

    /* Projects query */
    case actions.QUERY_PROJECTS_SUCCESS: {
      const projects = {
        ...state.projects,
        data: action.payload,
        success: true,
        error: false,
        loading: false
      };
      return { ...state, projects };
    }
    case actions.QUERY_PROJECTS_FAILURE: {
      const projects = { ...state.projects, success: false, error: true, loading: false };
      return { ...state, projects };
    }
    case actions.QUERY_PROJECTS_REQUEST: {
      const projects = { ...state.projects, success: false, error: false, loading: true };
      return { ...state, projects };
    }
    case actions.RESET_FILTER: {
      const { allByName, allById } = state.registrationPoints;
      const registrationPoints = { ...initialState.registrationPoints, allByName, allById };
      const searchCriteria = { ...initialState.filter };
      return {
        ...initialState,
        searchCriteria,
        registrationPoints,
        loaded: true
      };
    }
  }

  return state;
};

export default reducer;
