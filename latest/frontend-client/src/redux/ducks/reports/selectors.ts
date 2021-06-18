/*
 * A set of redux selectors for the Reports (v2)
 */

import { createSelectorCreator, defaultMemoize } from 'reselect';
import moment from 'moment';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { getParentLabels, getSubLabels, LABELS } from 'utils/labels';
import { isNodeAncestor } from 'utils/tree';
import isEqual from 'lodash/isEqual';

const filterSelector = (state) => state.reports.filter;
const createSelector = createSelectorCreator(
  defaultMemoize,
  (currentVal: any, previousVal: any) => {
    return previousVal === undefined || previousVal.error || currentVal === previousVal;
  }
);

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

/**
 * Registrations dashboard selector
 * @type {OutputParametricSelector<S, P, T, (res1:R1, res2:R2)=>T>}
 */
export const registrationsDashboardSelector = createSelector(
  filterSelector,
  (state) => state.reports.dashboards.registrations,
  (filter, dashboard) => dashboard
);

/**
 * Projects dashboard selector
 * @type {OutputParametricSelector<S, P, T, (res1:R1, res2:R2)=>T>}
 */
export const projectsDashoardSelector = createSelector(
  filterSelector,
  (state) => state.reports.dashboards.projects,
  (filter, dashboard) => dashboard
);

/**
 * Sales dashboard selector
 * @type {OutputParametricSelector<S, P, T, (res1:R1, res2:R2)=>T>}
 */
export const salesDashboardSelector = createSelector(
  filterSelector,
  (state) => state.reports.dashboards.sales,
  (filter, dashboard) => dashboard
);

export const multipleAccountsFilterSelector = (filter) => {
  const { to, from, accounts, dashboard, interval, ...restFilter } = filter;

  return {
    to,
    from,
    accounts: accounts.join(','),
    ...restFilter
  };
};

export const singleAccountFilterSelector = createSelector(
  (state: any) => state.reports.searchCriteria,
  (filter) => {
    let payload: { to: string; from: string; accounts?: string; id?: string; account?: string } = {
      to: filter.to,
      from: filter.from,
      accounts: filter.accounts,
      id: filter.id,
      account: filter.account
    };
    if (filter.accounts && filter.accounts.length != 0) {
      payload.accounts = (typeof filter.accounts == 'object'
        ? filter.accounts.join(',')
        : filter.accounts
      )
        .split(',')
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        })
        .join(',');
    }

    return payload;
  }
);

export const transformFilter = createSelector(
  (filter) => filter,
  (filter: any) => {
    return {
      account: filter.accountId,
      id: filter.id,
      interval: filter.dateFilter.interval,
      accounts: filter.accountIds,
      from: filter.dateFilter.startDate,
      to: filter.dateFilter.endDate,
      area: filter.domainFilter.area,
      product: filter.domainFilter.product,
      category: filter.domainFilter.category
    };
  }
);

export const accountsSelector = createSelector(
  (state: any) => state.settings.accounts,
  (state: any) => state.user.customerId,
  (accounts, customerId) => {
    if (!accounts) {
      return [];
    }

    accounts.sort((a, b) => {
      return a.id == customerId || a.name > b.name ? 1 : -1;
    });

    return accounts.map((account) => {
      return {
        ...account,
        id: account.id.toString()
      };
    });
  }
);

export const searchProjectsSelector = createSelector(
  (data: any) => data.projects,
  (data: any) => data.searchFilter,
  (
    projects: { name: string; productString: string; secondaryText: string }[],
    searchFilter: string
  ) => {
    let searchFilterLowered = searchFilter.toLowerCase();
    return projects.filter((project) => {
      return (
        (typeof project.name == 'string' &&
          project.name.toLowerCase().indexOf(searchFilterLowered) >= 0) ||
        (project.productString != undefined &&
          project.productString.toLowerCase().indexOf(searchFilterLowered) >= 0) ||
        (project.secondaryText != undefined &&
          project.secondaryText.toLowerCase().indexOf(searchFilterLowered) >= 0)
      );
    });
  }
);

export const projectsWithAccountsAndProductStringSelector = createSelectorCreator<any>(
  defaultMemoize,
  (currentVal, previousVal) => {
    return JSON.stringify(currentVal.reports.filter) != JSON.stringify(previousVal.reports.filter);
  }
)(
  (state: any) => state,
  (state) => {
    let { projects, filter } = state.reports;
    let parsedProjects = projects.data.map((project) => {
      project.productString = project.registrationPoints
        .map((registrationPoint: { name: string }, i: any) => {
          const name =
            i > 0 && registrationPoint.name != null
              ? registrationPoint.name.toLowerCase()
              : registrationPoint.name;
          if (project.registrationPoints.length !== i + 1) {
            return name + ', ';
          }
          return name;
        })
        .join('');

      return project;
    });

    if (filter.accounts && filter.accounts.length > 1) {
      const accounts = state.settings.accounts;
      const user = state.user;
      let accountsMap = {};

      if (accounts && accounts.length > 0) {
        for (let i in accounts) {
          accountsMap[accounts[i].id.toString()] = accounts[i].name;
        }
      }

      if (user.customerId) {
        if (
          state.settings.useAccountNickname &&
          user.nickname != undefined &&
          user.nickname != null
        ) {
          accountsMap[user.customerId.toString()] = user.nickname;
        } else if (user.customerName != undefined && user.customerName != null) {
          accountsMap[user.customerId.toString()] = user.customerName;
        }
      }

      parsedProjects = parsedProjects.map((project) => {
        return {
          ...project,
          secondaryText: accountsMap[project.customerId] ? accountsMap[project.customerId] : null
        };
      });
    }

    return parsedProjects;
  }
);

