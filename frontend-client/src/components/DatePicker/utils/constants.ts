import moment, { Moment, unitOfTime } from 'moment';

export { PERIOD_FORMAT as DEFAULT_FORMAT } from 'utils/datetime';

export enum CalendarPeriod {
  'day' = 'day',
  'week' = 'week',
  'month' = 'month',
  'quarter' = 'quarter',
  'year' = 'year',
  'custom' = 'custom'
}

export type CalendarMonthDay = { year: number; month: number; day: number };
export type CalendarWeek = { week: number; days: CalendarMonthDay[] };
export type CalendarDate = Moment;
export type DateRange = { from: CalendarDate; to: CalendarDate };
export type DateSelection = DateRange;

export type DateChange = {
  type: CalendarPeriod;
  value: number;
  from: Moment;
  to: Moment;
};

export type DateSelectionChange = {
  date: CalendarDate;
};

export type RenderDayProps = {
  date: Moment;
  selection: DateSelection;
  period: CalendarPeriod;
  inCurrentMonth: boolean;
};

export type ParsePeriodDateProps = {
  date: string | CalendarDate;
  period: CalendarPeriod;
  isoWeek: boolean;
  resetStart?: boolean;
};

// todo handle iso standard dates better, now clumsy
export function parsePeriodDate(props: ParsePeriodDateProps): DateChange {
  const { date, period, isoWeek, resetStart = true } = props;
  const periodFn = period === CalendarPeriod.week && isoWeek ? 'isoWeek' : period;
  const from = resetStart ? moment(date).startOf(periodFn as unitOfTime.StartOf) : moment(date);
  const to = moment(date).endOf(periodFn as unitOfTime.StartOf);
  // eslint-disable-next-line
  const value = from[periodFn]() as number;
  return { type: period, from, to, value };
}

export const DAYS_PER_WEEK = 7;

export const ViewsPerPeriod = {
  [CalendarPeriod.custom]: [CalendarPeriod.day, CalendarPeriod.month, CalendarPeriod.year],
  [CalendarPeriod.day]: [CalendarPeriod.day, CalendarPeriod.month, CalendarPeriod.year],
  [CalendarPeriod.week]: [CalendarPeriod.week, CalendarPeriod.month, CalendarPeriod.year],
  [CalendarPeriod.month]: [CalendarPeriod.year],
  [CalendarPeriod.quarter]: [CalendarPeriod.year],
  [CalendarPeriod.year]: [CalendarPeriod.year]
};

export enum MONTHS {
  january,
  february,
  march,
  april,
  may,
  june,
  july,
  august,
  september,
  october,
  november,
  december
}
