import moment from 'moment';

export type TimeRange = { from: string; to: string; };
export type QueryInterval = { count: number; unit: 'day' | 'week' | 'month' | 'year'; };
export type QueryPeriod = TimeRange & { period: 'day' | 'week' | 'month' | 'quarter' | 'year', interval: QueryInterval; };

export const REGISTRATION_DATE_FORMAT = 'YYYY-MM-DD';

export function createPeriod(timeRange, period): QueryPeriod {
  const { $gte: from, $lte: to } = timeRange;
  if (period !== 'custom') {
    return {
      from: moment(from).format(REGISTRATION_DATE_FORMAT),
      to,
      interval: { count: period === 'quarter' ? 3 : 1, unit: period === 'quarter' ? 'month' : period },
      period
    };
  }

  const daysDiff = moment(to).diff(moment(from), 'days') + 1;
  return {
    from: moment(from).format(REGISTRATION_DATE_FORMAT),
    to,
    interval: { count: daysDiff, unit: 'day' },
    period: 'day'
  };
}

export function getHistoryTimeRange(period: QueryPeriod, numOfPeriods): TimeRange {
  const { from, to, interval: { unit, count } } = period;

  return {
    from: moment(from).subtract(numOfPeriods * count, unit).format(REGISTRATION_DATE_FORMAT),
    to
  };
}
