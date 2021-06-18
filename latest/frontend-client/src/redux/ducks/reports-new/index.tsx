/*
 * Report Filter v3
 */
import { DataTransfer } from 'frontend-core';

import moment from 'moment';
import { API_DATE_FORMAT, UI_DATE_FORMAT } from 'utils/datetime';
import { createMap } from 'utils/helpers';
import { LABELS } from 'utils/labels';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { recalculatePointHierarchy } from 'utils/label-tree';
import mergeWith from 'lodash/mergeWith';
import isEqual from 'lodash/isEqual';
import Cache from './cache';
import { browserHistory } from 'react-router';
import debounce from 'lodash/debounce';
import {
  AccountPointFilter,
  AccountPointFilterUpdate,
  Basis,
  CachedFilter,
  Dimension,
  Period,
  RegistrationPointIds,
  RegistrationPoints,
  ReportActions,
  ReportActionTypes,
  ReportFilterState,
  ReportRegistration,
  TimeRange
} from './types';
import { ThunkResult } from 'redux/types';
import { AnyAction } from 'redux';
import { AxiosError, AxiosResponse } from 'axios';
import { ApiError } from 'redux/ducks/error';
import { RegistrationPointsByLabel } from 'redux/ducks/reports-new/selectors';
import { GuestType } from 'redux/ducks/guestTypes';

export * from './types';

export const endpoints = {
  reportRegistrations: '/foodwaste/reports/registrations',
  registrationPoints: '/foodwaste/registration-points',
  guestTypes: '/foodwaste/guest-types'
};

export const DefaultPeriod = 'week';
export const DefaultBasis = 'total';
export const DefaultDimension = 'weight';

const paramsSerializer = (params: { [key: string]: unknown }): string => {
  const parts = [];

  for (const key in params) {
    const val = params[key] as string | string[];
    if (val === null || typeof val === 'undefined') {
      continue;
    }

    const valueArray = Array.isArray(val) ? [val.join(',')] : [val];

    valueArray.forEach((value) => {
      parts.push(`${key}=${value}`);
    });
  }

  return parts.join('&');
};

const transfer = new DataTransfer({
  paramsSerializer: paramsSerializer
});

const cache = new Cache();

// todo: better shape for filters; registration point / account filter containers
// could listen to filter params (time, period, dimension, basis)
// and update the filters, instead of chaning filter update actions here
export const initialState: ReportFilterState = {
  timeRange: {
    from: moment().subtract(1, DefaultPeriod).startOf('isoWeek').format(API_DATE_FORMAT),
    to: moment().subtract(1, DefaultPeriod).endOf('isoWeek').format(API_DATE_FORMAT)
  },
  period: DefaultPeriod,
  dimension: DefaultDimension,
  basis: DefaultBasis,
  guestTypesById: {},
  guestTypeIdsByName: {},
  selectedGuestTypeNames: [],
  registrationPoints: {
    byId: new Map<string, RegistrationPoint>(),
    byName: new Map<string, string[]>()
  },
  filter: {
    order: 'desc',
    accounts: [],
    selectedRegistrationPoints: { area: [], category: [], product: [] },
    availableRegistrationPoints: { area: [], category: [], product: [] },
    registrations: []
  },
  comparisonFilters: [],
  isInitialized: false,
  isInitializing: false,
  loading: true,
  error: null
};

export default function (
  state: ReportFilterState = { ...initialState },
  action: ReportActions
): ReportFilterState {
  switch (action.type) {
    case ReportActionTypes.FILTER_ERROR:
      return { ...state, ...action.payload };
    case ReportActionTypes.FILTER_INIT_REG_POINTS_SUCCESS:
      return { ...state, ...action.payload };
    case ReportActionTypes.FILTER_CHANGE_REQUEST:
      return { ...state, ...action.payload, loading: true };
    case ReportActionTypes.FILTER_CHANGE_SUCCESS:
      return { ...state, ...action.payload, loading: !state.isInitialized };
    case ReportActionTypes.FILTER_INIT_REQUEST:
      return { ...state, isInitialized: false, loading: true, isInitializing: true };
    case ReportActionTypes.FILTER_INIT_SUCCESS:
      return { ...state, isInitialized: true, loading: false, isInitializing: false };
    case ReportActionTypes.FILTER_ADD_COMPARE_SUCCESS:
      return { ...state, comparisonFilters: [...state.comparisonFilters, action.payload] };
    case ReportActionTypes.FILTER_REMOVE_COMPARE_SUCCESS:
      return {
        ...state,
        comparisonFilters: state.comparisonFilters.filter(
          (comparisonFilter, index) => index !== action.payload
        )
      };
    case ReportActionTypes.FILTER_CHANGE_COMPARE_SUCCESS: {
      const { key, filter: filterUpdate } = action.payload;
      const comparisonFilters = state.comparisonFilters.map((filter, index) =>
        index === key ? filterUpdate : filter
      );
      return { ...state, comparisonFilters };
    }
    case ReportActionTypes.FILTER_INIT_GUEST_TYPE_SUCCESS: {
      return {
        ...state,
        ...action.payload
      };
    }
    default:
      return state;
  }
}

