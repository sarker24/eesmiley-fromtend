import moment from 'moment';
import { API_DATE_FORMAT, UI_DATE_FORMAT } from 'utils/datetime';
import { Basis, Dimension, ReportFilterState, TimeRange } from 'redux/ducks/reports-new';
import { Location } from 'history';

enum ParamKeys {
  from = 'from',
  to = 'to',
  accounts = 'accounts',
  area = 'area',
  category = 'category',
  product = 'product',
  basis = 'basis',
  dimension = 'dimension',
  period = 'period',
  order = 'order',
  guestTypes = 'selectedGuestTypeNames'
}

enum CalendarPeriod {
  day = 'day',
  week = 'week',
  month = 'month',
  quarter = 'quarter',
  year = 'year'
}

enum CustomPeriod {
  custom = 'custom'
}

const Dimensions: { [key in Dimension]: Dimension } = {
  weight: 'weight',
  cost: 'cost',
  co2: 'co2'
};

const Basises: { [key in Basis]: Basis } = {
  total: 'total',
  'per-guest': 'per-guest'
};

enum SortOrders {
  asc = 'asc',
  desc = 'desc'
}

const RankingLimitRegex = /^(bottom|top)([1-9]\d*)$/;
const IdListRegex = /^[1-9]\d*(,[1-9]\d*)*$/;
// perhaps we could consolidate this to ids as well?
const NameListRegex = /^(.+)(,.+)*$/;

function parsePeriod(
  from: string,
  to: string,
  period: string
): {
  timeRange: TimeRange;
  period: CalendarPeriod | CustomPeriod;
} {
  if (!(from && to)) {
    return null;
  }

  const formattedFrom = moment(from, UI_DATE_FORMAT);
  const formattedTo = moment(to, UI_DATE_FORMAT);

  if (!formattedFrom.isValid() || !formattedTo.isValid()) {
    return null;
  }

  if (period) {
    if (!CalendarPeriod[period] && CustomPeriod.custom !== period) {
      return null;
    }

    return {
      timeRange: {
        [ParamKeys.from]: formattedFrom.format(API_DATE_FORMAT),
        [ParamKeys.to]: formattedTo.format(API_DATE_FORMAT)
      },
      [ParamKeys.period]: period as CustomPeriod
    };
  }

  const calculatedPeriod =
    Object.values(CalendarPeriod).find((period) =>
      formattedFrom.clone().add(1, period).subtract(1, 'day').isSame(formattedTo)
    ) || CustomPeriod.custom;

  return {
    timeRange: {
      [ParamKeys.from]: formattedFrom.format(API_DATE_FORMAT),
      [ParamKeys.to]: formattedTo.format(API_DATE_FORMAT)
    },
    [ParamKeys.period]: calculatedPeriod
  };
}

/*
We currently have per-guest endpoint separately under foodwaste/ path,
and it takes priority over query parameter basis.
 */
function parseBasis(basis: string, pathname: string): Basis {
  const hasBasisSubPath = /\/report\/foodwaste\b/.test(pathname);

  if (hasBasisSubPath) {
    const pathRegex = new RegExp(`\\b(${Object.keys(Basises).join('|')})\\b`, 'g');
    const basisFromPath = pathRegex.exec(pathname) as Basis[] | null;
    // foodwaste/ without subpath = total basis
    return basisFromPath ? basisFromPath[0] : Basises.total;
  }

  if (basis && Basises[basis]) {
    return basis as Basis;
  }

  return null;
}

function parseFilterQueryParams(
  location: Location<{ [key: string]: string | undefined }>
): NestedPartial<ReportFilterState> {
  const {
    pathname,
    query: { from, to, period, accounts, dimension, basis, order, guestTypes, ...restParams }
  } = location;
  let parsedFilter = { filter: { accounts: [], selectedRegistrationPoints: {} } };
  const parsedPeriod = parsePeriod(from, to, period);
  const parsedBasis = parseBasis(basis, pathname);

  if (parsedPeriod) {
    parsedFilter = { ...parsedFilter, ...parsedPeriod };
  }

  if (parsedBasis) {
    parsedFilter[ParamKeys.basis] = parsedBasis;
  }

  if (accounts) {
    if (IdListRegex.test(accounts) || RankingLimitRegex.test(accounts)) {
      parsedFilter['filter'] = {
        ...parsedFilter['filter'],
        [ParamKeys.accounts]: accounts.split(',')
      };
    }
  }

  if (guestTypes) {
    if (NameListRegex.test(guestTypes)) {
      parsedFilter[ParamKeys.guestTypes] = guestTypes.split(',');
    }
  }

  if (dimension && Dimensions[dimension]) {
    parsedFilter[ParamKeys.dimension] = dimension;
  }

  if (order && SortOrders[order]) {
    parsedFilter[ParamKeys.order] = order;
  }

  [ParamKeys.area, ParamKeys.category, ParamKeys.product].forEach((label) => {
    const parsedLabel = restParams[label];
    if (parsedLabel && NameListRegex.test(parsedLabel)) {
      parsedFilter.filter.selectedRegistrationPoints[label] = parsedLabel
        .split(',')
        .map((name) => name.trim());
    }
  });

  return parsedFilter;
}

export default parseFilterQueryParams;
