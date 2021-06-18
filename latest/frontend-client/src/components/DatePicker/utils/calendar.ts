import { Moment } from 'moment';
import moment from 'moment';
import { DAYS_PER_WEEK, CalendarWeek } from './constants';

// creates a monthly view, including full weeks (ie days from previous and next months)
function createCalendarMonth(date: Moment, isoWeek: boolean): CalendarWeek[] {
  const weekFn = isoWeek ? 'isoWeek' : 'week';
  const firstWeekOfMonth: Moment = moment(date).startOf('month').startOf(weekFn);
  const lastWeekOfMonth: Moment = moment(date).endOf('month').endOf(weekFn);
  const numOfDays: number = lastWeekOfMonth.diff(firstWeekOfMonth, 'day') + 1;

  const days: Moment[] = Array.from(Array(numOfDays), (_, index) =>
    moment(firstWeekOfMonth).add(index, 'day')
  );

  return days.reduce(
    (weeks, date, index) => {
      if (index % DAYS_PER_WEEK === 0 && index > 0) {
        weeks.push({
          week: date[weekFn](),
          days: []
        });
      }

      weeks[weeks.length - 1].days.push({
        month: date.month(),
        year: date.year(),
        day: date.date()
      });
      return weeks;
    },
    [
      {
        week: moment(date).startOf('month')[weekFn](),
        days: []
      }
    ]
  );
}

function getShortWeekdayNames(isoWeek: boolean): string[] {
  if (!isoWeek) {
    return moment.weekdaysShort(true);
  }
  // iso order
  const [sun, ...rest] = moment.weekdaysShort();
  return [...rest, sun];
}

function getShortMonthNames(): string[] {
  return Array.from(Array(12), (_, index) => moment().month(index).format('MMM'));
}

function allowNextNavigation(nextDate: Moment, disableFutureDates: boolean): boolean {
  return !disableFutureDates || nextDate.isSameOrBefore(moment());
}

export { createCalendarMonth, getShortWeekdayNames, getShortMonthNames, allowNextNavigation };
