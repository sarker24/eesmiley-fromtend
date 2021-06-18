/* istanbul ignore file */
import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';
import { AccountQuery } from '../../../../declarations/reports';
import parseAccounts from '../../../../hooks/parse-report-account-params';
import parseRegistrationPoints from '../../../../hooks/parse-registration-points-params';
import parseSortOrder from '../../../../hooks/parse-sort-order-params';
import { combine } from 'feathers-hooks-common';

const subModule = 'parse-accounts-query-params';

/*
 Parse accountsQuery array into customer ids and registration point ids
*/
export default (): Hook => {

  const parseQueryGroup = async (hook: HookContext) => {
    // TODO: quickest way to handle this for now, need to find better way
    const outHook = await combine(parseRegistrationPoints(), parseAccounts(), parseSortOrder())(hook) as any;
    const { name, customerId, registrationPointIds, order } = outHook.params.query;
    return { customerId, registrationPointIds, name, order };
  };

  return async (hook: HookContext) => {
    const accountsQuery: AccountQuery[] = hook.params.query['accountsQuery'];
    const parsedQueries = [];
    try {
      accountsQuery.forEach(accountQuery => {
        const query = { ...hook.params.query, ...accountQuery, name: accountQuery.name || accountQuery.accounts };
        const params = { ...hook.params, query };
        parsedQueries.push(parseQueryGroup({ ...hook, params }));
      });
      hook.params.query.accountsQueryList = await Promise.all(parsedQueries);
      delete hook.params.query.accountsQuery;
    } catch (error) {
      const { requestId, sessionId } = hook.params;
      throw new errors.GeneralError('Could not parse accounts query parameters', {
        errorCode: '400', accountsQuery, errors: error, subModule, requestId, sessionId
      });
    }

    return hook;
  };
};
