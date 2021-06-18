import moment from 'moment';
import { findReverseIndex } from '../../../util/array';
import { REGISTRATION_DATE_FORMAT } from '../../../util/datetime';


export interface TargetSetting {
  from: string;
}

export interface TargetBucket extends TargetSetting {
  to: string;
}

export interface TimeRange {
  from: string;
  to: string;
}

export function getTargetBuckets<T extends TargetSetting, R extends T & TargetBucket>(targets: T[], range: TimeRange): R[] {

  const targetsSorted = targets.sort((a, b) => moment(a.from).valueOf() - moment(b.from).valueOf());

  const dates = targetsSorted.map(target => target.from);
  const hasOpenStart = dates.every(date => new Date(date) < new Date(range.from));
  const hasOpenEnd = hasOpenStart || dates.every(date => new Date(date) < new Date(range.to));

  const offsetIndex = hasOpenStart ?
    dates.length - 1 :
    findReverseIndex(dates, date => new Date(date) <= new Date(range.from));

  const limitIndex = hasOpenEnd ? dates.length : dates.findIndex(date => new Date(date) > new Date(range.to));
  const datesInRange = dates.slice(offsetIndex, limitIndex);
  const buckets: R[] = [];

  let startIndex = 0;
  for (let endIndex = startIndex + 1; endIndex <= datesInRange.length; ++startIndex, ++endIndex) {
    const from = datesInRange[startIndex];
    const to = endIndex >= datesInRange.length ? null :
      moment(datesInRange[endIndex]).subtract(1, 'day').format(REGISTRATION_DATE_FORMAT);
    const t = targetsSorted.find(target => target.from === from);
    buckets.push({ ...t , from, to } as R);
  }

  buckets[0].from = range.from;
  buckets[buckets.length - 1].to = range.to;

  return buckets;
}
