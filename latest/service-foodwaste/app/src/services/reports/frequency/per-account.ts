import { Application, Params, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';

import { Extra, NestedSeries, Series } from '../../../declarations/reports';
import moment from 'moment';
import { Moment } from 'moment';
import { avg, groupBy, max, min, sum } from '../../../util/array';
import { round } from '../../../util/math';
import 'moment-weekday-calc';
import { SortOrder } from '../../../util/constants';
import { CustomerFrequencyTarget, FrequencyTarget } from '../../targets/frequency/index';
import { getTargetBuckets, TimeRange } from '../../targets/util/target-bucket';

type MomentWithDow = Moment & { weekdayCalc: any };
type TargetDayCount = { [index: number]: number };
type TargetDaysBucket = { from: string, to: string, targetDOWs: TargetDayCount[] };

interface DayCount {
  totalTargetDays: number;
  onTargetDays: number;
  totalOtherDays: number;
  onOtherDays: number;
}

export interface CustomerDayCount extends DayCount {
  customerId: string;
}

interface RegistrationDayCount {
  customerId: string;
  date: string;
  dow: number;
  count: number;
}

interface FrequencyPerAccount {
  series: NestedSeries[];
  extra: Extra;
}

interface TargetDaysByCustomer {
  [index: string]: TargetDaysBucket[];
}

interface RegistrationDaysByCustomer {
  [index: string]: RegistrationDayCount[];
}

const PercentageCoeff = 100;

class FrequencyPerAccountService implements SetupMethod, Pick<ServiceMethods<FrequencyPerAccount>, 'find'> {
  app: Application;
  sequelize: Sequelize;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  async find(params: Params): Promise<FrequencyPerAccount> {
    const { date, order } = params.query;

    const customerDayCounts: CustomerDayCount[] = await this.getCustomerDayCounts(params);
    const daysInRange = moment(date.$lte).diff(date.$gte, 'days') + 1;

    const frequencyRatios = customerDayCounts.map(dayCount => {
      const { customerId, onTargetDays, onOtherDays, totalTargetDays } = dayCount;
      return {
        customerId,
        onTarget: PercentageCoeff * onTargetDays / daysInRange,
        onOther: PercentageCoeff * onOtherDays / daysInRange,
        target: PercentageCoeff * totalTargetDays / daysInRange,
        registrationTotal: PercentageCoeff * (onTargetDays + onOtherDays) / daysInRange
      };
    }).sort((a, b) => (a.registrationTotal - b.registrationTotal) * (order === SortOrder.desc ? -1 : 1));

    const customerTotalRatios: number[] = customerDayCounts.map(customerCounts => {
      const { onTargetDays, onOtherDays } = customerCounts;
      return round(PercentageCoeff * (onTargetDays + onOtherDays) / daysInRange, 2);
    });

    const minCustomerRatio: number = min(customerTotalRatios);
    const maxCustomerRatio: number = max(customerTotalRatios);
    const avgTargetRatio: number = round(avg(frequencyRatios.map(ratio => ratio.target)), 2);
    const avgRegistrationRatio: number = round(avg(frequencyRatios.map(ratio => ratio.registrationTotal)), 2);

    const onTargetSeries: Series = {
      id: 'frequencyOnTargetDays',
      unit: '%',
      aggregates: {},
      points: frequencyRatios.map(ratio => ({
        label: ratio.customerId,
        value: round(ratio.onTarget, 2)
      }))
    };

    const onOtherSeries: Series = {
      id: 'frequencyOnOtherDays',
      unit: '%',
      aggregates: {},
      points: frequencyRatios.map(ratio => ({
        label: ratio.customerId,
        value: round(ratio.onOther, 2)
      }))
    };

    const series: NestedSeries[] = [{
      id: 'frequencyPerAccount',
      unit: '%',
      aggregates: {
        avg: avgRegistrationRatio,
        min: minCustomerRatio,
        max: maxCustomerRatio
      },
      series: [onTargetSeries, onOtherSeries]
    }];

    return { series, extra: { target: avgTargetRatio } };
  }

  getTargetNumOfDaysBuckets(targetSettings: FrequencyTarget[], range: TimeRange): TargetDaysBucket[] {
    if (targetSettings.length === 0) {
      return [{
        from: range.from,
        to: range.to,
        targetDOWs: []
      }];
    }
    return getTargetBuckets(targetSettings, range).reduce((dayCountsByPeriod, curr) => {
      const from = moment(curr.from);
      const to = moment(curr.to);
      const targetDOWs: TargetDayCount = curr.days.reduce((dowCounts, dow) => ({
        ...dowCounts,
        [dow]: (moment() as MomentWithDow).weekdayCalc(from, to, [dow])
      }), {});

      const targetDOWsInPeriod = { from: curr.from, to: curr.to, targetDOWs };
      return [
        ...dayCountsByPeriod,
        targetDOWsInPeriod
      ];
    }, []);
  }

  async getCustomerDayCounts(params: Params): Promise<CustomerDayCount[]> {
    const { customerId, date } = params.query;

    const customerTargetSettings: CustomerFrequencyTarget[] = await this.sequelize.models.settings.findAll({
      raw: true,
      attributes: [
        'customerId',
        [this.sequelize.literal(
          `COALESCE(current->'expectedFrequency', jsonb_build_array())`
        ), 'targets']],
      where: {
        customerId
      }
    });

    const targetDayCounts: TargetDaysByCustomer = customerTargetSettings.reduce((total, { customerId, targets }) => ({
      ...total,
      [customerId]: this.getTargetNumOfDaysBuckets(targets, {
        from: date.$gte,
        to: date.$lte
      })
    }), {});

    const registrationDayCounts: RegistrationDayCount[] = await this.sequelize.models.registration.findAll({
      raw: true,
      attributes: [
        'customerId',
        'date',
        [this.sequelize.literal('EXTRACT(DOW FROM date)'), 'dow'],
        [this.sequelize.literal('COUNT(*)::INT'), 'count']
      ],
      where: {
        customerId: customerTargetSettings.map(settings => settings.customerId),
        date
      },
      group: ['customerId', 'date']
    });

    const registrationsByCustomer: RegistrationDaysByCustomer = groupBy(registrationDayCounts, 'customerId');

    return Object.keys(targetDayCounts).map(customerId => {
      const registrations: any[] = registrationsByCustomer[customerId] || [];
      const expectedDOWCountPeriods = targetDayCounts[customerId];
      const periodCounts: DayCount[] = expectedDOWCountPeriods.map(expectedDowPeriod => {
        const { from, to, targetDOWs } = expectedDowPeriod;

        // to optimize if this becomes bottleneck (if num of registrations x customers becomes large)
        const registrationsInRange = registrations.filter(registration =>
          moment(registration.date).isBetween(moment(from), moment(to), null, '[]'));

        const registrationDOWCounts = registrationsInRange.reduce((dowCounts, registration) => ({
          ...dowCounts,
          [registration.dow]: (dowCounts[registration.dow] || 0) + 1
        }), {});

        const onTargetDays = Object.keys(targetDOWs).reduce((total, dow) =>
          total + (registrationDOWCounts[dow] || 0)
          , 0);

        const onOtherDays = Object.keys(registrationDOWCounts).reduce((total, dow) =>
          targetDOWs[dow] ? total : total + registrationDOWCounts[dow], 0);

        const totalTargetDays = sum(Object.keys(targetDOWs).map(dow => targetDOWs[dow]));
        const totalDays = moment(to).diff(moment(from), 'days') + 1;
        const totalOtherDays = totalDays - totalTargetDays;
        return { onTargetDays, onOtherDays, totalTargetDays, totalOtherDays };
      });

      const totals = periodCounts.reduce((total, period) => ({
        ...total,
        totalTargetDays: total.totalTargetDays + period.totalTargetDays,
        totalOtherDays: total.totalOtherDays + period.totalOtherDays,
        onTargetDays: total.onTargetDays + period.onTargetDays,
        onOtherDays: total.onOtherDays + period.onOtherDays
      }), {
        totalTargetDays: 0,
        totalOtherDays: 0,
        onTargetDays: 0,
        onOtherDays: 0
      });

      return {
        customerId,
        ...totals
      };
    });
  }

}

export default FrequencyPerAccountService;
