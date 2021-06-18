import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import user from './ducks/user';
import auth from './ducks/auth';
import ui from './ducks/ui';
import registration from './ducks/registration';
import settings from './ducks/settings';
import registrations from './ducks/registrations';
import tips from './ducks/tips';
import projects from './ducks/projects';
import sales from './ducks/sales';
import content from './ducks/content';
import error from './ducks/error';
import notification from './ducks/notification';
import media from './ducks/media';
import data from './ducks/data';
import widgets from './ducks/widgets';
import dashboard from './ducks/dashboard';
import reports from './ducks/reports/reducer';
import charts from './ducks/charts';
import newReports from './ducks/reports-new';
import reportData from './ducks/reportData/';
import guestTypes from './ducks/guestTypes';
import guestRegistrations from './ducks/guestRegistrations';
import dashboardNext from './ducks/dashboardNext';
import tutorials from './ducks/tutorials';

const rootReducer = combineReducers({
  data,
  user,
  auth,
  ui,
  registration,
  settings,
  registrations,
  content,
  tips,
  projects,
  sales,
  error,
  notification,
  media,
  widgets,
  dashboard,
  reports,
  newReports,
  reportData,
  routing: routerReducer,
  charts,
  guestTypes,
  guestRegistrations,
  dashboardNext,
  tutorials
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
