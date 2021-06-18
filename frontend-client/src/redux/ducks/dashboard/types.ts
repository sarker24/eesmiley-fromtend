export enum DashboardActionTypes {
  SET_REGISTRATION_FREQUENCY = 'esmiley/dashboard/SET_REGISTRATION_FREQUENCY',
  SET_EXPECTED_WEEKLY_WASTE = 'esmiley/dashboard/SET_EXPECTED_WEEKLY_WASTE',
  SET_PRODUCT_EXPECTED_WEEKLY_WASTE = 'esmiley/dashboard/SET_PRODUCT_EXPECTED_WEEKLY_WASTE',
  SET_IMPROVEMENTS = 'esmiley/dashboard/SET_IMPROVEMENTS',
  SET_TIME_FILTER = 'esmiley/dashboard/SET_TIME_FILTER',
  SET_ACCOUNTS = 'esmiley/dashboard/SET_ACCOUNTS',
  REFRESH = 'esmiley/dashboard/REFRESH',
  REFRESH_SUCCESS = 'esmiley/dashboard/REFRESH_SUCCESS',
  REFRESH_FAILURE = 'esmiley/dashboard/REFRESH_FAILURE',
  SET_AREA_EXPECTED_WEEKLY_WASTE = 'esmiley/dashboard/SET_AREA_EXPECTED_WEEKLY_WASTE'
}

export interface ExpectedWeeklyWaste {
  dataPerAccount: WasteAccountWithPercentage[];
  totalPointAmountWasted: number;
  name: string;
  color: string;
}

export interface FrequencyTrend {
  onTarget: boolean;
  percentage: number;
  periodLabel: string;
}

export interface FrequencyAccount {
  accountId: string;
  frequency: number;
  name: string;
  onTarget: boolean;
  trend: FrequencyTrend[];
}

// Todo: remove NoSettings, adds pointless complexity
export interface Frequency extends NoSettings {
  pointerLocation: number;
  accounts: FrequencyAccount[];
  onTarget?: boolean;
  accountsWithoutSettings?: string[];
}

export interface TimeFilter {
  startDate: string;
  endDate: string;
  interval: string;
}

export interface DashboardChangeFilter {
  dateFilter: TimeFilter;
  accountIds: string[];
}

export interface NoSettings {
  noSettings?: boolean;
}

export interface WasteAccountRegistrationPoint {
  accountId: string;
  amount: number;
  cost: number;
  name: string;
  parentId?: string;
  path?: string;
  registrationPointId: string;
}

export interface WasteAccountTrend {
  actualAmount: number;
  actualCost: number;
  expectedAmount: number;
  periodLabel: string;
}

export interface WasteAccount {
  accountId: string;
  actualAmount: number;
  actualCost: number;
  expectedAmount: number;
  forecastedAmount?: number;
  name: string;
  registrationPoints: WasteAccountRegistrationPoint[];
  trend: WasteAccountTrend[];
}

export interface WasteRegistrationPoint {
  amount: number;
  cost: number;
  name: string;
}

export interface WasteAccountWithPercentage extends WasteAccountRegistrationPoint {
  amountPercentage: number;
}

export interface Waste extends NoSettings {
  accounts: WasteAccount[];
  accountsWithoutSettings: string[];
  registrationPoints: WasteRegistrationPoint[];
  actualAmount: number;
  actualCost: number;
  expectedAmount: number;
  forecastedAmount?: number;
}

export interface ImprovementAccountTrend {
  maxCost: number;
  improvementCost: number;
  periodLabel: string;
}

export interface ImprovementAccount {
  accountId: string;
  actualCost: number;
  averageCost: number;
  expectedWeight: number;
  improvementCost: number;
  forecastedCost?: number;
  maxCost: number;
  name: string;
  trend: ImprovementAccountTrend[];
}

export interface ImprovementMissingDataAccount {
  id: string;
  name: string;
}

export interface Improvement extends NoSettings {
  maxCost: number;
  improvementCost: number;
  forecastedCost?: number;
  accounts: ImprovementAccount[];
  accountsWithoutSettings: string[];
  accountsWithoutRegistrationPoints: ImprovementMissingDataAccount[];
  accountsWithoutEnoughRegs: ImprovementMissingDataAccount[];
}

export interface DashboardState {
  accounts: string[];
  data: {
    frequency: Frequency;
    improvements: Improvement;
    foodWaste: Waste;
    foodWasteProduct?: ExpectedWeeklyWaste;
  };
  refreshing: boolean;
  refreshingFailed: boolean;
  filter: {
    startDate: string;
    endDate: string;
    interval: string;
    timeFilter: string;
  };
}

type SetRegistrationFrequencyAction = {
  type: typeof DashboardActionTypes.SET_REGISTRATION_FREQUENCY;
  payload: Frequency;
};

type SetExpectedWeeklyWasteAction = {
  type: typeof DashboardActionTypes.SET_EXPECTED_WEEKLY_WASTE;
  payload: Waste;
};

type SetProductExpectedWeeklyWaste = {
  type: typeof DashboardActionTypes.SET_PRODUCT_EXPECTED_WEEKLY_WASTE;
  payload: ExpectedWeeklyWaste;
};

type SetImprovementsAction = {
  type: typeof DashboardActionTypes.SET_IMPROVEMENTS;
  payload: Improvement;
};

type SetTimeFilterAction = {
  type: typeof DashboardActionTypes.SET_TIME_FILTER;
  payload: TimeFilter;
};

type SetAccountFilterAction = {
  type: typeof DashboardActionTypes.SET_ACCOUNTS;
  payload: string[];
};

type RefreshDashboardAction = {
  type: typeof DashboardActionTypes.REFRESH;
};

type RefreshDashboardSuccessAction = {
  type: typeof DashboardActionTypes.REFRESH_SUCCESS;
};

type RefreshDashboardFailureAction = {
  type: typeof DashboardActionTypes.REFRESH_FAILURE;
};

export type DashboardActions =
  | SetRegistrationFrequencyAction
  | SetExpectedWeeklyWasteAction
  | SetProductExpectedWeeklyWaste
  | SetImprovementsAction
  | SetTimeFilterAction
  | SetAccountFilterAction
  | RefreshDashboardAction
  | RefreshDashboardSuccessAction
  | RefreshDashboardFailureAction;
