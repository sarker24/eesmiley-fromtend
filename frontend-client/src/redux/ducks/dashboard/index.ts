import { DataTransfer } from 'frontend-core';
import * as errorDispatch from 'redux/ducks/error';
import { AxiosResponse, AxiosError } from 'axios';
import moment from 'moment';
import { getRegistrationPoints } from 'redux/ducks/data/registrationPoints';
import { createHighchartsSeries } from 'redux/ducks/data/highcharts';
import { getPercentageOf } from 'utils/number-format';
import {
  DashboardActions,
  DashboardChangeFilter,
  DashboardState,
  DashboardActionTypes,
  Frequency,
  Waste,
  WasteAccountRegistrationPoint,
  WasteAccountWithPercentage,
  Improvement
} from './types';
import { ApiError, ErrorActions } from 'redux/ducks/error';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { ThunkResult } from 'redux/types';

export * from './types';

export const initialState: DashboardState = {
  data: {
    frequency: {
      pointerLocation: 0,
      accounts: []
    },
    improvements: {
      maxCost: 0,
      improvementCost: 0,
      accounts: [],
      accountsWithoutSettings: [],
      accountsWithoutRegistrationPoints: [],
      accountsWithoutEnoughRegs: []
    },
    foodWaste: {
      actualAmount: 0,
      actualCost: 0,
      expectedAmount: 0,
      accountsWithoutSettings: [],
      accounts: [],
      registrationPoints: []
    },
    foodWasteProduct: null
  },
  filter: {
    startDate: moment().startOf('isoWeek').format('YYYY-MM-DD'),
    endDate: moment().endOf('isoWeek').format('YYYY-MM-DD'),
    interval: 'week',
    timeFilter: `${moment().startOf('isoWeek').isoWeekYear()}.${moment()
      .startOf('isoWeek')
      .format('W')}.${moment().startOf('isoWeek').format('DDD')}`
  },
  accounts: [],
  refreshing: false,
  refreshingFailed: false
};

export default function (state = initialState, action: DashboardActions): DashboardState {
  switch (action.type) {
    case DashboardActionTypes.SET_REGISTRATION_FREQUENCY: {
      return { ...state, data: { ...state.data, frequency: action.payload } };
    }

    case DashboardActionTypes.SET_EXPECTED_WEEKLY_WASTE: {
      return { ...state, data: { ...state.data, foodWaste: action.payload } };
    }

    case DashboardActionTypes.SET_IMPROVEMENTS: {
      return {
        ...state,
        data: { ...state.data, improvements: action.payload }
      };
    }

    case DashboardActionTypes.SET_TIME_FILTER: {
      if (action.payload.interval) {
        switch (action.payload.interval) {
          case 'week':
            action.payload.endDate = moment(action.payload.startDate)
              .endOf('isoWeek')
              .format('YYYY-MM-DD');
            break;
          case 'month':
            action.payload.endDate = moment(action.payload.startDate)
              .endOf('month')
              .format('YYYY-MM-DD');
            break;
          case 'year':
            action.payload.endDate = moment(action.payload.startDate)
              .endOf('year')
              .format('YYYY-MM-DD');
            break;
        }
      }

      return { ...state, filter: { ...state.filter, ...action.payload } };
    }

    case DashboardActionTypes.SET_ACCOUNTS: {
      return { ...state, accounts: action.payload };
    }

    case DashboardActionTypes.SET_PRODUCT_EXPECTED_WEEKLY_WASTE: {
      return {
        ...state,
        data: { ...state.data, foodWasteProduct: action.payload }
      };
    }

    case DashboardActionTypes.REFRESH: {
      return { ...state, refreshing: true, refreshingFailed: false };
    }

    case DashboardActionTypes.REFRESH_SUCCESS: {
      return { ...state, refreshing: false, refreshingFailed: false };
    }

    case DashboardActionTypes.REFRESH_FAILURE: {
      return { ...state, refreshing: false, refreshingFailed: true };
    }

    default: {
      return state;
    }
  }
}

