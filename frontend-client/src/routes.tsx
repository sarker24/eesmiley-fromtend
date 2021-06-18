import App from 'components/app';
import Dashboard from 'pages/dashboard';
import Auth from 'pages/auth';
import Registration from 'pages/registration';
import Settings from 'pages/settings';
import Project from 'pages/project';
import QuickOverview from 'pages/report/QuickOverview';
import Accounts from 'pages/report/Accounts';
import ReportsOverview from 'report/StartPage';
import { isAuthenticated, requireAuthUtil } from 'utils/auth';
import { decodeJWT } from 'redux/ducks/auth';
import RegistrationFrequency from 'report/RegistrationFrequency';
import FoodWaste from 'report/FoodWaste';
import Advanced from 'report/Advanced';
import { RouteConfig, RouterState, RedirectFunction } from 'react-router';
import ReportPage from 'report';
import loadable from '@loadable/component';
import * as React from 'react';
import LoadingPlaceholder from 'LoadingPlaceholder';
import GuestRegistrationPage from 'pages/registration/GuestRegistrationPage';

export type QueryWithToken = {
  token?: string;
  [other: string]: unknown;
};

export function requireAuth(
  nextState: RouterState<QueryWithToken>,
  replace: RedirectFunction
): void {
  requireAuthUtil(nextState, replace, isAuthenticated, localStorage);
}

// using loadable for  dynamic import, since React.lazy doesnt work
// for some reason (might be due to old react-router + react-redux)
const OldReportPage = loadable(() => import('./pages/reports'), {
  fallback: <LoadingPlaceholder />
});

const redirectHome = (nextState: RouterState<QueryWithToken>, replace: RedirectFunction) => {
  if (nextState.location.query.token) {
    localStorage.setItem('token', `"${nextState.location.query.token}"`);
    const tokenPayload = decodeJWT(nextState.location.query.token);

    if (tokenPayload && tokenPayload.exp) {
      localStorage.setItem('tokenExpiry', String(tokenPayload.exp));
    }
  }

  if (
    (isAuthenticated(localStorage) && localStorage.getItem('token')) ||
    isAuthenticated(localStorage)
  ) {
    replace('/' + nextState.location.search);
  }
};

export default {
  path: '/',
  component: App,

  indexRoute: {
    component: Dashboard,
    onEnter: requireAuth
  },

  childRoutes: [
    {
      path: 'auth',
      component: Auth,
      onEnter: redirectHome
    },
    {
      path: 'registration',
      component: Registration,
      onEnter: requireAuth
    },
    {
      path: 'guest-registration',
      component: GuestRegistrationPage,
      onEnter: requireAuth
    },
    {
      path: 'project',
      component: Project,
      onEnter: requireAuth
    },
    {
      path: 'settings',
      component: Settings,
      onEnter: requireAuth
    },
    {
      path: 'report',
      component: ReportPage,
      onEnter: requireAuth,
      indexRoute: {
        component: ReportsOverview
      },
      childRoutes: [
        {
          path: 'quick-overview',
          component: QuickOverview
        },
        {
          path: 'accounts',
          component: Accounts
        },
        {
          path: 'frequency',
          component: RegistrationFrequency
        },
        {
          path: 'foodwaste(/:basis)',
          component: FoodWaste
        },
        {
          path: 'advanced',
          component: Advanced
        }
      ]
    },
    {
      path: 'reports',
      onEnter: (nextState: RouterState<QueryWithToken>, replace: RedirectFunction) => {
        replace('/reports/foodwaste');
      }
    },
    {
      path: 'reports/:id(/:from/:to)(/:accounts)(/:interval)',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      component: OldReportPage,
      onEnter: requireAuth
    },
    {
      //This has to be at the bottom of the stack else you'll get a 404 error once you visit the page you are setting up
      path: '*',
      status: 404,
      component: Error
    }
  ]
} as RouteConfig;
