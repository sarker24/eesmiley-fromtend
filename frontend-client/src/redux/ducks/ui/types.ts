import { StoreHelpers } from 'react-joyride';
import { Credentials } from 'redux/ducks/auth';
import * as React from 'react';

export type Modal = {
  visible?: boolean;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  content: React.ReactNode | React.ReactNode[];
  className?: string;
  fullBleed?: boolean;
  disablePadding?: boolean;
};

export type Module = {
  icon: string;
  name: string;
  url: string;
};

export type ModuleLink = {
  label: string;
  link: string;
  icon: string;
};

export interface UiState {
  isMenuOpen: boolean;
  modal: Modal;
  modules: Module[];
  pages: {
    report: {
      currentTab: number;
    };
  };
  introWizard: StoreHelpers;
  locale: string;
  isMenuPinned: boolean;
  credentials: {
    dealNumber: string;
    username: string;
    password: string;
  };
  introWizardDisplayed: { [accountId: string]: boolean };
  isScreenLocked: boolean;
}

export enum UiActionTypes {
  SHOW_MENU = 'esmiley/ui/SHOW_MENU',
  HIDE_MENU = 'esmiley/ui/HIDE_MENU',
  TOGGLE_MENU = 'esmiley/ui/TOGGLE_MENU',
  TOGGLE_MENU_PINNING = 'esmiley/ui/TOGGLE_MENU_PINNING',
  GET_SELECTOR_ITEMS = 'esmiley/ui/GET_SELECTOR_ITEMS',
  CLEAR_SELECTOR_ITEMS = 'esmiley/ui/CLEAR_SELECTOR_ITEMS',
  HANDLE_CREDENTIALS = 'esmiley/ui/HANDLE_CREDENTIALS',
  SHOW_MODAL = 'esmiley/ui/SHOW_MODAL',
  HIDE_MODAL = 'esmiley/ui/HIDE_MODAL',
  CHANGE_LOCALE = 'esmiley/ui/CHANGE_LOCALE',
  SET_INTRO_WIZARD_STORE = 'esmiley/ui/SET_INTRO_WIZARD_STORE',
  MARK_INTRO_WIZARD_AS_DISPLAYED = 'esmiley/ui/MARK_INTRO_WIZARD_AS_DISPLAYED',
  TOGGLE_SCREEN_LOCK = 'esmiley/ui/TOGGLE_LOCK_SCREEN'
}

type ShowMenuAction = {
  type: typeof UiActionTypes.SHOW_MENU;
};

type HideMenuAction = {
  type: typeof UiActionTypes.HIDE_MENU;
};

type ToggleMenuAction = {
  type: typeof UiActionTypes.TOGGLE_MENU;
};

type ShowModalAction = {
  type: typeof UiActionTypes.SHOW_MODAL;
  payload: Modal;
};

type HideModalAction = {
  type: typeof UiActionTypes.HIDE_MODAL;
};

type ChangeLocaleAction = {
  type: typeof UiActionTypes.CHANGE_LOCALE;
  payload: string;
};

type ToggleMenuPinAction = {
  type: typeof UiActionTypes.TOGGLE_MENU_PINNING;
  payload: boolean;
};

type GetSelectorItemsAction = {
  type: typeof UiActionTypes.GET_SELECTOR_ITEMS;
  payload: Module[];
};

type ClearSelectorItemsAction = {
  type: typeof UiActionTypes.CLEAR_SELECTOR_ITEMS;
};

type HandleCredentialsAction = {
  type: typeof UiActionTypes.HANDLE_CREDENTIALS;
  payload: Credentials;
};

// todo remove this
type SetIntroWizardStoreAction = {
  type: typeof UiActionTypes.SET_INTRO_WIZARD_STORE;
  payload: StoreHelpers;
};

type ToggleScreenLockAction = {
  type: typeof UiActionTypes.TOGGLE_SCREEN_LOCK;
  payload: boolean;
};

type SetIntroWizardDisplayedAction = {
  type: typeof UiActionTypes.MARK_INTRO_WIZARD_AS_DISPLAYED;
  payload: { [accountId: string]: boolean };
};

export type UiActions =
  | ShowMenuAction
  | HideMenuAction
  | ToggleMenuAction
  | ShowModalAction
  | HideModalAction
  | ChangeLocaleAction
  | ToggleMenuPinAction
  | GetSelectorItemsAction
  | ClearSelectorItemsAction
  | HandleCredentialsAction
  | SetIntroWizardStoreAction
  | ToggleScreenLockAction
  | SetIntroWizardDisplayedAction;