const buildParams = (dashboard: DashboardState) => {
  const accounts = dashboard.accounts;

  const params = {
    start: dashboard.filter.startDate,
    end: dashboard.filter.endDate,
    period: dashboard.filter.interval
  };

  if (accounts.length > 0) {
    params['accounts'] = accounts.join(',');
  }

  return params;
};

const transfer = new DataTransfer();

export const refreshRegistrationFrequency = (): ThunkResult<
  Promise<DashboardActions | ErrorActions>,
  DashboardActions
> => async (dispatch, getStore) => {
  const { settings, dashboard } = getStore();
  if (
    settings.registrationsFrequency == undefined ||
    Object.keys(settings.registrationsFrequency).length == 0
  ) {
    return dispatch({
      type: DashboardActionTypes.SET_REGISTRATION_FREQUENCY,
      payload: {
        ...initialState.data.frequency,
        noSettings: true
      }
    });
  }

  const params = buildParams(dashboard);

  try {
    const response = (await transfer.get(
      '/foodwaste/registrations/frequency',
      { params },
      true
    )) as AxiosResponse<Frequency>;

    return dispatch({
      type: DashboardActionTypes.SET_REGISTRATION_FREQUENCY,
      payload: response.data
    });
  } catch (err: unknown) {
    const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
    return dispatch(errorDispatch.showError(errorCode, message));
  }
};

export const refreshExpectedWeeklyWaste = (): ThunkResult<
  Promise<DashboardActions | ErrorActions>,
  DashboardActions
> => async (dispatch, getStore) => {
  const { settings, dashboard } = getStore();
  if (
    settings.expectedWeeklyWaste == undefined ||
    Object.keys(settings.expectedWeeklyWaste).length == 0
  ) {
    return dispatch({
      type: DashboardActionTypes.SET_EXPECTED_WEEKLY_WASTE,
      payload: {
        ...initialState.data.foodWaste,
        noSettings: true
      }
    });
  }

  const params = buildParams(dashboard);

  try {
    const response = await transfer.get('/foodwaste/registrations/waste', { params }, true);
    // TODO at api: wasteful to parse integers, response contains also duplicated data (ids)
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    /* eslint-disable @typescript-eslint/no-unsafe-return */
    const waste: Waste = {
      accountsWithoutSettings: response.data.accountsWithoutSettings,
      accounts: response.data.accounts.map((account) => ({
        ...account,
        actualAmount: parseInt(account.actualAmount),
        actualCost: parseInt(account.actualCost),
        expectedAmount: parseInt(account.expectedAmount),
        forecastedAmount: account.forecastedAmount ? parseInt(account.forecastedAmount) : undefined,
        trend: account.trend.map((t) => ({
          ...t,
          actualAmount: parseInt(t.actualAmount),
          actualCost: parseInt(t.actualCost),
          expectedAmount: parseInt(t.expectedAmount)
        })),
        registrationPoints: account.registrationPoints.map((r) => ({
          ...r,
          amount: parseInt(r.amount),
          cost: parseInt(r.cost)
        }))
      })),
      registrationPoints: response.data.registrationPoints.map((p) => ({
        name: p.name,
        cost: parseInt(p.cost),
        amount: parseInt(p.amount)
      })),
      actualAmount: parseInt(response.data.actualAmount),
      actualCost: parseInt(response.data.actualCost),
      expectedAmount: parseInt(response.data.expectedAmount),
      forecastedAmount: response.data.forecastedAmount
        ? parseInt(response.data.forecastedAmount)
        : undefined
    };
    return dispatch({
      type: DashboardActionTypes.SET_EXPECTED_WEEKLY_WASTE,
      payload: waste
    });
  } catch (err: unknown) {
    const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
    return dispatch(errorDispatch.showError(errorCode, message));
  }
};

