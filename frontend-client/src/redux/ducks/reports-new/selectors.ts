import { createSelectorCreator, defaultMemoize } from 'reselect';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { getParentLabels, getSubLabels, Labels, LABELS } from 'utils/labels';
import { isNodeAncestor } from 'utils/tree';
import { AccountPointFilter, Order, RegistrationPointIds } from './types';
import { groupBy, sum } from 'utils/array';
import { getFullRegistrationPath } from 'utils/helpers';
import { formatMoney, formatWeight } from 'utils/number-format';
import { RootState } from 'redux/rootReducer';

import isEqual from 'lodash/isEqual';
import { DashboardMetricId } from 'redux/ducks/dashboardNext';

const RankingLimitRegex = /^(bottom|top)([1-9]\d*)$/;
const MoreThanOneNumberRegex = /(\d+)/;

// todo; make these consistent ( eg {name}[] prop instead of string[]), and better names
export type RegistrationPointNames = RegistrationPointIds;
export type NameWithDisableStatus = { name: string; disabled: boolean };
export type RegistrationPointWithDisabledStatus = RegistrationPoint & { disabled?: boolean };
export type RegistrationPointsWithDisableStatus = {
  [key in Labels]: RegistrationPointWithDisabledStatus[];
};
export type RegistrationPointNamesWithDisableStatus = {
  [key in Labels]: NameWithDisableStatus[];
};

export type RegistrationPointsByLabel = {
  [key in Labels]: RegistrationPoint[];
};

export type AccountData = { id: string; name: string; company?: string; isCurrentAccount: boolean };

// to be extended on refined design; eg ops all, current & manual (would have account ids directly as value)
export enum AccountQueryOp {
  bottom = 'bottom',
  top = 'top'
}

export interface AccountQuery {
  op: AccountQueryOp;
  value?: string;
}

export interface AccountPointFilterWithNames {
  order: Order;
  availableAccounts: AccountData[];
  accounts: AccountData[];
  accountQuery?: AccountQuery; // currently top/bottom only
  selectedRegistrationPoints: RegistrationPointNames;
  availableRegistrationPoints: RegistrationPointNamesWithDisableStatus;
}

export interface AdvancedFoodwasteReport {
  date: string;
  guestAmount: number;
  amount: string;
  cost: string;
  co2: string;
  account: string;
  registrationPointName: string;
  registrationPointPath: string;
  comment?: string;
}

const createSelector = createSelectorCreator(defaultMemoize, (currentVal, previousVal) => {
  // eslint-disable-next-line
  return previousVal === undefined || (previousVal as any).error || currentVal === previousVal;
});

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

const groupRegistrationPointsByName = (
  registrationPoints: RegistrationPointWithDisabledStatus[]
): NameWithDisableStatus[] => {
  if (registrationPoints.length === 0) return [];

  const mapByName = registrationPoints.reduce((names, registrationPoint) => {
    if (!names[registrationPoint.name]) {
      names[registrationPoint.name] = { name: registrationPoint.name, registrationPoints: [] };
    }
    names[registrationPoint.name].registrationPoints.push(registrationPoint);
    return names;
  }, {} as { [name: string]: { name: string; registrationPoints: RegistrationPointWithDisabledStatus[] } });

  return Object.keys(mapByName).map((name) => ({
    name,
    disabled: mapByName[name].registrationPoints.every(({ disabled }) => disabled === true)
  }));
};

const isNodeDisabled = (
  node: RegistrationPoint,
  parentLabels: Labels[],
  filter: RegistrationPointIds,
  available: RegistrationPointsWithDisableStatus
): boolean => {
  return parentLabels.reduce((isDisabled, parentLabel) => {
    if (isDisabled) {
      return isDisabled;
    }

    const selectedParentIds = filter[parentLabel];
    const disabledParents = available[parentLabel].filter((parent) => parent.disabled);
    const hasSelectedParents = selectedParentIds.length > 0;
    const hasDisabledParents = disabledParents.length > 0;

    if (!node.parentId) {
      return hasSelectedParents || hasDisabledParents;
    }

    const enabledByParent =
      !hasDisabledParents || !disabledParents.some((ancestor) => isNodeAncestor(node, ancestor));
    const enabledBySelection =
      !hasSelectedParents || selectedParentIds.some((id) => isNodeAncestor(node, { id }));

    return !(enabledByParent && enabledBySelection);
  }, false);
};

