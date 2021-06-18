import moment from 'moment';
import { PERIOD_FORMAT } from 'utils/datetime';
import { Period, TimeRange } from 'redux/ducks/reports-new';

export interface Options {
  timeRange: TimeRange;
  period: Period;
}

function calculateStartDate(options: Options) {
  const {
    period,
    timeRange: { from, to }
  } = options;

  switch (period) {
    case 'year':
      return moment(to).subtract(12, period).startOf(period);
    case 'day':
    case 'quarter':
    case 'month':
      return moment(to).subtract(1, 'year').startOf(period);
    case 'week':
      return moment(to).subtract(1, 'year').startOf('isoWeek');
    case 'custom': {
      const daysDiff = moment(to).diff(moment(from), 'days') + 1;
      return daysDiff > 90
        ? moment(to)
            .subtract(12 * daysDiff, 'days')
            .startOf('day')
        : moment(to)
            .subtract(Math.ceil(365 / daysDiff) * daysDiff, 'days')
            .startOf('day');
    }
  }
}

export function calculateMetricTimeRange(options: Options): TimeRange {
  const {
    period,
    timeRange: { to }
  } = options;
  const startDate = calculateStartDate(options);
  return {
    from: startDate.format(PERIOD_FORMAT[period]),
    to: moment(to).format(PERIOD_FORMAT[period])
  };
}
