import { createSelectorCreator, defaultMemoize } from 'reselect';
import { RootState } from 'redux/rootReducer';
import {
  Account,
  AccountSubscriptions,
  SettingsState,
  StartSlot
} from 'redux/ducks/settings/types';
import isEqual from 'lodash/isEqual';
import { API_DATE_FORMAT } from 'utils/datetime';
import moment from 'moment/moment';

export type ActiveExpectedWeeklyWaste = number;
export type ActiveRegistrationFrequency = number[] | undefined;

function parseAccounts(accounts: Account[], useNickname: boolean) {
  let mappedAccounts: Account[] = [];
  if (useNickname) {
    mappedAccounts = accounts.map((account) => {
      return {
        ...account,
        company: account.company ? account.company : account.name,
        name:
          account.nickname != undefined && account.nickname != null
            ? account.nickname
            : account.company
            ? account.company
            : account.name
      };
    });
  } else {
    mappedAccounts = accounts.map((account) => {
      return {
        ...account,
        company: account.company ? account.company : account.name,
        name: account.company ? account.company : account.name
      };
    });
  }

  return mappedAccounts.sort((a, b) => (a['name'] < b['name'] ? -1 : 1));
}

// depracated
function parseCurrentFromHistory<T>(settings?: { [date: string]: T }): T | undefined {
  if (!settings) {
    return undefined;
  }

  const dates = Object.keys(settings);

  if (dates.length === 0) {
    return undefined;
  }

  const latestDate = dates[dates.length - 1];
  return settings[latestDate];
}

function parseCurrentFromTimeSlots<T extends StartSlot>(timeSlots?: T[]): T | undefined {
  if (!timeSlots || timeSlots.length === 0) {
    return undefined;
  }

  const sortDescByStart = (a: T, b: T) =>
    moment(b.from, API_DATE_FORMAT).valueOf() - moment(a.from, API_DATE_FORMAT).valueOf();

  return timeSlots.sort(sortDescByStart)[0];
}

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);
const settingsSelector = (state: RootState): SettingsState => state.settings;
const getAccounts = createDeepEqualSelector(settingsSelector, (settings) => {
  return parseAccounts(settings.accounts, settings.useAccountNickname);
});

const getHasGuestTypesEnabled = createDeepEqualSelector(
  settingsSelector,
  (settings: SettingsState) => settings.guestTypes && settings.guestTypes.enabled
);

const getSavedFilterSelections = createDeepEqualSelector(
  settingsSelector,
  (settings) => settings.savedFilterSelections
);

const getSubscriptionAccounts = createDeepEqualSelector(
  settingsSelector,
  (settings): AccountSubscriptions => ({
    notSubscribed: parseAccounts(settings.legacy.notSubscribed, settings.useAccountNickname),
    subscribed: parseAccounts(settings.legacy.subscribed, settings.useAccountNickname)
  })
);

const getSettings = createDeepEqualSelector(settingsSelector, (settings) => ({
  ...settings,
  accounts: parseAccounts(settings.accounts, settings.useAccountNickname),
  activeRegistrationsFrequency: parseCurrentFromHistory(settings.registrationsFrequency) || [],
  activeExpectedWeeklyWaste: parseCurrentFromHistory(settings.expectedWeeklyWaste),
  currentExpectedFoodWaste: parseCurrentFromTimeSlots(settings.expectedFoodwaste),
  currentExpectedFoodWastePerGuest: parseCurrentFromTimeSlots(settings.expectedFoodwastePerGuest),
  currentExpectedFrequency: parseCurrentFromTimeSlots(settings.expectedFrequency),
  currentPerGuestBaseline: parseCurrentFromTimeSlots(settings.perGuestBaseline),
  currentPerGuestStandard: parseCurrentFromTimeSlots(settings.perGuestStandard)
}));

export {
  getHasGuestTypesEnabled,
  getSavedFilterSelections,
  getSettings,
  getAccounts,
  getSubscriptionAccounts
};