const getSelectedByName = (selectedPoints: RegistrationPointsByLabel): RegistrationPointNames => {
  return LABELS.reduce(
    (labels, label) => ({
      ...labels,
      [label]: groupRegistrationPointsByName(selectedPoints[label]).map((point) => point.name)
    }),
    { area: [], category: [], product: [] }
  );
};

const getAvailableByName = (
  filter: RegistrationPointIds,
  available: RegistrationPointsByLabel
): RegistrationPointNamesWithDisableStatus => {
  const affectedLabels = getSubLabels('area');
  const withDisabled = affectedLabels.reduce(
    (labels, currentLabel) => {
      const parentLabels = getParentLabels(currentLabel).reverse();
      const availableInLabel = available[currentLabel];
      labels[currentLabel] = availableInLabel.map((node) => {
        const disabled = isNodeDisabled(node, parentLabels, filter, labels);
        return { ...node, disabled };
      });
      return labels;
    },
    { ...available }
  );

  return {
    area: groupRegistrationPointsByName(withDisabled.area),
    category: groupRegistrationPointsByName(withDisabled.category),
    product: groupRegistrationPointsByName(withDisabled.product)
  };
};

export const getNodesByLabel = (
  byId: Map<string, RegistrationPoint>,
  registrationPoints: RegistrationPointIds
): RegistrationPointsByLabel => {
  return LABELS.reduce(
    (all, label) => ({
      ...all,
      [label]: registrationPoints[label].map((id) => byId.get(id))
    }),
    {} as RegistrationPointsByLabel
  );
};

const getSelectedAccounts = (
  selectedIds: string[],
  availableAccounts: AccountData[]
): AccountData[] => {
  const availableById: { [index: string]: AccountData[] } = groupBy(availableAccounts, 'id');
  // filter out query strings (not numbers as account ids are)
  return selectedIds.filter((id) => !isNaN(id as any)).map((id) => availableById[id][0]);
};

export const getAvailableAccounts = createSelector(
  (state: RootState) => state.settings.accounts,
  (state: RootState) => state.user,
  (accounts, loggedInUser): AccountData[] => {
    const loggedInAccount = {
      id: loggedInUser.customerId,
      name: loggedInUser.customerName,
      company: loggedInUser.name
    };

    // not sure if account id can be null, but there was a check for it
    return [...accounts, loggedInAccount]
      .filter((account) => Boolean(account.id))
      .map((account) => ({
        ...account,
        id: account.id.toString(),
        isCurrentAccount: account.id === loggedInAccount.id
      }));
  }
);

const getAccountQuery = (accounts: string[]): AccountQuery | null => {
  if (accounts.length === 0 || !RankingLimitRegex.test(accounts[0])) {
    return null;
  }

  const queryString = accounts[0];
  const [maybeOp, value] = queryString.split(MoreThanOneNumberRegex);
  return AccountQueryOp[maybeOp] ? { op: AccountQueryOp[maybeOp as AccountQueryOp], value } : null;
};

export const getSelectedAccountNames = createDeepEqualSelector(
  (state: RootState) => state.newReports.filter.accounts,
  getAvailableAccounts,
  (selectedAccountIds, availableAccounts) => {
    return getSelectedAccounts(selectedAccountIds, availableAccounts).map(
      (account) => account.name
    );
  }
);

export const getSelectedAccountIds = createDeepEqualSelector(
  (state: RootState) => state.newReports.filter.accounts,
  getAvailableAccounts,
  (selectedAccountIds, availableAccounts) => {
    return getSelectedAccounts(selectedAccountIds, availableAccounts).map((account) =>
      parseInt(account.id)
    );
  }
);

export const getFilter = createDeepEqualSelector(
  (state: RootState) => state.newReports.filter,
  (state: RootState) => state.newReports.registrationPoints.byId,
  getAvailableAccounts,
  (
    filter: AccountPointFilter,
    byId: Map<string, RegistrationPoint>,
    availableAccounts: AccountData[]
  ): AccountPointFilterWithNames => ({
    availableAccounts,
    order: filter.order,
    accounts: getSelectedAccounts(filter.accounts, availableAccounts),
    accountQuery: getAccountQuery(filter.accounts),
    selectedRegistrationPoints: getSelectedByName(
      getNodesByLabel(byId, filter.selectedRegistrationPoints)
    ),
    availableRegistrationPoints: getAvailableByName(
      filter.selectedRegistrationPoints,
      getNodesByLabel(byId, filter.availableRegistrationPoints)
    )
  })
);

