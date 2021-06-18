import moment from 'moment';

/**
 * Returns a ordinal of a number, e.g. "1st", "2th" etc.
 * @param n
 */
export default (n: number): string => moment(n, 'DD-MM-YYYY').format('Do');
