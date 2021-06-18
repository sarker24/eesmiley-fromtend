import { DataStorage, DataTransfer } from 'frontend-core';
import { AxiosError, AxiosResponse } from 'axios';
import * as errorDispatch from 'redux/ducks/error';
import { setFormatting } from 'utils/number-format';
import moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import _pick from 'lodash/pick';
import {
  SettingsActionTypes,
  GuestSettings,
  AccountSubscriptions,
  SavedFilterSelection,
  SavedSettings,
  SettingsActions,
  SettingsState
} from 'redux/ducks/settings/types';
import * as guestRegistrationActions from 'redux/ducks/guestRegistrations';
import { AnyAction } from 'redux';
import { ApiError, ErrorActions } from 'redux/ducks/error/types';
import { ThunkResult } from 'redux/types';

export * from './types';
export * from './selectors';

const transfer = new DataTransfer();
const store = new DataStorage();

const SAVED_FIELDS = [
  'currency',
  'unit',
  'database',
  'mandatory',
  'categoriesHidden',
  'lastUpload',
  'showDeactivatedAreas',
  'bootstrapData',
  'languageBootstrapData',
  // deprecated
  'expectedWeeklyWaste',
  'registrationsFrequency',
  'sound',
  'useAccountNickname',
  'alarms',
  'accounts',
  'allowRegistrationsOnAnyPoint',
  'guestTypes',
  'enableGuestRegistrationFlow',
  'canUseBluetooth',
  'savedFilterSelections',
  'bootstrapTemplateId',
  'expectedFoodwaste',
  'expectedFoodwastePerGuest',
  'expectedFrequency',
  'perGuestBaseline',
  'perGuestStandard',
  'enableRegistrationComments',
  'hasEsmileyScale',
  'hasEsmileyScaleConfirmed'
];

export const initialState: SettingsState = {
  bootstrapData: undefined,
  languageBootstrapData: undefined,
  allowRegistrationsOnAnyPoint: false,
  // SAVED
  currency: 'DKK',
  unit: 'kg',
  database: '',
  mandatory: [],
  categoriesHidden: false,
  showDeactivatedAreas: false,
  sound: { enabled: true },
  canUseBluetooth: true,
  // EXTRA
  unitList: ['kg'],
  currentFilter: 'basic',
  isInitial: true,
  firstTimeNoSettings: true,
  // deprecated, do not use
  registrationsFrequency: {},
  // deprecated, do not use
  expectedWeeklyWaste: {},
  accounts: [],
  useAccountNickname: false,
  alarms: {
    enabled: false,
    message: '',
    executionTime: '0',
    zone: momentTimezone.tz.guess(),
    recipients: []
  },
  savedFilterSelections: [],
  legacy: {
    subscribed: [],
    notSubscribed: []
  },
  expectedFoodwaste: undefined,
  expectedFoodwastePerGuest: undefined,
  expectedFrequency: undefined,
  perGuestBaseline: undefined,
  perGuestStandard: undefined
};

export default function reducer(
  state: SettingsState = initialState,
  action: SettingsActions
): SettingsState {
  switch (action.type) {
    case SettingsActionTypes.UPDATE_SAVED: {
      const { payload } = action;

      const locale = moment.locale();
      setFormatting(locale, payload);

      return { ...state, ...payload, isInitial: false, firstTimeNoSettings: false };
    }

    case SettingsActionTypes.FETCH: {
      const { payload } = action;
      // no settings returns [], otherwise object.
      // should fix this to be consistent and return empty object
      const hasNoSettings = Array.isArray(payload) && payload.length === 0;

      const locale = moment.locale();
      const currency = hasNoSettings ? initialState.currency : payload.currency;

      setFormatting(locale, { ...payload, currency });

      return {
        ...state,
        ...payload,
        currency,
        isInitial: false,
        firstTimeNoSettings: hasNoSettings
      };
    }

    case SettingsActionTypes.UPDATE_EXTRA: {
      const { payload } = action;
      return { ...state, ...payload, isInitial: false };
    }

    case SettingsActionTypes.UPDATE_KEY: {
      const { payload } = action;
      return {
        ...state,
        [payload.key]: payload.value
      };
    }

    // todo selector for derived state
    case SettingsActionTypes.FETCH_LEGACY_ACCOUNTS: {
      return {
        ...state,
        legacy: action.payload,
        isInitial: false
      };
    }

    default:
      return state;
  }
}

