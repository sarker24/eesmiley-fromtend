/* istanbul ignore file */

import * as errors from '@feathersjs/errors';
import * as jwt from 'jsonwebtoken';

export default class MetabaseProjects {
  app: any;

  constructor(app: any) {
    this.app = app;
  }

  find(params) {
    let accountId: number = null;

    if (params.query.account) {
      accountId = params.query.account.toString();

    } else if (params.query.customerId) {
      accountId = params.query.customerId.toString();

    } else if (params.accessTokenPayload.customerId) {
      accountId = params.accessTokenPayload.customerId.toString();
    }

    if (accountId === null) {
      throw new errors.GeneralError('No valid accountID was found in request.', {
        errorCode: 'E231',
        subModule: 'metabase',
        params: params.query,
        errors: {},
        requestId: params.requestId,
        sessionId: params.sessionId
      });
    }

    if (this.app.get('metabase').secret) {

      let payload;

      if (this.app.get('metabase').maintenance) {
        payload = {
          resource: { dashboard: 9 },
          params: {}
        };

      } else {
        payload = {
          resource: { dashboard: 3 },
          params: {
            project_id: params.query.id,
            customer_id: accountId
          }
        };
      }

      payload.exp = Math.round(Date.now() / 1000) + (60 * 60); // 60 minute expiration

      const token = jwt.sign(payload, this.app.get('metabase').secret);
      const url = this.app.get('metabase').site + '/embed/dashboard/' + token + '#bordered=false&titled=false';

      return Promise.resolve({ url: url });

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