export function init(
  initOptions: NestedPartial<ReportFilterState> = {}
): ThunkResult<Promise<ReportActions>, ReportActions> {
  return async (dispatch, getState) => {
    dispatch({ type: ReportActionTypes.FILTER_INIT_REQUEST });
    const reportFilter: ReportFilterState = getState().newReports;
    const { customerId } = getState().user;
    const { accounts } = getState().settings;
    const validAccountIds = new Set([customerId, ...accounts.map((account) => account.id)]);
    const { filter = {}, ...rest } = initOptions;
    const selectedAccounts = filter.accounts
      ? filter.accounts.filter((id) => validAccountIds.has(parseInt(id)))
      : [];

    const initialFilter = {
      ...filter,
      accounts: selectedAccounts.length > 0 ? selectedAccounts : [customerId.toString()]
    };

    const baseFilters = {
      timeRange: (rest.timeRange || reportFilter.timeRange) as TimeRange,
      period: rest.period || reportFilter.period,
      basis: rest.basis || reportFilter.basis,
      dimension: rest.dimension || reportFilter.dimension
    };

    dispatch({ type: ReportActionTypes.FILTER_CHANGE_SUCCESS, payload: baseFilters });

    // init guest types

    await dispatch(initGuestTypeFilter(rest.selectedGuestTypeNames));
    await dispatch(initRegistrationPoints());
    // cant catch errors here
    await dispatch(changeAccountPointFilter(initialFilter));
    return dispatch({ type: ReportActionTypes.FILTER_INIT_SUCCESS });
  };
}

export function initGuestTypeFilter(
  initialGuestTypeNames: string[] = []
): ThunkResult<Promise<ReportActions>, ReportActions> {
  return async (dispatch, getState) => {
    const {
      user: { customerId },
      settings: { accounts }
    } = getState();
    const registeredAccountIds = accounts.map((account) => account.id);
    const allAccounts = [...registeredAccountIds, customerId].join(',');
    const { data: guestTypes } = (await transfer.get(
      endpoints.guestTypes,
      {
        params: { accounts: allAccounts }
      },
      true
    )) as AxiosResponse<GuestType[]>;

    // todo add options to groupBy to produce head only instaed of array eg flatMap option
    const guestTypeIdsByName = guestTypes.reduce(
      (all, curr) => ({
        ...all,
        [curr.name]: [...(all[curr.id] || []), curr.id]
      }),
      {} as { [name: string]: number[] }
    );

    const guestTypesById = guestTypes.reduce(
      (all, curr) => ({
        ...all,
        [curr.id]: curr
      }),
      {}
    ) as { [id: number]: GuestType };

    // remove non-existing names
    const selectedGuestTypeNames = initialGuestTypeNames.filter((name) => guestTypeIdsByName[name]);

    return dispatch({
      type: ReportActionTypes.FILTER_INIT_GUEST_TYPE_SUCCESS,
      payload: {
        guestTypesById,
        guestTypeIdsByName,
        selectedGuestTypeNames
      }
    });
  };
}

export function changeGuestTypes(selectedGuestTypeNames: string[]): ReportActions {
  return { type: ReportActionTypes.FILTER_CHANGE_SUCCESS, payload: { selectedGuestTypeNames } };
}

export function changeBasis(basis: Basis): ReportActions {
  return { type: ReportActionTypes.FILTER_CHANGE_SUCCESS, payload: { basis } };
}

