import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'lodash/isEqual';
import { RootState } from 'redux/rootReducer';

const editorSelector = (state: RootState) => state.guestRegistrations.editor;
const historySelector = (state: RootState) => state.guestRegistrations.history;
const guestRegistrationSelector = (state: RootState) => state.guestRegistrations.byId;

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

const getCurrentEditorItems = createSelector(
  editorSelector,
  ({ currentDate, idsByDate }) => idsByDate[currentDate] || []
);

const getEditorRegistrations = createDeepEqualSelector(
  getCurrentEditorItems,
  guestRegistrationSelector,
  (editorItemIds, items) => editorItemIds.map((id) => items[String(id)])
);

const getHistoryRegistrations = createDeepEqualSelector(
  historySelector,
  guestRegistrationSelector,
  (historyItemIds, items) => historyItemIds.map((id) => items[String(id)])
);

export { getEditorRegistrations, getHistoryRegistrations };
