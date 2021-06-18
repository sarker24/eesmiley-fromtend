import { MassUnit } from 'utils/number-format';

export const MigrationOps = Object.freeze({
  delete: 'delete',
  nullify: 'nullify',
  useDefault: 'useDefault'
});

export interface MigrationStrategy {
  op: typeof MigrationOps[keyof typeof MigrationOps];
  value?: string;
}

export interface GuestTypeSettings {
  enabled: boolean;
  migrationStrategy: MigrationStrategy;
}

export interface GuestSettings {
  enableGuestRegistrationFlow: boolean;
  guestTypes?: GuestTypeSettings;
}

// deprecated, do not use
export interface RegistrationFrequency {
  [date: string]: number[];
}

// deprecated, do not use
export interface ExpectedWeeklyWaste {
  [date: string]: number;
}

export type FoodwastePeriod = 'day' | 'week' | 'month' | 'year' | 'fixed';
export interface StartSlot {
  from: string;
}

export interface FrequencyTarget {
  days: number[];
}

export interface FrequencyTargetTimeSlot extends FrequencyTarget, StartSlot {}

export interface WasteAmount {
  amount: number;
  unit: MassUnit;
  period: FoodwastePeriod;
}

export interface WasteAmountTimeSlot extends WasteAmount, StartSlot {}

export const WasteTargetKeys = [
  'expectedFoodwaste',
  'expectedFoodwastePerGuest',
  'perGuestBaseline',
  'perGuestStandard'
] as const;

export type WasteTargetKey = typeof WasteTargetKeys[number];

export type WasteTargetState = {
  [K in WasteTargetKey]: WasteAmountTimeSlot[];
};

interface Sound {
  id?: string; // todo number
  fileId?: string;
  url?: string;
  name?: string;
  enabled: boolean;
}

export type SavedFilterSelection = {
  name: string;
  accountIds: string[];
};

export interface Account {
  company?: string;
  name: string;
  nickname?: string;
  settingsAreSet: boolean;
  id: number;
}

export interface AccountSubscriptions {
  subscribed: Account[];
  notSubscribed: Account[];
}

export type Unit = 'kg' | 'lt' | 'g';

export type Alarm = {
  enabled: boolean;
  executionTime: string;
  message: string;
  zone: string;
  recipients: AlarmRecipient[];
};

export type AlarmRecipient = {
  type: 'sms' | 'email';
  name: string;
  value: string;
};

export interface SavedSettings extends WasteTargetState {
  alarms?: Alarm;
  currency: string;
  unit: Unit;
  database?: string; // deprecated?
  mandatory: string[];
  categoriesHidden: boolean; // deprecated
  lastUpload?: number;
  sound?: Sound;
  showDeactivatedAreas: boolean; // deprecated
  registrationsFrequency: RegistrationFrequency;
  expectedWeeklyWaste: ExpectedWeeklyWaste;
  bootstrapData: boolean;
  languageBootstrapData: string;
  accounts?: Account[];
  useAccountNickname: boolean;
  allowRegistrationsOnAnyPoint: boolean;
  guestTypes?: GuestTypeSettings;
  enableGuestRegistrationFlow?: boolean;
  canUseBluetooth: boolean;
  savedFilterSelections: SavedFilterSelection[];
  bootstrapTemplateId?: number;
  expectedFoodwaste: WasteAmountTimeSlot[];
  expectedFoodwastePerGuest: WasteAmountTimeSlot[];
  expectedFrequency: FrequencyTargetTimeSlot[];
  perGuestBaseline: WasteAmountTimeSlot[];
  perGuestStandard: WasteAmountTimeSlot[];
  enableRegistrationComments?: boolean;
  hasEsmileyScale?: boolean;
  // if user keeps getting scale not connected message on registration page,
  // we ask customer again if s/he has a scale, if this flag is false
  hasEsmileyScaleConfirmed?: boolean;
}

export interface ExtraSettings {
  unitList: string[];
  currentFilter: string;
  isInitial: boolean;
  legacy: AccountSubscriptions;
  firstTimeNoSettings: boolean;
}

export type SettingsState = SavedSettings & ExtraSettings;

export enum SettingsActionTypes {
  UPDATE_SAVED = 'esmiley/settings/UPDATE_SAVED',
  FETCH = 'esmiley/settings/FETCH',
  UPDATE_KEY = 'esmiley/settings/UDATE_KEY',
  UPDATE_EXTRA = 'esmiley/settings/UPDATE_EXRA',
  FETCH_LEGACY_ACCOUNTS = 'esmiley/settings/FETC_LEGACY_ACCOUNTS',
  UPDATE_ACCOUNT_NAMES = 'esmiley/settings/UPDATE_ACCOUNT_NAMES'
}

type UpdateFilterAction = {
  type: typeof SettingsActionTypes.UPDATE_EXTRA;
  payload: { currentFilter: string };
};

type FetchAction = {
  type: typeof SettingsActionTypes.FETCH;
  payload: SavedSettings;
};

type FetchLegacyAccountsAction = {
  type: typeof SettingsActionTypes.FETCH_LEGACY_ACCOUNTS;
  payload: AccountSubscriptions;
};

type UpdateAction = {
  type: typeof SettingsActionTypes.UPDATE_SAVED;
  payload: SavedSettings;
};

type UpdateKeyAction = {
  type: typeof SettingsActionTypes.UPDATE_KEY;
  payload: {
    key: keyof SavedSettings;
    value: SavedSettings[keyof SavedSettings];
  };
};

type UpdateAccountNamesAction = {
  type: typeof SettingsActionTypes.UPDATE_ACCOUNT_NAMES;
};

export type SettingsActions =
  | UpdateFilterAction
  | FetchAction
  | FetchLegacyAccountsAction
  | UpdateAction
  | UpdateKeyAction
  | UpdateAccountNamesAction;