// registration can change when dimension change and having top/bottom account query
export function changeDimension(
  dimension: Dimension
): ThunkResult<Promise<ReportActions>, ReportActions> {
  return async (dispatch) => {
    dispatch({ type: ReportActionTypes.FILTER_CHANGE_REQUEST, payload: { dimension } });
    return dispatch(changeStateAndReloadFilters());
  };
}

// initial version: will update all filters always, even when not on accounts page (only one using comparison filters).
// time update needs to be made atomically alongside registration points, since
// time change can change selected points availability, and these both changes would initiate
// a separate request to reports api (from report pages)
export function changeTimeRange(
  timeRange: TimeRange,
  period: Period,
  options?: {
    skipFilterReload?: boolean;
    updateCache?: boolean;
  }
): ThunkResult<void, ReportActions> {
  return (dispatch, getState) => {
    const { skipFilterReload, updateCache } = options || {};

    dispatch({
      type: ReportActionTypes.FILTER_CHANGE_REQUEST,
      payload: { timeRange, period }
    });

    if (!skipFilterReload) {
      debouncedReloadFilters(dispatch);
    }

    if (updateCache) {
      const { customerId } = getState().user;
      updateCachedFilter(customerId, { timeRange, period });
    }
  };
}

// mainly for if user clicks rapidly to change the time filter values
const debouncedReloadFilters = debounce(
  (dispatch): ThunkResult<ReportActions, ReportActions> => {
    // eslint-disable-next-line
    return dispatch(changeStateAndReloadFilters());
  },
  800,
  { leading: true }
);

function changeStateAndReloadFilters(): ThunkResult<Promise<ReportActions>, ReportActions> {
  return async (dispatch, getState) => {
    const reportFilter: ReportFilterState = getState().newReports;
    const { filter, comparisonFilters } = reportFilter;
    try {
      const filters = await reloadAllFilters({ filter, comparisonFilters, reportFilter });
      return dispatch({
        type: ReportActionTypes.FILTER_CHANGE_SUCCESS,
        payload: { ...filters }
      });
    } catch (error: unknown) {
      return dispatch({
        type: ReportActionTypes.FILTER_ERROR,
        payload: error as AxiosError<ApiError>
      });
    }
  };
}

// todo: this is not needed when the registration point selector component
// is fixed to return {id, name} or whole reg point instead of just names in callback
function createFilter(
  filter: AccountPointFilterUpdate,
  byName: Map<string, string[]>
): Partial<AccountPointFilter> {
  const { accounts, selectedRegistrationPoints, order } = filter;
  const hasSelectedPointsChange = Boolean(selectedRegistrationPoints);
  const hasAccountsChange = Boolean(accounts);
  const hasOrder = Boolean(order);

  if (!hasAccountsChange && !hasSelectedPointsChange) {
    return hasOrder ? { order } : {};
  }

  if (hasSelectedPointsChange) {
    const selected = Object.keys(selectedRegistrationPoints).reduce(
      (selected, label) => ({
        ...selected,
        // eslint-disable-next-line
        [label]: selectedRegistrationPoints[label].flatMap((name) => byName.get(name))
      }),
      {} as RegistrationPointIds
    );

    return hasAccountsChange
      ? {
          order,
          accounts,
          selectedRegistrationPoints: selected
        }
      : { order, selectedRegistrationPoints: selected };
  }

  return { order, accounts };
}

export function changeAccountPointFilter(
  filterUpdate: AccountPointFilterUpdate
): ThunkResult<Promise<ReportActions>, ReportActions> {
  return async (dispatch, getState) => {
    try {
      const reportFilter: ReportFilterState = getState().newReports;
      const { registrationPoints, filter: oldFilter } = reportFilter;
      const filter = createFilter(filterUpdate, registrationPoints.byName);
      const mergedFilter = mergeWith({}, { ...oldFilter }, { ...filter }, (target, source) => {
        if (Array.isArray(target)) {
          // eslint-disable-next-line
          return source; // override existing arrays
        }
      });
      const isFullReloadRequired = !isEqual(oldFilter.accounts, mergedFilter.accounts);
      const nextFilter: AccountPointFilter = isFullReloadRequired
        ? await reloadFilter(mergedFilter, reportFilter)
        : filterOutInvalidSelectedPoints(mergedFilter, registrationPoints);
      return dispatch({
        type: ReportActionTypes.FILTER_CHANGE_SUCCESS,
        payload: { filter: nextFilter }
      });
    } catch (error: unknown) {
      return dispatch({
        type: ReportActionTypes.FILTER_ERROR,
        payload: error as AxiosError<ApiError>
      });
    }
  };
}

