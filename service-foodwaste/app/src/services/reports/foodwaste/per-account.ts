import { Application, Params, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';
import { Extra, Point, Series } from '../../../declarations/reports';
import { avg, max, min, sum } from '../../../util/array';
import { round } from '../../../util/math';
import { ExpectedWasteTarget } from '../../targets/foodwaste';
import * as totalQueries from './util/total-queries';
import * as perGuestQueries from './util/per-guest-queries';
import { FOODWASTE_RESOURCE_TYPES } from '../../../util/constants';

interface AccountQuery {
  name: string;
  customerId: string;
  total: number;
}

interface FoodwastePerAccountReport {
  series: Series[];
  extra: Extra;
}

// extract out constants
enum REPORT_IDS {
  foodwastePerAccount = 'PerAccount'
}

class FoodwastePerAccountService implements SetupMethod, Pick<ServiceMethods<any>, 'find'> {
  app: Application;
  sequelize: Sequelize;
  targetService: any;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
    this.targetService = app.service('/targets/foodwaste');
  }

  async find(params: Params): Promise<FoodwastePerAccountReport> {
    const { customerId, date, registrationPointIds, dimension, unit, order, resource, guestTypeId } = params.query;
    const query = resource === FOODWASTE_RESOURCE_TYPES.perGuest ? perGuestQueries : totalQueries;
    const id = resource === FOODWASTE_RESOURCE_TYPES.perGuest ? 'foodwastePerGuest' : 'foodwaste';

    const accountTotals: AccountQuery[] = (await this.sequelize.query(query.perAccountQuery(registrationPointIds, {
      dimension,
      order,
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
      total: resource === FOODWASTE_RESOURCE_TYPES.perGuest ? record.total : parseInt(record.total)
    }));

    const registrationPoints: Point[] = accountTotals.map(account => ({
      label: account.name || account.customerId,
      value: account.total
    }));

    const pointValues: number[] = registrationPoints.filter(point => point.value > 0).map(point => point.value);

    // perhaps formatting the values could extracted into an after hook
    const accountSeries: Series = {
      id: id + REPORT_IDS.foodwastePerAccount,
      unit,
      aggregates: pointValues.length > 0 ? {
        total: round(sum(pointValues), 2),
        avg: round(avg(pointValues), 2),
        min: round(min(pointValues), 2),
        max: round(max(pointValues), 2)
      }: {
        total: 0,
        avg: 0,
        min: 0,
        max: 0
      },
      points: registrationPoints.map(point => ({
        ...point,
        value: round(point.value, 2)
      }))
    };

    const targets: ExpectedWasteTarget[] = await this.targetService.find({ query: params.query });
    const avgTarget: number = avg(targets.map(target => target.targetsTotal));

    return {
      series: [accountSeries],
      extra: { target: avgTarget ? round(avgTarget, 2) : 0 }
    };
  }

}

export default FoodwastePerAccountService;
export { REPORT_IDS };
