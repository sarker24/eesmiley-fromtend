import { Application, Params, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';
import { avg, groupBy, max, min, sum } from '../../../util/array';
import { round } from '../../../util/math';
import { MixedSeries, NestedSeries, Series } from '../../../declarations/reports';
import { FOODWASTE_RESOURCE_TYPES, SortOrder } from '../../../util/constants';
import * as perGuestQueries from './util/per-guest-queries';
import * as totalQueries from './util/total-queries';

interface Category {
  name: string;
  amount: number;
}

interface AreaCategoryQuery {
  name: string;
  total: number;
  avg: number;
  min: number;
  max: number;
  categories: Category[];
}

export interface FoodwasteOverviewReport {
  series: MixedSeries[];
}

class FoodwasteOverviewReportService implements SetupMethod, Pick<ServiceMethods<FoodwasteOverviewReport>, 'find'> {
  app: Application;
  sequelize: Sequelize;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  async find(params: Params): Promise<FoodwasteOverviewReport> {
    const { customerId, date, registrationPointIds, dimension, resource, guestTypeId } = params.query;

    const query = resource === FOODWASTE_RESOURCE_TYPES.perGuest ? perGuestQueries : totalQueries;

    const areasWithTopCategories: AreaCategoryQuery[] = (await this.sequelize.query(query.overviewQuery(registrationPointIds, {
      dimension,
      order: SortOrder.desc,
      guestTypeId
    }), {
      replacements: {
        customerIds: customerId,
        registrationPointIds,
        from: date.$gte,
        to: date.$lte
      },
      type: this.sequelize.QueryTypes.SELECT
    })).map(record => ({
      ...record,
      total: resource === FOODWASTE_RESOURCE_TYPES.perGuest ? record.total : parseInt(record.total),
      min: resource === FOODWASTE_RESOURCE_TYPES.perGuest ? record.min : parseInt(record.min),
      max: resource === FOODWASTE_RESOURCE_TYPES.perGuest ? record.max : parseInt(record.max),
      categories: record.categories.map(category => ({
        name: category.name,
        amount: resource === FOODWASTE_RESOURCE_TYPES.perGuest ? category.amount : parseInt(category.amount)
      }))
    }));

    // temp fix, so that accounts service that uses this endpoint can handle the grouping.
    // will be eventually moved to client so we can visualize the other points as well
    const areaData = params.provider ? groupOtherAreas(areasWithTopCategories, SortOrder.desc) : areasWithTopCategories;
    const areaSeries: NestedSeries = this.createAreaSeries(areaData, params.query);
    const secondSeries = resource === FOODWASTE_RESOURCE_TYPES.perGuest ? this.createAverageSeries(areaData, params.query) : this.createRatioSeries(areaData, params.query);
    return { series: [areaSeries, secondSeries] };
  }

  createAreaSeries(areas: AreaCategoryQuery[], options): NestedSeries {
    const { unit, resource } = options;
    const id = resource === FOODWASTE_RESOURCE_TYPES.perGuest ? 'foodwastePerGuest' : 'foodwaste';

    return {
      id: `${id}OverviewByAreas`,
      unit,
      aggregates: areas.length > 0 ? {
        total: round(sum(areas.map(area => area.total)), 2),
        avg: round(avg(areas.map(area => area.total)), 2),
        max: round(max(areas.map(area => area.total)), 2),
        min: round(min(areas.map(area => area.total)), 2)
      } : {
        total: 0,
        avg: 0,
        min: 0,
        max: 0
      },
      series: areas.map(area => ({
        id: `${id}OverviewByArea`,
        unit,
        name: area.name,
        aggregates: {
          total: round(area.total, 2),
          avg: round(area.avg, 2),
          max: round(area.max, 2),
          min: round(area.min, 2)
        },
        points: area.categories.slice(0, 3).map(category => ({
          label: category.name,
          value: round(category.amount, 2)
        }))
      }))
    };
  }

  createRatioSeries(areas: AreaCategoryQuery[], options): Series {
    const { resource } = options;
    const id = resource === FOODWASTE_RESOURCE_TYPES.perGuest ? 'foodwastePerGuest' : 'foodwaste';

    const areasTotal = sum(areas.map(area => area.total));
    const ratioPoints = areas.map(area => ({
      label: area.name,
      value: 100 * area.total / areasTotal
    }));

    return {
      id: `${id}OverviewAreaRatios`,
      unit: '%',
      aggregates: areas.length > 0 ? {
        total: 100,
        avg: round(avg(ratioPoints.map(point => point.value)), 2),
        min: round(min(ratioPoints.map(point => point.value)), 2),
        max: round(max(ratioPoints.map(point => point.value)), 2)
      } : {
        total: 0,
        avg: 0,
        min: 0,
        max: 0
      },
      points: ratioPoints.map(area => ({
        label: area.label,
        value: round(area.value, 2)
      }))
    };
  }

  // this was the quickest way for client, should be deprecated,
  // since this data is basically a duplicate from the first areas series
  createAverageSeries(areas: AreaCategoryQuery[], options): Series {
    const { unit, resource } = options;
    const id = resource === FOODWASTE_RESOURCE_TYPES.perGuest ? 'foodwastePerGuest' : 'foodwaste';
    return {
      id: `${id}OverviewAreaAverages`,
      unit,
      aggregates: areas.length > 0 ? {
        total: round(sum(areas.map(area => area.total)), 2),
        avg: round(avg(areas.map(area => area.total)), 2),
        max: round(max(areas.map(area => area.total)), 2),
        min: round(min(areas.map(area => area.total)), 2),
      } : {
        total: 0,
        avg: 0,
        min: 0,
        max: 0
      },
      points: areas.map(area => ({
        label: area.name,
        value: round(area.total, 2)
      }))
    };
  }
}

/*
 Requirement:
 if more than 5 areas, group rest under 'other' area series
 */
function groupOtherAreas(areas: AreaCategoryQuery[], order: SortOrder): AreaCategoryQuery[] {

  function sortCategories(a: Category, b: Category) {
    const difference = a.amount - b.amount;
    return order === SortOrder.desc ? -difference : difference;
  }

  if (areas.length < 6) {
    return areas;
  }

  const otherAreas = areas.slice(5);
  const top5 = areas.slice(0, 5);

  const allCategories: Category[] = otherAreas.reduce((categories, area) => categories.concat(area.categories), []);
  const categoriesByName = groupBy(allCategories, 'name');
  const categories = Object.keys(categoriesByName).map(name => {
    const amounts = categoriesByName[name].map(registration => registration.amount);
    return { name, amount: sum(amounts) };
  }).sort(sortCategories);

  const categoryAmounts = categories.map(area => area.amount);

  const others = {
    name: 'Other',
    total: sum(categoryAmounts),
    avg: avg(categoryAmounts),
    min: min(categoryAmounts),
    max: max(categoryAmounts),
    categories: categories.slice(0, 3) // top 3 categories
  };

  return [...top5, others];
}

export default FoodwasteOverviewReportService;
