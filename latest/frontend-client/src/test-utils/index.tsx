import React from 'react';
import { AnyAction, applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer, { RootState } from 'redux/rootReducer';
import { mount as enzymeMount, shallow as enzymeShallow } from 'enzyme';
import { IntlProvider } from 'react-intl';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import palette from 'styles/palette';
import theme from 'styles/themes/global';
import ReduxThunk, { ThunkDispatch } from 'redux-thunk';
import ReduxPromise from 'redux-promise';
import { StylesProvider } from '@material-ui/core/styles';
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import messages from '../i18n/en.json';

export { default as DataTransferMock } from './DataTransferMock';

const middleware = [ReduxThunk, ReduxPromise];
const initialRootState: RootState = rootReducer(undefined, {} as AnyAction);
// for consistent class names in testing
// eslint-disable-next-line
const generateClassName = (rule, styleSheet) => `${styleSheet.options.classNamePrefix}-${rule.key}`;

export type MountOptions = {
  initialState?: Partial<RootState>;
  [mountProp: string]: any;
};

export type ShallowOptions = MountOptions & { diveTo?: unknown };

function renderWithProviders(node: React.ReactElement, initialState: any = {}) {
  const store = createStore(rootReducer, initialState, applyMiddleware(...middleware));
  return (
    <Provider store={store}>
      <ThemeProvider theme={createMuiTheme({ ...theme, palette })}>
        <IntlProvider locale='en' defaultLocale='en' messages={messages}>
          <StylesProvider generateClassName={generateClassName}>{node}</StylesProvider>
        </IntlProvider>
      </ThemeProvider>
    </Provider>
  );
}

export function mount(node: React.ReactElement, options: MountOptions = {}) {
  const { initialState, ...mountOptions } = options;
  return enzymeMount(renderWithProviders(node, initialState), mountOptions);
}

export function shallow(node: React.ReactElement, options: ShallowOptions = {}) {
  const { initialState, diveTo, ...mountOptions } = options;
  const wrapper = enzymeShallow(renderWithProviders(node, initialState), mountOptions);

  if (!diveTo) {
    return wrapper;
  }

  let targetNode = wrapper;
  while (targetNode && targetNode.find(diveTo).length !== 1) {
    targetNode = targetNode.dive();
  }

  return targetNode ? targetNode.find(diveTo) : targetNode;
}

interface TypedMockStore
  extends MockStoreEnhanced<
    Partial<RootState>,
    ThunkDispatch<Partial<RootState>, void, AnyAction>
  > {
  getActions(): AnyAction[];
}

export function MockStore(state: Partial<RootState> = {}): TypedMockStore {
  const middlewares = [ReduxThunk, ReduxPromise];
  type DispatchExts = ThunkDispatch<Partial<RootState>, void, AnyAction>;
  return configureMockStore<Partial<RootState>, DispatchExts>(middlewares)({
    ...initialRootState,
    ...state
  });
}