export const routeParamsSelector = createDeepEqualSelector<
  any,
  any,
  any,
  { path: string; search: string }
>(
  (params: any) => params.filter,
  (params: any) => params.dashboardId,
  (filter, dashboardId) => {
    const accounts: string[] = filter.accounts;
    const accountsString: string = accounts.length > 0 ? accounts.join('&') : 'current';

    let path = '';

    if (filter.from != null && filter.to != null) {
      let fromDate = moment(filter.from, 'YYYY-MM-DD');
      let toDate = moment(filter.to, 'YYYY-MM-DD');
      if (toDate.isBefore(fromDate)) {
        toDate = fromDate;
      }

      path =
        fromDate.format('DD-MM-YYYY') + '/' + toDate.format('DD-MM-YYYY') + '/' + accountsString;
      if (filter.interval) {
        path += '/' + filter.interval;
      } else {
        path += '/custom';
      }
    }

    const search = [];

    if (filter.id && filter.id != null && dashboardId != undefined && dashboardId == 'projects') {
      search.push('projectId=' + filter.id);
    }

    if (filter.category && filter.category.length > 0) {
      search.push('categories=' + filter.category.join('|'));
    }

    if (filter.area && filter.area.length > 0) {
      search.push('areas=' + filter.area.join('|'));
    }

    if (filter.product && filter.product.length > 0) {
      search.push('products=' + filter.product.join('|'));
    }

    const searchString = search.length > 0 ? '?' + search.join('&') : '';

    return { path, search: searchString };
  }
);

const groupRegistrationPointsByName = (
  registrationPoints: RegistrationPoint[]
): { [index: string]: string }[] => {
  if (registrationPoints.length === 0) return [];

  const mapByName = registrationPoints.reduce((names, registrationPoint) => {
    if (!names[registrationPoint.name]) {
      names[registrationPoint.name] = { name: registrationPoint.name, registrationPoints: [] };
    }
    names[registrationPoint.name].registrationPoints.push(registrationPoint);
    return names;
  }, {});

  return Object.keys(mapByName).map((name) => ({
    name,
    disabled: mapByName[name].registrationPoints.every(({ disabled }) => disabled === true)
  }));
};

const isNodeDisabled = (node, parentLabels, filter, available) => {
  return parentLabels.reduce((isDisabled, parentLabel) => {
    if (isDisabled) {
      return isDisabled;
    }

    const selectedParentIds: string[] = filter[parentLabel];
    const disabledParents: RegistrationPoint[] = available[parentLabel].filter(
      (parent) => parent.disabled
    );
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

const getAvailableByName = (filter, available) => {
  const affectedLabels = getSubLabels('area');
  const withDisabled = affectedLabels.reduce((labels, currentLabel) => {
    const parentLabels = getParentLabels(currentLabel).reverse();
    const availableInLabel = available[currentLabel];
    labels[currentLabel] = availableInLabel.map((node) => {
      const disabled = isNodeDisabled(node, parentLabels, filter, available);
      return { ...node, disabled };
    });
    return labels;
  }, available);

  return {
    area: groupRegistrationPointsByName(withDisabled.area),
    category: groupRegistrationPointsByName(withDisabled.category),
    product: groupRegistrationPointsByName(withDisabled.product)
  };
};

export const getAvailableRegistrationPointNames = createDeepEqualSelector(
  (state: any) => state.reports.filter,
  (state: any) => state.reports.registrationPoints.available,
  getAvailableByName
);

// use label instead state prop, area , category, product
export const getSelectedRegistrationPointNames = createDeepEqualSelector(
  (state: any) => state.reports.registrationPoints.allById,
  (state: any) => state.reports.filter,
  (allById, filter) => {
    const byName = LABELS.reduce((labels, label) => {
      const ids = filter[label];
      const points = ids.map((id) => allById.get(id));
      labels[label] = groupRegistrationPointsByName(points).map((point) => point.name);
      return labels;
    }, {});

    return byName;
  }
);

export const getAvailableAccounts = createSelector(
  (state: any) => state.settings.accounts,
  (state: any) => state.user,
  (accounts, loggedInUser) => {
    const loggedInAccount = {
      id: loggedInUser.customerId,
      name: loggedInUser.customerName,
      company: loggedInUser.name
    };
    return [...accounts, loggedInAccount].map((account) => ({
      ...account,
      id: account.id && account.id.toString()
    }));
  }
);