// TODO selector
export const selectProductSpecificExpectedWeeklyWaste = (
  selectedRegPoint: RegistrationPoint,
  color?: string
): ThunkResult<DashboardActions, DashboardActions> => (dispatch, getStore) => {
  const {
    dashboard,
    data: {
      registrationPoints: { registrationPointsMap }
    }
  } = getStore();
  const waste = dashboard.data.foodWaste;
  const selectedPathIds = [
    ...(selectedRegPoint.path ? selectedRegPoint.path.split('.') : []),
    selectedRegPoint.id
  ];
  const selectedPathNames = selectedPathIds.map((id) => registrationPointsMap.get(id).name);
  let totalAmount = 0;

  const dataPerAccount: WasteAccountRegistrationPoint[] = waste.accounts.map((account) => {
    const { name } = account;
    const registrationPoint = account.registrationPoints.find((point) => {
      const pathIds = [...(point.path ? point.path.split('.') : []), point.registrationPointId];
      const pathNames = pathIds.map((id) => registrationPointsMap.get(id).name);

      return (
        selectedPathNames.length === pathNames.length &&
        selectedPathNames.every((name, index) => pathNames[index] === name)
      );
    });

    if (registrationPoint) {
      totalAmount += registrationPoint.amount;
    }

    return {
      ...registrationPoint,
      name,
      amount: registrationPoint ? registrationPoint.amount : 0
    };
  });

  const datePerAccountWithPercentage: WasteAccountWithPercentage[] = dataPerAccount.map(
    (account) => {
      const { amount } = account;
      const amountPercentage = getPercentageOf(amount, totalAmount);

      return { ...account, amountPercentage };
    }
  );

  return dispatch({
    type: DashboardActionTypes.SET_PRODUCT_EXPECTED_WEEKLY_WASTE,
    payload: {
      dataPerAccount: datePerAccountWithPercentage,
      totalPointAmountWasted: totalAmount,
      name: selectedRegPoint.name,
      color
    }
  });
};

export const refreshImprovements = (): ThunkResult<
  Promise<DashboardActions | ErrorActions>,
  DashboardActions
> => async (dispatch, getStore) => {
  const { settings, dashboard } = getStore();
  if (
    settings.expectedWeeklyWaste == undefined ||
    Object.keys(settings.expectedWeeklyWaste).length == 0
  ) {
    return dispatch({
      type: DashboardActionTypes.SET_IMPROVEMENTS,
      payload: {
        ...initialState.data.improvements,
        noSettings: true
      }
    });
  }

  const params = buildParams(dashboard);

  try {
    const response = (await transfer.get(
      '/foodwaste/registrations/improvements',
      { params },
      true
    )) as AxiosResponse<Improvement>;
    return dispatch({ type: DashboardActionTypes.SET_IMPROVEMENTS, payload: response.data });
  } catch (err: unknown) {
    const { errorCode, message } = (err as AxiosError<ApiError>).response.data;

    return dispatch(errorDispatch.showError(errorCode, message));
  }
};

export const refresh = (): ThunkResult<Promise<DashboardActions>, DashboardActions> => async (
  dispatch,
  getStore
) => {
  const accounts = getStore().dashboard.accounts;
  const params = {
    includeSoftDeleted: false,
    accounts: accounts.length > 0 ? accounts.join(',') : null
  };

  try {
    dispatch({ type: DashboardActionTypes.REFRESH });
    await dispatch(refreshRegistrationFrequency());
    await dispatch(refreshExpectedWeeklyWaste());
    await dispatch(refreshImprovements());
    await dispatch(getRegistrationPoints(params));
    dispatch(createHighchartsSeries());
    return dispatch({ type: DashboardActionTypes.REFRESH_SUCCESS });
  } catch (error: unknown) {
    return dispatch({
      type: DashboardActionTypes.REFRESH_FAILURE
    });
  }
};

export const changeFilter = (
  filter: DashboardChangeFilter
): ThunkResult<Promise<DashboardActions[]>, DashboardActions> => async (dispatch) => {
  return await Promise.all([
    dispatch({
      type: DashboardActionTypes.SET_TIME_FILTER,
      payload: filter.dateFilter
    }),
    dispatch({
      type: DashboardActionTypes.SET_ACCOUNTS,
      payload: filter.accountIds
    }),
    dispatch(refresh())
  ]);
};
