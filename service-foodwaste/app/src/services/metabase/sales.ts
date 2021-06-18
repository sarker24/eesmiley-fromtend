/* istanbul ignore file */

import * as errors from '@feathersjs/errors';
import * as jwt from 'jsonwebtoken';

export interface SaleData {
  id: string;
}

export interface Response {
  url: string;
}

export default class MetabaseSales {
  app: any;
  private readonly sequelize: any;

  constructor(app: any) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  public async find(params): Promise<Response | Error> {
    let accountIds: string = null;
    let accountIdsSQL: string[] = params.query.accounts ? params.query.accounts.toString().split(',') : [];

    if (params.query.accounts) {
      accountIds = params.query.accounts.toString();

    } else {
      accountIds = params.query.customerId.toString();
      accountIdsSQL.push(params.query.customerId.toString());
    }

    if (accountIds == null) {
      throw new errors.GeneralError('No valid accountID was found in request.', {
        errorCode: 'E231',
        subModule: 'metabase',
        params: params.query,
        errors: {},
        requestId: params.requestId,
        sessionId: params.sessionId
      });
    }

    /*
     * First make a check for whether there exist any registrations
     * that match query params before - avoid sending back a url to empty search results.
     */
    const getSales: any = {
      attributes: [
        ['id', 'id'],
      ],
      where: {
        date: {
          $gte: params.query.from,
          $lte: params.query.to
        },
        customerId: {
          $in: accountIdsSQL
        }
      },
      limit: 1,
      offset: 0,
      raw: true,
      timestamps: false
    };

    let rows: number = 0;
    try {
      const sales: SaleData[] =
        await this.sequelize.models.sale.findAll(getSales);

      rows = sales.length;

    } catch (err) {
      throw new errors.GeneralError('Could not build report for sales', {
        errorCode: 'E078',
        subModule: 'reports-sales',
        params: params.query,
        errors: err.name === 'SequelizeDatabaseError' ? { message: err.message, err } : err,
        requestId: params.requestId,
        sessionId: params.sessionId
      });
    }

    if (!rows)
      return { url: null } as Response;

    if (this.app.get('metabase').secret) {

      let payload;

      if (this.app.get('metabase').maintenance) {
        payload = {
          resource: { dashboard: 9 },
          params: {}
        };

      } else {

        payload = {
          resource: { dashboard: 7 },
          params: {
            from: params.query.from,
            to: params.query.to,
            customer_id: accountIds
          }
        };
      }

      payload.exp = Math.round(Date.now() / 1000) + (60 * 60); // 60 minute expiration

      const token = jwt.sign(payload, this.app.get('metabase').secret);
      const url = this.app.get('metabase').site + '/embed/dashboard/' + token + '#bordered=false&titled=false';

      //return Promise.resolve({ url: url });
      return { url: url } as Response;

    } else {
      throw new errors.GeneralError('Missing METABASE_SECRET_KEY.', {
        errorCode: 'E230',
        subModule: 'metabase',
        params: params.query,
        errors: {},
        requestId: params.requestId,
        sessionId: params.sessionId
      });
    }
  }
}
