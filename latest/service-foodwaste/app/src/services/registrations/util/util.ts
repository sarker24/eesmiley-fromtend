import Moment from 'moment';

let moment = Moment.utc;

/**
 * Returns a function that formats the date, depending on the given period: week, month or year
 *
 * @param {string} period The period by which to decide the formatting
 * @return {function}
 */
export function getPeriodLabelFormatter(period: string) {
  switch (period) {
    case 'week':
      return (start: string) => {
        return `${moment(start).format('WW')}`;
      };
    case 'month':
      return (start: string) => {
        return `${moment(start).format('YYYY-MM')}`;
      };
    case 'year':
      return (start: string) => {
        return `${moment(start).format('YYYY')}`;
      };
    default:
      log.error({
        period, subModule: 'registrations-util'
      }, '"period" has a wrong value. Cannot be formatted properly.');
      break;
  }
}
