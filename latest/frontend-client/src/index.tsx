import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { browserHistory } from 'react-router';
import App, { AppProps } from './root';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import rootReducer from 'redux/rootReducer';
import { createTracker } from 'redux-segment';
import { syncHistoryWithStore } from 'react-router-redux';
import ReduxThunk from 'redux-thunk';
import ReduxPromise from 'redux-promise';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
const tracker = createTracker();

const middlewares = [ReduxThunk, ReduxPromise, tracker];

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(...middlewares)));
const history = syncHistoryWithStore(browserHistory, store);

const render = (Component: React.ComponentType<AppProps>) => {
  ReactDOM.render(
    <AppContainer>
      <Component store={store} history={history} />
    </AppContainer>,
    document.getElementById('react-app')
  );
};

render(App);

if (module.hot) {
  // HRM for parent module
  module.hot.accept('./root', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-var-requires
    const NextUpdate = require('./root').default as React.ComponentClass<AppProps>;
    render(NextUpdate);
  });
}

// Pressing "ENTER" will either cause form submission or tabbing to next input field
document.body.addEventListener('keypress', function (e: HTMLElementEventMap['keypress']) {
  if (
    e.key !== 'Enter' ||
    e.shiftKey ||
    (e.target && e.target instanceof HTMLTextAreaElement) ||
    !(e.target as HTMLFormElement).form
  )
    return;

  let lastElement;
  // ts seems to be missing form submit event
  const form = (e.target as HTMLElement & { form: HTMLFormElement }).form;

  if (!form.dataset.shouldSubmitOnEnter) {
    for (let i = form.length - 1; i >= 0; i--) {
      const element = form[i] as HTMLFieldSetElement;
      if ((element.type != 'button' && element.type != 'submit') || element.dataset.inputBtn) {
        lastElement = form[i];
        break;
      }
    }
  }
  if (lastElement === e.target || form.dataset.shouldSubmitOnEnter) {
    for (let y = 0; y < form.length; y++) {
      const element = form[y] as HTMLFieldSetElement;
      if (element.type == 'submit') {
        element.click();
        e.preventDefault();
        return;
      }
    }

    form.dispatchEvent(new Event('submit'));
    e.preventDefault();
  } else {
    for (let i = 0; i < form.length - 1; i++) {
      if (form[i] === e.target) {
        for (let y = i + 1; y < form.length; y++) {
          const element = form[y] as HTMLFieldSetElement;
          if (
            (element.type != 'button' && element.type != 'submit') ||
            (element.className != 'helpIconBtn' && element.className != 'removeBtn')
          ) {
            element.focus();
            e.preventDefault();
            break;
          } else if (element.dataset.inputBtn) {
            element.click();
            e.preventDefault();
            break;
          }
        }
        break;
      }
    }
  }
});
