import { Application, Params, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';
import {
  Aggregates,
  Extra,
  MixedSeries,
  NestedSeries,
  Point,
  Series
} from '../../../declarations/reports';
import { avg, groupBy, sum } from '../../../util/array';
import { round } from '../../../util/math';
import { Dimensions, totalAmountQuery } from '../foodwaste/util/common-queries';
import { FOODWASTE_RESOURCE_TYPES, SortOrder } from '../../../util/constants';
import { FoodwasteOverviewReport } from '../foodwaste/overview';

enum REPORT_IDS {
  areasGroups = 'areaGroups',
  accountsGroups = 'perAccountGroups',
  groupTotalsSeries = 'groupTotalSeries',
  totalAmountsSeries = 'totalAmountSeries',
  totalRatiosSeries = 'totalRatioSeries'
}

interface AccountsQuery {
  name: string;
  sort: string;
  customerId: string[];
  registrationPointIds: number[];
}

interface AccountSeriesGroup {
  id: string;
  extra?: Extra;
  unit?: string;
  aggregates?: Aggregates;
  series: MixedSeries[];
}

class FoodwasteAccountsReportService implements SetupMethod, Pick<ServiceMethods<any>, 'find'> {
  app: Application;
  sequelize: Sequelize;
  overviewService: any;
  accountService: any;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
    this.overviewService = app.service('/reports/foodwaste-overview');
    this.accountService = app.service('/reports/foodwaste-per-account');
  }

  async find(params: Params): Promise<any> {
    const areasByAccountSeries: AccountSeriesGroup = await this.getAreaSeries(params);
    const accountSeries: AccountSeriesGroup = await this.getAccountSeries(params);
    const groupTotalSeries: AccountSeriesGroup = await this.getGroupTotalsSeries(params, accountSeries);
    return { series: [areasByAccountSeries, accountSeries, groupTotalSeries] };
  }

  async getAreaSeries(params: Params): Promise<AccountSeriesGroup> {
    const { customerId, accountsQueryList, ...commonParams } = params.query;
    const promises = [];

    (accountsQueryList as AccountsQuery[]).forEach(({ name, ...accountsQuery }) => {
      const query = { ...commonParams, ...accountsQuery };
      promises.push(this.overviewService.find({ query }));
    });

    const overviews = await Promise.all(promises);
    const overviewsGrouped = this.groupByTopAreas(overviews);
    const accountAreaSeries: NestedSeries[] = overviewsGrouped.map((accountOverview, index) => {
      const accountsQuery: AccountsQuery = accountsQueryList[index];
      const [byArea] = accountOverview.series as NestedSeries[];

      return {
        ...byArea,
        name: accountsQuery.name
      };
    });

    return {
      id: REPORT_IDS.areasGroups,
      unit: accountAreaSeries.length > 0 ? accountAreaSeries[0].unit : null,
      aggregates: {},
      series: accountAreaSeries
    };
  }

  async getAccountSeries(params: Params): Promise<AccountSeriesGroup> {
    const { customerId, accountsQueryList, ...commonParams } = params.query;
    const promises = [];

    (accountsQueryList as AccountsQuery[]).forEach(({ name, ...accountsQuery }) => {
      const query = { ...commonParams, ...accountsQuery };
      promises.push(this.accountService.find({ query }));
    });

    const accountTotalResponses = await Promise.all(promises);
    const accountValues: number[] = accountTotalResponses
      .map(response => response.series[0].points)
      .reduce((all, points) => all.concat(points), [])
      .filter(point => point.value > 0)
      .map(point => point.value);

    const accountTargets: number[] = accountTotalResponses.filter((response => response.extra.target > 0)).map(response => response.extra.target);
    const accountsSeries: MixedSeries[] = accountTotalResponses.map((response, index) => {
      const accountsQuery: AccountsQuery = accountsQueryList[index];
      const [accountsSeries] = response.series;
      return {
        ...accountsSeries,
        name: accountsQuery.name
      };
    });

    return {
      id: REPORT_IDS.accountsGroups,
      aggregates: {
        avg: accountValues.length > 0 ? round(avg(accountValues), 2) : 0
      },
      unit: accountsSeries.length > 0 ? accountsSeries[0].unit : null,
      series: accountsSeries,
      extra: { target: round(avg(accountTargets), 2) }
    };
  }

  // TODO: separate type, sort and name not used
  mergeQueries(accountQuery: AccountsQuery[]): AccountsQuery[] {
    return accountQuery.length === 0 ? [] : [accountQuery.reduce((all, query) => ({
      sort: SortOrder.desc,
      name: '',
      customerId: Array.from(new Set(all.customerId.concat(query.customerId))),
      registrationPointIds: Array.from(new Set(all.registrationPointIds.concat(query.registrationPointIds)))
    }))];
  }

  async getGroupTotalsSeries(params: Params, accountsSeries: AccountSeriesGroup): Promise<AccountSeriesGroup> {
    const { customerId, date, dimension, accountsQueryList, resource } = params.query;

    if (resource === FOODWASTE_RESOURCE_TYPES.total) {
      const dimensionColumn = Dimensions[dimension].valueCol;
      const allRegisteredAccounts: string[] = await this.getAllAccountIds(customerId);
      const totalWaste: { amount: string } = await this.sequelize.models.registration.findAll({
        raw: true,
        plain: true,
        attributes: [[this.sequelize.literal(`SUM(${dimensionColumn})::BIGINT`), 'amount']],
        where: { date, customerId: allRegisteredAccounts }
      });

      const accountQueryWithAllPoints: AccountsQuery[] = this.mergeQueries((accountsQueryList as AccountsQuery[]).filter(query => query.registrationPointIds.length === 0));
      const accountQueryWithSelectedPoints: AccountsQuery[] = this.mergeQueries((accountsQueryList as AccountsQuery[])
        .filter(query => query.registrationPointIds.length > 0)
        .map(query => ({
          ...query,
          customerId: query.customerId.filter(customerId => accountQueryWithAllPoints.every(aq => !aq.customerId.includes(customerId)))
        }))
        .filter(query => query.customerId.length > 0));

      const queryForSelectedWaste = (accountQuery: AccountsQuery): Promise<{ amount: string }> => this.sequelize.query(totalAmountQuery(accountQuery.registrationPointIds, dimension), {
        raw: true,
        plain: true,
        type: this.sequelize.QueryTypes.SELECT,
        replacements: {
          customerIds: accountQuery.customerId,
          registrationPointIds: accountQuery.registrationPointIds,
          from: date.$gte,
          to: date.$lte
        }
      });

      const selectedWaste: { amount: number }[] = (await Promise.all([...accountQueryWithAllPoints, ...accountQueryWithSelectedPoints].map(queryForSelectedWaste))).map(record => ({
        ...record,
        amount: parseInt(record.amount)
      }));
      const otherWaste = parseInt(totalWaste.amount) - sum(selectedWaste.map(waste => waste.amount));

      const amountPoints: Point[] = [
        ...accountsSeries.series.map(series => ({
          label: series.name,
          value: series.aggregates.total
        })),
        { label: 'Other', value: otherWaste }
      ];

      const totalPointsValue: number = sum(amountPoints.map(point => point.value));

      const ratioPoints: Point[] = [
        ...accountsSeries.series.map(series => ({
          label: series.name,
          value: totalPointsValue > 0 ? round(100 * series.aggregates.total / totalPointsValue, 2) : 0
        })),
        { label: 'Other', value: totalPointsValue > 0 ? round(100 * otherWaste / totalPointsValue, 2) : 0 },
      ];

      const amountSeries: Series = {
        id: REPORT_IDS.totalAmountsSeries,
        unit: accountsSeries.unit,
        aggregates: { total: round(totalPointsValue, 2) },
        points: amountPoints
      };

      const ratioSeries: Series = {
        id: REPORT_IDS.totalRatiosSeries,
        unit: '%',
        aggregates: { total: 100 },
        points: ratioPoints
      };

      return {
        id: REPORT_IDS.groupTotalsSeries,
        series: [amountSeries, ratioSeries]
      };
    } else {
      // no 'other' point for per-guests
      const amountPoints: Point[] = [
        ...accountsSeries.series.map(series => ({
          label: series.name,
          value: series.aggregates.avg
        }))
      ];

      const amountSeries: Series = {
        id: REPORT_IDS.totalAmountsSeries,
        aggregates: {},
        unit: accountsSeries.unit,
        points: amountPoints
      };

      return {
        id: REPORT_IDS.groupTotalsSeries,
        series: [amountSeries]
      };
    }
  }

  async getAllAccountIds(customerId: string): Promise<string[]> {
    const settings = await this.app.service('settings').find({ query: { customerId } });
    const registeredAccountIds: string[] = settings.accounts.map((accounts) => accounts.id.toString());
    return Array.from(new Set([...registeredAccountIds, customerId]));
  }

  groupByTopAreas(overviewSeries: FoodwasteOverviewReport[]):
    FoodwasteOverviewReport[] {
    const overviewGroupSeries = overviewSeries.map(({ series }) => (series[0] as NestedSeries));
    const areasFlatten = overviewGroupSeries.map(groupSeries => groupSeries.series as Series[]).reduce((areas, area) => areas.concat(area));
    const areasByName = groupBy(areasFlatten, 'name');
    const areaTotals: { name: string; total: number; points: Point[] }[] = Object.keys(areasByName).map(areaName => ({
      name: areaName,
      total: sum(areasByName[areaName].map(area => area.aggregates.total)),
      points: areasByName[areaName].reduce((points, area) => points.concat(area.points), [])
    })).sort((a, b) => b.total - a.total);

    const top5AreasTop3Categories = areaTotals
      .slice(0, 5)
      .reduce((areas, area) => ({
        ...areas,
        [area.name]: {
          points: Array.from(
            new Set(
              area.points.sort((a, b) => b.value - a.value).map(point => point.label)
            )
          )
            .slice(0, 3)
            .reduce((pointLabels, pointLabel) => ({ ...pointLabels, [pointLabel]: true }), {})
        }
      }), {});

    // for other points, categories are shared among all other areas in all series
    const otherTop3Categories = Array.from(new Set(areaTotals
      .filter(area => !Boolean(top5AreasTop3Categories[area.name]))
      .reduce((points, area) => points.concat(area.points), [])
      .sort((a, b) => b.value - a.value)
      .map(point => point.label)
    ))
      .slice(0, 3)
      .reduce((pointLabels, pointLabel) => ({ ...pointLabels, [pointLabel]: true }), {});

    return overviewGroupSeries.map(groupSeries => {
      const areaSeries = groupSeries.series as Series[];
      const topAreas = areaSeries
        .filter(({ name }) => Boolean(top5AreasTop3Categories[name]))
        .map(series => ({
          ...series,
          points: series.points.filter(point => Boolean(top5AreasTop3Categories[series.name].points[point.label]))
        }));

      const otherAreas = areaSeries.filter(({ name }) => !Boolean(top5AreasTop3Categories[name]));

      if (otherAreas.length === 0) {
        return { series: [groupSeries] };
      }

      const otherCategories = otherAreas.reduce((categories, area) => categories.concat(area.points), []);
      const categoriesByLabel = groupBy(otherCategories, 'label');
      const categories = Object.keys(categoriesByLabel)
        .filter(label => Boolean(otherTop3Categories[label]))
        .map(label => {
          const values = categoriesByLabel[label].map(registration => registration.value);
          return { label, value: sum(values) };
        })
        .sort((a, b) => b.value - a.value);

      const aggregates =
        { total: sum(otherAreas.map(area => area.aggregates.total)) };

      const groupedSeries = [
        ...topAreas,
        {
          ...otherAreas[0], // grab common props
          name: 'Other',
          aggregates,
          points: categories
        }
      ];

      return { series: [{ ...groupSeries, series: groupedSeries }] };
    });
  }
}

export default FoodwasteAccountsReportService;
export { REPORT_IDS };