export function updateFilter(filter: string): SettingsActions {
  return {
    type: SettingsActionTypes.UPDATE_EXTRA,
    payload: { currentFilter: filter }
  };
}

async function fetchSavedSettings(): Promise<SavedSettings> {
  const token = store.getData('token') as string;
  // todo requires fixing core.store api; doesnt make sense to stringify primitives
  // eslint-disable-next-line
  transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const response = (await transfer.get(`/foodwaste/settings`)) as AxiosResponse<SavedSettings>;

  return response.data;
}

export function fetch(): ThunkResult<Promise<SettingsActions | ErrorActions>, SettingsActions> {
  return async (dispatch) => {
    try {
      const savedSettings = await fetchSavedSettings();
      return dispatch({
        type: SettingsActionTypes.FETCH,
        payload: savedSettings
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

// should be embedded in settings/accountId response
export function fetchLegacyAccounts(
  accountId: number
): ThunkResult<Promise<SettingsActions | ErrorActions>, SettingsActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // todo requires fixing core.store api; doesnt make sense to stringify primitives
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = (await transfer.get(
        `/foodwaste/settings/${accountId}/accounts`
      )) as AxiosResponse<AccountSubscriptions>;
      return dispatch({
        type: SettingsActionTypes.FETCH_LEGACY_ACCOUNTS,
        payload: response.data
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

export function update(
  data: Partial<SavedSettings>
): ThunkResult<Promise<SettingsActions | ErrorActions>, SettingsActions> {
  return async (dispatch, getState) => {
    /*
     * Pick only saved settings
     */
    const currentSettings = _pick(getState().settings, SAVED_FIELDS) as SavedSettings;
    const nextSettings = Object.assign(
      {},
      currentSettings,
      _pick(data, SAVED_FIELDS)
    ) as SavedSettings;

    try {
      const response = (await transfer.post(`/foodwaste/settings`, {
        settings: nextSettings
      })) as AxiosResponse<SavedSettings>;
      return dispatch({
        type: SettingsActionTypes.UPDATE_SAVED,
        payload: response.data
      });
    } catch (error: unknown) {
      const { errorCode, message } = (error as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

// todo: there should be no need to prefetch when updating?
export function fetchAndUpdate(
  data: Partial<SavedSettings>,
  // to do remove this handler
  transformHandler?: (
    afterUpdate: SavedSettings,
    beforeUpdate?: SavedSettings
  ) => Partial<SavedSettings>
): ThunkResult<Promise<SettingsActions | ErrorActions>, SettingsActions> {
  return async (dispatch) => {
    try {
      const beforeUpdate = await fetchSavedSettings();
      const afterUpdate = { ...beforeUpdate, ...data };
      const nextSavedSettings = transformHandler
        ? transformHandler(afterUpdate, beforeUpdate)
        : afterUpdate;

      return dispatch(update(nextSavedSettings));
    } catch (error: unknown) {
      const { errorCode, message } = (error as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

export function updateKey(
  key: keyof SavedSettings,
  value: SavedSettings[keyof SavedSettings]
): ThunkResult<Promise<SettingsActions>, SettingsActions> {
  return async (dispatch) => {
    // optimistically updating value first in state
    dispatch({
      type: SettingsActionTypes.UPDATE_KEY,
      payload: {
        key: key,
        value: value
      }
    });

    const response = (await transfer.get('/foodwaste/settings')) as AxiosResponse<SavedSettings>;
    const savedSettings = _pick(response.data, SAVED_FIELDS);
    const result = (await transfer.post('/foodwaste/settings', {
      settings: { ...savedSettings, [key]: value }
    })) as AxiosResponse<SavedSettings>;

    return dispatch({
      type: SettingsActionTypes.UPDATE_KEY,
      payload: {
        key,
        value: result.data[key]
      }
    });
  };
}

// TODO fix action type
export function setGuestSettings(settings: GuestSettings): ThunkResult<Promise<any>, AnyAction> {
  return async (dispatch) => {
    await dispatch(update(settings));
    return dispatch(guestRegistrationActions.reset());
  };
}

export function changeSavedSelections(
  savedFilterSelections: SavedFilterSelection[]
): ThunkResult<Promise<SettingsActions | ErrorActions>, SettingsActions> {
  return (dispatch) => {
    return dispatch(update({ savedFilterSelections }));
  };
}