export function addCompareToFilter(
  filter: AccountPointFilterUpdate
): ThunkResult<Promise<ReportActions>, ReportActions> {
  return async (dispatch, getState) => {
    const newReports: ReportFilterState = getState().newReports;
    const { customerId } = getState().user;
    const withAccounts =
      filter.accounts && filter.accounts.length > 0
        ? filter
        : {
            ...filter,
            accounts: [customerId.toString()],
            order: 'desc'
          };

    const selectedRegistrationPoints = LABELS.reduce(
      (all, label) => ({
        ...all,
        [label]:
          (filter.selectedRegistrationPoints && filter.selectedRegistrationPoints[label]) || []
      }),
      {}
    );

    const withSelectedPoints = createFilter(
      {
        ...withAccounts,
        selectedRegistrationPoints
      } as AccountPointFilterUpdate,
      newReports.registrationPoints.byName
    );
    try {
      const initialFilter = await reloadFilter(
        withSelectedPoints as AccountPointFilter,
        newReports
      );
      return dispatch({
        type: ReportActionTypes.FILTER_ADD_COMPARE_SUCCESS,
        payload: initialFilter
      });
    } catch (error: unknown) {
      return dispatch({
        type: ReportActionTypes.FILTER_ERROR,
        payload: error as AxiosError<ApiError>
      });
    }
  };
}

export function removeCompareToFilter(filterIndex: number): ReportActions {
  // base filter at index 0 cannot be deleted
  if (filterIndex === 0) {
    return;
  }
  return {
    type: ReportActionTypes.FILTER_REMOVE_COMPARE_SUCCESS,
    payload: filterIndex - 1
  };
}

// cleaner: separate account + points update
export function changeCompareToFilter(
  filterIndex: number,
  filterUpdate: AccountPointFilterUpdate
): ThunkResult<Promise<ReportActions>, ReportActions> {
  return async (dispatch, getState) => {
    if (filterIndex === 0) {
      return dispatch(changeAccountPointFilter(filterUpdate));
    }
    try {
      dispatch({
        type: ReportActionTypes.FILTER_CHANGE_COMPARE_REQUEST
      });
      const reportFilter: ReportFilterState = getState().newReports;
      const { registrationPoints, comparisonFilters } = reportFilter;
      const oldFilter = comparisonFilters[filterIndex - 1];
      const filter = createFilter(filterUpdate, registrationPoints.byName);

      const mergedFilter = mergeWith({}, { ...oldFilter }, { ...filter }, (target, source) => {
        if (Array.isArray(target)) {
          // eslint-disable-next-line
          return source; // override existing arrays
        }
      });

      const isFullReloadRequired = !isEqual(oldFilter.accounts, mergedFilter.accounts);
      const nextFilter: AccountPointFilter = isFullReloadRequired
        ? await reloadFilter(mergedFilter, reportFilter)
        : filterOutInvalidSelectedPoints(mergedFilter, registrationPoints);
      return dispatch({
        type: ReportActionTypes.FILTER_CHANGE_COMPARE_SUCCESS,
        payload: { key: filterIndex - 1, filter: nextFilter }
      });
    } catch (error) {
      return dispatch({
        type: ReportActionTypes.FILTER_ERROR,
        payload: error as AxiosError<ApiError>
      });
    }
  };
}

type ReloadAllFiltersOptions = {
  filter: AccountPointFilter;
  comparisonFilters: AccountPointFilter[];
  reportFilter: ReportFilterState;
};
// atomic update on all filters,
// necessary for accounts compare filters or else
// we will make separate request for each filter update
async function reloadAllFilters({
  filter,
  comparisonFilters,
  reportFilter
}: ReloadAllFiltersOptions): Promise<{
  filter: AccountPointFilter;
  comparisonFilters: AccountPointFilter[];
}> {
  const compareToPromises: Promise<AccountPointFilter>[] = [];
  const reloadedFilter = await reloadFilter(filter, reportFilter);
  comparisonFilters.forEach((compareFilter) =>
    compareToPromises.push(reloadFilter(compareFilter, reportFilter))
  );
  const reloadedComparisonFilters = await Promise.all(compareToPromises);

  return { filter: reloadedFilter, comparisonFilters: reloadedComparisonFilters };
}

