import { DataTransfer, DataStorage } from 'frontend-core';
import { AxiosError, AxiosResponse } from 'axios';
import moment from 'moment';
import * as Highcharts from 'highcharts';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'lodash/isEqual';
import { setFormatting } from 'utils/number-format';
import { UiState, UiActionTypes, Modal, UiActions, Module, ModuleLink } from './types';
import { ThunkResult } from 'redux/types';
import { RootState } from 'redux/rootReducer';
import { ApiError, ErrorActions, showError } from 'redux/ducks/error';
import { StoreHelpers } from 'react-joyride';
import { Credentials } from 'redux/ducks/auth';

export * from './types';

const storage = new DataStorage();
const isMenuPinned = getMenuPinnedFlag();
const locale: string =
  storage && storage.getData('locale') ? (storage.getData('locale') as string) : 'en';

function getMenuPinnedFlag(): boolean {
  if (!storage) {
    return true;
  }

  const isPinnedFlag = storage.getData('isMenuPinned') as number | undefined;

  return isPinnedFlag !== 0;
}

moment.locale(locale);
Highcharts.setOptions({
  lang: {
    months: moment.months(),
    weekdays: moment.weekdays(),
    shortMonths: moment.monthsShort()
  }
});

export const initialState: UiState = {
  isMenuOpen: isMenuPinned,
  modal: {
    visible: null,
    title: null,
    content: null,
    className: null,
    fullBleed: null
  },
  modules: [],
  pages: {
    report: {
      currentTab: 0
    }
  },
  introWizard: null,
  locale: locale,
  isMenuPinned: isMenuPinned,
  credentials: {
    dealNumber: '',
    username: '',
    password: ''
  },
  introWizardDisplayed:
    (storage.getData('introWizardDisplayed') as { [accountId: string]: boolean }) || {},
  isScreenLocked: false
};

const transfer = new DataTransfer();

export default function reducer(state: UiState = initialState, action: UiActions): UiState {
  switch (action.type) {
    case UiActionTypes.SHOW_MENU: {
      return { ...state, isMenuOpen: true };
    }
    case UiActionTypes.HANDLE_CREDENTIALS: {
      // todo: check that we dont store passwords
      return { ...state, credentials: action.payload };
    }

    case UiActionTypes.HIDE_MENU: {
      return { ...state, isMenuOpen: false };
    }

    case UiActionTypes.TOGGLE_MENU: {
      return { ...state, isMenuOpen: !state.isMenuOpen };
    }

    case UiActionTypes.TOGGLE_MENU_PINNING: {
      return { ...state, isMenuPinned: action.payload };
    }

    case UiActionTypes.SHOW_MODAL: {
      return { ...state, modal: { ...action.payload, visible: true } };
    }

    case UiActionTypes.HIDE_MODAL: {
      return {
        ...state,
        modal: {
          ...state.modal,
          visible: false,
          content: null
        }
      };
    }

    case UiActionTypes.GET_SELECTOR_ITEMS: {
      return { ...state, modules: action.payload };
    }

    case UiActionTypes.CLEAR_SELECTOR_ITEMS: {
      return { ...state, modules: initialState.modules };
    }

    case UiActionTypes.CHANGE_LOCALE: {
      return { ...state, locale: action.payload };
    }

    case UiActionTypes.SET_INTRO_WIZARD_STORE: {
      return { ...state, introWizard: action.payload };
    }

    case UiActionTypes.MARK_INTRO_WIZARD_AS_DISPLAYED: {
      return { ...state, introWizardDisplayed: action.payload };
    }

    case UiActionTypes.TOGGLE_SCREEN_LOCK: {
      return { ...state, isScreenLocked: action.payload };
    }

    default:
      return state;
  }
}

export function showMenu(): UiActions {
  return {
    type: UiActionTypes.SHOW_MENU
  };
}

export function hideMenu(): UiActions {
  return {
    type: UiActionTypes.HIDE_MENU
  };
}

