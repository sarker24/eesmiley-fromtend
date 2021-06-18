import { combineReducers } from 'redux';
import registrations from './registrations';
import registrationPoints from './registrationPoints';
import highcharts from './highcharts';

const reducer = combineReducers({
  registrations,
  registrationPoints,
  highcharts
});

export default reducer;
