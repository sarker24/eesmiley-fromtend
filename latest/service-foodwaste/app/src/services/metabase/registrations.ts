/* istanbul ignore file */

import moment from 'moment';
import * as errors from '@feathersjs/errors';
import * as jwt from 'jsonwebtoken';

const DASHBOARD_ID_WITHOUT_POINT_IDS = 5;
const DASHBOARD_ID_WITH_POINT_IDS = 14;

export interface RegistrationData {
  id: string;
}

export interface Response {
  url: string;
}

export function getMostSpecificPointFilter(query: { area?: string, category?: string, product?: string } = {}) : string {
  const { area, category, product } = query;
  const noFilter = '';

  if(product) {
    return product;
  }
  if(category) {
    return category;
  }

  if(area) {
    return area;
  }

  return noFilter;
}

export default class MetabaseRegistrations {
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
    const getRegs: any = {
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
      // replace with findOne, no need to get all
      const registrations: RegistrationData[] =
        await this.sequelize.models.registration.findAll(getRegs);

      rows = registrations.length;

    } catch (err) {
      throw new errors.GeneralError('Could not build report for registrations', {
        errorCode: 'E052',
        subModule: 'reports-registrations',
        params: params.query,
        errors: err.name === 'SequelizeDatabaseError' ? { message: err.message, err } : err,
        requestId: params.requestId,
        sessionId: params.sessionId
      });
    }

    if (! rows)
      return { url: null } as Response;

    let dateGroup: string = null;
    const dateGroupInput = (params.query.group) ? params.query.group : 'auto';

    switch (params.query.group) {
      case 'day':
      case 'week':
      case 'month':
      case 'quarter':
      case 'year':
        dateGroup = params.query.group;
        break;

      default:
        /*
         * We need to find a proper date grouping parameter. All PostgresQL native
         * 'date_trunc' groupings can be used.
         * https://www.postgresql.org/docs/9.1/functions-datetime.html#FUNCTIONS-DATETIME-TRUNC
         * We make use of day, week, month and quarter.
         */
        const rangeInDays = moment(params.query.to).diff(moment(params.query.from), 'days');

        if (rangeInDays < 32) {
          dateGroup = 'day';

        } else if (rangeInDays < 141) {
          dateGroup = 'week';

        } else if (rangeInDays < 601) {
          dateGroup = 'month';

        } else {
          dateGroup = 'quarter';
        }
        break;
    }

    if (this.app.get('metabase').secret) {

      let payload;

      if (this.app.get('metabase').maintenance) {
        payload = {
          resource: { dashboard: 9 },
          params: {}
        };

      } else {
        /*
        * We enforce following hierarchy for labels:
        * (less specific) area -> category -> product (most specific)
        *
        * Thus, if a user has selected a product filter, we can neglect
        * area and category filters. This is because we use unique ids that we can
        * use alone to determine product's tree and location in the tree (via path field)
        *
        * For handling optional point ids, we have 2 separate dashboards; one with point ids parameter filter
        * and one without. This is necessary due to the issue regarding locked parameters handled
        * as required.
        *
        * see https://github.com/metabase/metabase/issues/7306
        * -> locked parameters are interpreted as required, even if we set them as (nullable) optional
        *  */

        const selectedFilter: string = getMostSpecificPointFilter(params.query);
        const ids: string = selectedFilter.split('|').join(',');
        const pointIdList = ids.length === 0 ? null : ids;

        payload = {
          resource: { dashboard: pointIdList ? DASHBOARD_ID_WITH_POINT_IDS : DASHBOARD_ID_WITHOUT_POINT_IDS  },
          params: {
            from: params.query.from,
            to: params.query.to,
            date_group: dateGroup,
            customer_id: accountIds,
            point_id_list: pointIdList,
          }
        };
      }

      payload.exp = Math.round(Date.now() / 1000) + (60 * 60); // 60 minute expiration

      const token = jwt.sign(payload, this.app.get('metabase').secret);
      const url = this.app.get('metabase').site + '/embed/dashboard/' + token + '#bordered=false&titled=false';

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
