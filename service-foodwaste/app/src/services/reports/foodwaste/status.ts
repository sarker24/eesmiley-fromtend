import { Application, Params, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';
import * as totalQueries from './util/total-queries';
import * as perGuestQueries from './util/per-guest-queries';

import { avg, groupBy, max, min, sum } from '../../../util/array';
import { Extra, Metric, MixedSeries, NestedSeries } from '../../../declarations/reports';
import { changeRatio, round } from '../../../util/math';
import { ExpectedWasteTarget } from '../../targets/foodwaste';
import { FOODWASTE_RESOURCE_TYPES, SortOrder } from '../../../util/constants';
import { createPeriod, getHistoryTimeRange } from '../../../util/datetime';

interface Registration {
  date: string;
  amount: number;
}

interface AreaRegistrationQuery {
  name: string;
  total: number;
  avg: number;
  min: number;
  max: number;
  registrations: Registration[];
}

interface FoodwasteStatusReport {
  series: MixedSeries[];
  metrics: Metric[];
  extra: Extra;
}

const PercentageCoeff = 100;
const NumberOfTotalPeriods = 4;
const NumberOfHistoryPeriods = 3;

class FoodwasteOverviewReportService implements SetupMethod, Pick<ServiceMethods<any>, 'find'> {
  app: Application;
  sequelize: Sequelize;
  targetService: Pick<ServiceMethods<any>, 'find'>;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
    this.targetService = app.service('/targets/foodwaste');
  }

  async find(params: Params): Promise<FoodwasteStatusReport> {
    const { customerId, date: selectedPeriodDate, registrationPointIds, dimension, unit, period = 'month', resource, guestTypeId } = params.query;

    const query = resource === FOODWASTE_RESOURCE_TYPES.perGuest ? perGuestQueries : totalQueries;
    const id = resource === FOODWASTE_RESOURCE_TYPES.perGuest ? 'foodwastePerGuest' : 'foodwaste';

    const queryPeriod = createPeriod(selectedPeriodDate, period);
    const recentHistoryTimeRange = getHistoryTimeRange(queryPeriod, NumberOfHistoryPeriods);

    const areas: AreaRegistrationQuery[] = (await this.sequelize.query(query.statusQuery(registrationPointIds, {
      dimension,
      order: SortOrder.desc,
      guestTypeId
    }), {
      replacements: {
        customerIds: customerId,
        registrationPointIds,
        from: recentHistoryTimeRange.from,
        to: recentHistoryTimeRange.to,
        period: queryPeriod.period,
        periodInterval: `${queryPeriod.interval.count} ${queryPeriod.interval.unit}`
      },
      type: this.sequelize.QueryTypes.SELECT
    })).map(record => ({
      ...record,
      total: resource === FOODWASTE_RESOURCE_TYPES.perGuest ? record.total : parseInt(record.total),
      min: resource === FOODWASTE_RESOURCE_TYPES.perGuest ? record.min : parseInt(record.min),
      max: resource === FOODWASTE_RESOURCE_TYPES.perGuest ? record.max : parseInt(record.max)
    }));

    const targets: ExpectedWasteTarget[] = await this.targetService.find({
      query: {
        ...params.query, date: { $gte: recentHistoryTimeRange.from, $lte: recentHistoryTimeRange.to }
      }
    });

    const avgTargetCumulative: number = (avg(targets.map(target => target.targetsTotal)) || 0);
    // fix this later to be areas.length, when areas query will return date grouped by period
    const avgTargetPerPeriod: number = avgTargetCumulative / NumberOfTotalPeriods;
    const areaData = groupOtherAreas(areas);
    const nonEmptyValues: number[] = areaData.map(area => area.total).filter(amount => amount > 0);
    const numOfPeriodWithRegistrations = Object.keys(groupBy(areaData.reduce((all, area) => all.concat(area.registrations.filter(r => r.amount > 0)), []), 'date')).length;
    const avgRegistrationPerPeriod: number = numOfPeriodWithRegistrations > 0 ? sum(nonEmptyValues)/numOfPeriodWithRegistrations : 0;
    const trend: number = (avgRegistrationPerPeriod > 0 && avgTargetPerPeriod > 0) ? PercentageCoeff * changeRatio(avgTargetPerPeriod, avgRegistrationPerPeriod) : 0;

    const performanceMetric: Metric = {
      id: `${id}StatusPerformance`,
      unit,
      point: round(avgRegistrationPerPeriod, 2),
      trend: round(trend, 2)
    };

    const byAreaSeries: NestedSeries = {
      id: `${id}StatusByAreas`,
      unit,
      aggregates: nonEmptyValues.length > 0 ? {
        total: round(sum(nonEmptyValues), 2),
        avg: round(avg(nonEmptyValues), 2),
        max: round(max(nonEmptyValues), 2),
        min: round(min(nonEmptyValues), 2),
      } : {
        total: 0,
        avg: 0,
        max: 0,
        min: 0,
      },
      series: areaData.map(area => ({
        id: `${id}StatusByArea`,
        unit,
        name: area.name,
        aggregates: {
          total: round(area.total, 2),
          avg: round(area.avg, 2),
          max: round(area.max, 2),
          min: round(area.min, 2)
        },
        points: area.registrations.map(registration => ({
          label: registration.date,
          value: round(registration.amount, 2)
        }))
      }))
    };

    return {
      series: [byAreaSeries],
      metrics: [performanceMetric],
      extra: {
        target: round(avgTargetPerPeriod, 2)
      }
    };
  }
}

/*
 Requirement:
 if more than 5 areas, group rest under 'other' area series
 */
function groupOtherAreas(areas: AreaRegistrationQuery[]) {

  if (areas.length < 6) {
    return areas;
  }

  const otherAreas = areas.slice(5);
  const top5 = areas.slice(0, 5);

  const allRegistrations: Registration[] = otherAreas.reduce((registrations, area) => registrations.concat(area.registrations), []);
  const registrationsByDate = groupBy(allRegistrations, 'date');
  const registrations = Object.keys(registrationsByDate).map(date => {
    const amounts = registrationsByDate[date].map(registration => (registration.amount));
    return { date, amount: sum(amounts) };
  });

  const registrationAmounts = registrations.map(r => r.amount);

  const others = {
    name: 'Other',
    total: sum(registrationAmounts),
    avg: avg(registrationAmounts),
    max: max(registrationAmounts),
    min: min(registrationAmounts),
    registrations
  };

  return [...top5, others];
}

export default FoodwasteOverviewReportService;