async function reloadFilter(
  filter: AccountPointFilter,
  reportFilter: ReportFilterState
): Promise<AccountPointFilter> {
  const { registrations, ...updatedFilter } = await setAvailableRegistrationPoints(
    filter,
    reportFilter
  );
  return {
    registrations,
    ...filterOutInvalidSelectedPoints(
      updatedFilter as AccountPointFilter,
      reportFilter.registrationPoints
    )
  };
}

// fetches all registration points for all registered accounts including current user
function initRegistrationPoints(): ThunkResult<Promise<ReportActions>, ReportActions> {
  return async (dispatch, getState) => {
    dispatch({ type: ReportActionTypes.FILTER_INIT_REG_POINTS_REQUEST });
    const {
      user: { customerId },
      settings: { accounts }
    } = getState();
    const registeredAccountIds = accounts.map((account) => account.id);
    const allAccounts = [...registeredAccountIds, customerId].join(',');

    try {
      const params = { includeSoftDeleted: true, accounts: allAccounts };
      const { data: registrationPoints } = (await transfer.get(
        endpoints.registrationPoints,
        {
          params
        },
        true
      )) as AxiosResponse<RegistrationPoint[]>;

      const byName: Map<string, string[]> = registrationPoints.reduce((nameMap, point) => {
        if (!nameMap.get(point.name)) {
          nameMap.set(point.name, []);
        }
        const ids = nameMap.get(point.name);
        nameMap.set(point.name, [...ids, point.id]);

        return nameMap;
      }, new Map<string, string[]>());

      return dispatch({
        type: ReportActionTypes.FILTER_INIT_REG_POINTS_SUCCESS,
        payload: { registrationPoints: { byId: createMap(registrationPoints), byName: byName } }
      });
    } catch (error: unknown) {
      return dispatch({
        type: ReportActionTypes.FILTER_ERROR,
        payload: error as AxiosError<ApiError>
      });
    }
  };
}

// refactor out request parts to make these testable
export const setAvailableRegistrationPoints = async (
  filter: AccountPointFilter,
  reportFilter: ReportFilterState
): Promise<AccountPointFilter> => {
  const {
    timeRange,
    dimension,
    registrationPoints: { byId }
  } = reportFilter;
  const accountQuery = Array.isArray(filter.accounts) ? filter.accounts.join(',') : filter.accounts;
  const queryParams = {
    from: timeRange.from,
    to: timeRange.to,
    accounts: accountQuery,
    dimension
  };

  const response = (await transfer.get(endpoints.reportRegistrations, {
    params: queryParams
  })) as AxiosResponse<ReportRegistration[]>;

  /*
  TODO
  dispatch reportRegistration
  * */
  const idsWithAncestors = response.data.flatMap(({ registrationPoint }) => [
    ...(registrationPoint.path ? registrationPoint.path.split('.') : []),
    registrationPoint.id
  ]);

  const registrationPoints = idsWithAncestors.map((id) => byId.get(id));
  const availableRegistrationPointSets = registrationPoints.reduce(
    (labels, current) => {
      labels[current.label].add(current.id);
      return labels;
    },
    { area: new Set<string>(), category: new Set<string>(), product: new Set<string>() }
  );

  const availableRegistrationPoints: RegistrationPointIds = LABELS.reduce(
    (labels, label) => ({ ...labels, [label]: Array.from(availableRegistrationPointSets[label]) }),
    { area: [], category: [], product: [] }
  );

  return {
    ...filter,
    availableRegistrationPoints,
    registrations: response.data
  };
};

