import { RootState } from 'redux/rootReducer';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

export type ThunkResult<Result, ActionType extends Action> = ThunkAction<
  Result,
  RootState,
  undefined,
  ActionType
>;
