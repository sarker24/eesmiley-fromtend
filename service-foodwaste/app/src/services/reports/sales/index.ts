import * as errors from 'feathers-errors';
import { Params, Application, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';
import { getSalesQuery } from './util/sales-queries';

const subModule = 'reports/sales';

interface DailySaleReport {
  date: string;
  customerId: string;
  guests: number;
  portions: number;
  income: number;
  foodwasteCost: number;
  foodwasteAmount: number;
  foodwasteCostPerGuest: number;
  foodwasteAmountPerGuest: number;
  foodwasteCostPerPortion: number;
  foodwasteAmountPerPortion: number;
  incomePerGuest: number;
  incomePerPortion: number;
}

class SalesService implements SetupMethod, Pick<ServiceMethods<DailySaleReport>, 'find'> {
  app: Application;
  sequelize: Sequelize;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  async find(params: Params): Promise<DailySaleReport> {
    const { date, customerId } = params.query;

    try {
      return await this.sequelize.query(getSalesQuery, {
        replacements: {
          from: date.$gte,
          to: date.$lte,
          customerId
        },
        type: this.sequelize.QueryTypes.SELECT,
        order:[['date', 'desc']]
      });
    } catch (err) {
      throw new errors.GeneralError('Could not get sale registrations', {
        errorCode: '500',
        subModule,
        input: params.query,
        errors: err,
        requestId: params.requestId,
        sessionId: params.sessionId
      });
    }
  }
}

export default SalesService;