const filterOutInvalidSelectedPoints = (
  filter: AccountPointFilter,
  registrationPoints: RegistrationPoints
): AccountPointFilter => {
  const { selectedRegistrationPoints, availableRegistrationPoints } = filter;
  const { byId, byName } = registrationPoints;
  const afterAvailabilityChange: RegistrationPointsByLabel = LABELS.reduce<RegistrationPointsByLabel>(
    (result, label) => {
      // when availability changes, need to map id <-> name <-> id (name = list of ids, which may have changed)
      // perhaps there's better way to structure the state
      const selectedNames = Array.from(
        new Set(selectedRegistrationPoints[label].map((id) => byId.get(id).name))
      );
      const selectedNodes: RegistrationPoint[] = selectedNames
        .flatMap((name) => byName.get(name))
        .map((id) => byId.get(id));
      const availableIds = availableRegistrationPoints[label];
      result[label] = selectedNodes.filter((node) =>
        availableIds.some((availableId) => availableId === node.id)
      );
      return result;
    },
    {} as RegistrationPointsByLabel
  );

  const nextFilter: RegistrationPointsByLabel = recalculatePointHierarchy(afterAvailabilityChange);
  const nextSelected = {
    area: nextFilter.area.map((node) => node.id),
    category: nextFilter.category.map((node) => node.id),
    product: nextFilter.product.map((node) => node.id)
  };

  return {
    ...filter,
    selectedRegistrationPoints: nextSelected
  };
};

// handling url / cache should be in one place,
// now in container and here in actions
export const getCachedState = (customerId: number): CachedFilter | null => {
  const cachedState = cache.getReportsPath(customerId);
  if (!cachedState) {
    return null;
  }

  return cachedState;
};

export const updateURL = (): ThunkResult<void, AnyAction> => {
  return (dispatch, getState) => {
    const {
      newReports: reportFilter,
      routing: { locationBeforeTransitions },
      user
    } = getState();
    const {
      filter: { accounts, selectedRegistrationPoints, order },
      basis,
      dimension,
      period,
      timeRange,
      selectedGuestTypeNames,
      registrationPoints: { byId }
    } = reportFilter;
    const basePath = locationBeforeTransitions.pathname;

    // to utility serialize
    const registrationPointNameStrings: { [label: string]: string[] } = LABELS.filter(
      (label) => selectedRegistrationPoints[label].length > 0
    ).reduce((labels, label) => {
      const uniqueNamesInLabel = new Set(
        selectedRegistrationPoints[label].map((id) => byId.get(id).name)
      );
      return {
        ...labels,
        [label]: Array.from(uniqueNamesInLabel)
      };
    }, {});

    const searchQuery = [
      { accounts },
      ...Object.keys(registrationPointNameStrings).map((label) => ({
        [label]: registrationPointNameStrings[label]
      })),
      { basis },
      { dimension },
      { period },
      {
        from: moment(timeRange.from).format(UI_DATE_FORMAT),
        to: moment(timeRange.to).format(UI_DATE_FORMAT)
      },
      { order }
    ];

    if (selectedGuestTypeNames.length > 0) {
      searchQuery.push({ guestTypes: selectedGuestTypeNames });
    }

    // should never be empty, always has defaults if nothing else
    const serializedQuery = searchQuery
      .map((queryParam) => {
        return Object.keys(queryParam)
          .reduce((res, key) => {
            const queryValue = queryParam[key] as string | string[];
            const serializedValue = Array.isArray(queryValue)
              ? encodeURI(queryValue.join(','))
              : encodeURI(queryValue);
            return res.concat(`${key}=${serializedValue}`);
          }, [] as string[])
          .join('&');
      })
      .join('&');

    const nextPath = basePath + '?' + serializedQuery;
    if (nextPath !== locationBeforeTransitions.pathname + locationBeforeTransitions.search) {
      browserHistory.replace(nextPath);
    }

    // to streamline the report filter initialization, this filter is used instead of parsing filter from url.
    // If we used the url, we'd need first to call location.replace and add additional flags,
    // which would add additional complexity to the init filter flow.
    const cachedURLFilter = {
      filter: { accounts, selectedRegistrationPoints: registrationPointNameStrings },
      basis,
      dimension,
      period,
      timeRange,
      selectedGuestTypeNames
    } as NestedPartial<ReportFilterState>;
    cache.persistReportsPath(user.customerId, {
      state: cachedURLFilter
    });
  };
};

export const updateCachedFilter = (
  customerId: number,
  filter: NestedPartial<ReportFilterState>
): void => {
  const { state } = getCachedState(customerId) || {};
  cache.persistReportsPath(customerId, {
    state: {
      ...state,
      ...filter
    }
  });
};