export const getCompareToFilters = createDeepEqualSelector(
  (state: RootState) => state.newReports.registrationPoints.byId,
  (state: RootState) => state.newReports.comparisonFilters,
  getAvailableAccounts,
  (byId, comparisonFilters, availableAccounts): AccountPointFilterWithNames[] =>
    comparisonFilters.map(
      ({ order, accounts, selectedRegistrationPoints, availableRegistrationPoints }) => ({
        order,
        availableAccounts,
        accounts: getSelectedAccounts(accounts, availableAccounts),
        accountQuery: getAccountQuery(accounts),
        selectedRegistrationPoints: getSelectedByName(
          getNodesByLabel(byId, selectedRegistrationPoints)
        ),
        availableRegistrationPoints: getAvailableByName(
          selectedRegistrationPoints,
          getNodesByLabel(byId, availableRegistrationPoints)
        )
      })
    )
);

export const getTimeFilter = createDeepEqualSelector(
  (state: RootState) => state.newReports.timeRange,
  (state: RootState) => state.newReports.period,
  (timeRange, period) => ({ ...timeRange, period })
);

export const getRegistrations = createDeepEqualSelector(
  (state: RootState) => state.newReports.filter.registrations,
  (state: RootState) => state.newReports.filter.selectedRegistrationPoints,
  (state: RootState) => state.newReports.registrationPoints,
  (state: RootState) => state.reportData.guestRegistrations,
  (state: RootState) => ({ currency: state.settings.currency, locale: state.ui.locale }),
  getAvailableAccounts,
  (
    registrations,
    selectedPoints,
    pointMaps,
    guests,
    settings,
    accounts
  ): AdvancedFoodwasteReport[] => {
    const { area, category, product } = selectedPoints;
    const guestsByDate = groupBy(guests.data, 'date') as {
      [date: string]: any[];
    };
    const guestsByDateAndCustomer = Object.keys(guestsByDate).reduce(
      (all, date) => ({
        ...all,
        [date]: groupBy(guestsByDate[date], 'customerId')
      }),
      {} as {
        [date: string]: {
          [customerId: string]: { customerId: string; date: string; amount: number }[];
        };
      }
    );

    const filtered = registrations.filter((r) => {
      const path = groupBy(getFullRegistrationPath(pointMaps.byId, r.registrationPoint), 'id') as {
        [id: string]: RegistrationPoint[];
      };
      return (
        (area.length === 0 || area.some((id) => path[id])) &&
        (category.length === 0 || category.some((id) => path[id])) &&
        (product.length === 0 || product.some((id) => path[id]))
      );
    });

    return filtered.map((r) => ({
      comment: r.comment,
      date: r.date,
      guestAmount: !guests.isLoading
        ? guestsByDateAndCustomer[r.date] && guestsByDateAndCustomer[r.date][r.customerId]
          ? // eslint-disable-next-line
            sum(guestsByDateAndCustomer[r.date][r.customerId].map((g) => g.amount))
          : 0
        : null,
      amount: formatWeight(r.amount, false, 'kg'),
      cost: formatMoney(r.cost).toString(),
      co2: r.co2 ? formatWeight(r.co2, false, 'kg') : '-',
      account: accounts.find((account) => account.id === r.customerId).name,
      registrationPointName: r.registrationPoint.name,
      registrationPointPath: getFullRegistrationPath(pointMaps.byId, r.registrationPoint)
        // eslint-disable-next-line
        .map((p) => p.name)
        .join(' -> ')
    }));
  }
);

export const getGuestTypes = createDeepEqualSelector(
  (state: RootState) => state.newReports.guestTypesById,
  (guestTypesById) => {
    return Object.keys(guestTypesById).map((id) => guestTypesById[parseInt(id)]);
  }
);

const reportDashboardMetricIds: Set<DashboardMetricId> = new Set([
  'co2_waste',
  'per_guest_saved',
  'per_guest_avoidable'
]);

export const getReportDashboardMetrics = createDeepEqualSelector(
  (state: RootState) => state.dashboardNext.metrics,
  (metrics) => metrics.filter((metric) => reportDashboardMetricIds.has(metric.id))
);