export function toggleMenu(): UiActions {
  return {
    type: UiActionTypes.TOGGLE_MENU
  };
}

export function showModal(modal: Modal): UiActions {
  return {
    type: UiActionTypes.SHOW_MODAL,
    payload: modal
  };
}

export function hideModal(): UiActions {
  return {
    type: UiActionTypes.HIDE_MODAL
  };
}

export function toggleMenuPinning(): UiActions {
  if (storage.getData('isMenuPinned') === 0) {
    storage.setData('isMenuPinned', '1');
  } else {
    // todo fix once setData fixed to accept any data type
    storage.setData('isMenuPinned', '0');
  }

  return {
    type: UiActionTypes.TOGGLE_MENU_PINNING,
    payload: !!(storage.getData('isMenuPinned') as number)
  };
}

export function clearSelectorItems(): UiActions {
  return {
    type: UiActionTypes.CLEAR_SELECTOR_ITEMS
  };
}

export function handleCredentials(payload: Credentials): UiActions {
  return {
    type: UiActionTypes.HANDLE_CREDENTIALS,
    payload
  };
}

export function setIntroWizardStore(payload: StoreHelpers | null): UiActions {
  return {
    type: UiActionTypes.SET_INTRO_WIZARD_STORE,
    payload
  };
}

export function toggleScreenLock(locked: boolean): UiActions {
  return {
    type: UiActionTypes.TOGGLE_SCREEN_LOCK,
    payload: locked
  };
}

export function changeLocale(locale: string): ThunkResult<UiActions, UiActions> {
  return (dispatch, getState) => {
    const { currency, unit } = getState().settings;

    storage.setData('locale', locale);
    moment.locale(locale);
    Highcharts.setOptions({
      lang: {
        months: moment.months(),
        weekdays: moment.weekdays(),
        shortMonths: moment.monthsShort()
      }
    });
    setFormatting(locale, { currency, unit });
    return dispatch({
      type: UiActionTypes.CHANGE_LOCALE,
      payload: locale
    });
  };
}

export function getModuleSelectorItems(): ThunkResult<
  Promise<UiActions | ErrorActions>,
  UiActions
> {
  return async (dispatch) => {
    try {
      const response = (await transfer.get(
        '/system-api/modules',
        {
          baseURL: window['sysvars'].LEGACY_API_URL
        },
        true
      )) as AxiosResponse<Module[]>;

      return dispatch({
        type: UiActionTypes.GET_SELECTOR_ITEMS,
        payload: response.data
      });
    } catch (error: unknown) {
      const { errorCode, message } = (error as AxiosError<ApiError>).response.data;
      return dispatch(showError(errorCode, message));
    }
  };
}

export function lockScreenForDuration(
  durationInMs: number
): ThunkResult<Promise<UiActions>, UiActions> {
  return async (dispatch) => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    dispatch(toggleScreenLock(true));
    await delay(durationInMs);
    return dispatch(toggleScreenLock(false));
  };
}

export function markIntroWizardAsDisplayed(accountId: number): UiActions {
  const introWizardDisplayedHistory = storage.getData('introWizardDisplayed') as {
    [accountId: string]: boolean;
  };

  const introWizardDisplayed: { [accountId: string]: boolean } = {
    ...introWizardDisplayedHistory,
    [accountId]: true
  };
  storage.setData('introWizardDisplayed', introWizardDisplayed);

  return {
    type: UiActionTypes.MARK_INTRO_WIZARD_AS_DISPLAYED,
    payload: introWizardDisplayed
  };
}

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const getModuleLinks = createDeepEqualSelector(
  (state: RootState) => state.auth.token,
  (state: RootState) => state.ui.modules,
  (token: string, modules: Module[]): ModuleLink[] =>
    modules.map((module) => ({
      label: module.name,
      link: `${module.url}&token=${token}`,
      icon: module.icon
    }))
);
