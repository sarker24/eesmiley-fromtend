import * as React from 'react';
import { Router, RouterProps } from 'react-router';
import { Provider } from 'react-redux';
import ConnectedIntlProvider from 'components/connectedIntlProvider';
import rootRoutes from './routes';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { Store } from 'redux';

export interface AppProps {
  store: Store;
  history: RouterProps['history'];
}

const App: React.FunctionComponent<AppProps> = ({ store, history }) => {
  return (
    <Provider store={store}>
      <ConnectedIntlProvider>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Router history={history} routes={rootRoutes} />
        </MuiPickersUtilsProvider>
      </ConnectedIntlProvider>
    </Provider>
  );
};

export default App;
