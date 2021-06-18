import { createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'lodash.isequal';
import translationsForUsersLocale from './translations';
import { RootState } from 'redux/rootReducer';

const getLocale = (state: RootState) => state.ui.locale;

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

// eslint-disable-next-line
export const getMessagesState = createDeepEqualSelector([getLocale], (locale) => ({
  ...translationsForUsersLocale['en'],
  ...translationsForUsersLocale[locale]
}));
