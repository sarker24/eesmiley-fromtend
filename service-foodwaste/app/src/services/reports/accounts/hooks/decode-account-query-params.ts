/* istanbul ignore file */
import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';
import { AccountQuery } from '../../../../declarations/reports';

const subModule = 'parse-account-filters-params';

/*

 Decodes base64 encoded account filter string.
 (Base64 is used to avoid passing complex & long query params)

*/
export default (): Hook => {
  return async (hook: HookContext) => {
    const { accountsQuery: encodedAccountsQuery } = hook.params.query;
    let decodedAccountsQuery = '';

    try {
      decodedAccountsQuery = Buffer.from(encodedAccountsQuery, 'base64').toString('binary');
      hook.params.query.accountsQuery = JSON.parse(decodedAccountsQuery);
    } catch (error) {
      const { requestId, sessionId } = hook.params;
      throw new errors.GeneralError('Could not decode accounts query parameter', {
        errorCode: '400', encodedAccountsQuery, decodedAccountsQuery, errors: error, subModule, requestId, sessionId
      });
    }

    return hook;
  };
};
