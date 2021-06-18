/* istanbul ignore file */
import * as errors from '@feathersjs/errors';

import { Hook, HookContext } from '@feathersjs/feathers';
import { accountIdsInLimitQueryFn } from '../services/reports/foodwaste/util/common-queries';
import parseAccountParams from './parse-account-params';

const subModule = 'parse-account-limit-params';
const LimitRegex = /^(bottom|top)([1-9]\d*)$/;
const IdListRegex = /^[1-9]\d*(,[1-9]\d*)*$/;
const AllAccounts = '*';

/*
 Parses & handles report accounts params:
  -list of account ids OR
  -* for all registered accounts OR
  -top/bottomN, where N > 0 (get best/worst performing accounts)

  Requires dimension, date & registrationPointIds params are parsed.
 */
export default (): Hook => {
  return async (hook: HookContext) => {

    const { accounts, dimension, date, registrationPointIds = [] } = hook.params.query;
    const { customerId } = hook.params.accessTokenPayload;
    const sequelize = hook.app.get('sequelize');

    if (!accounts) {
      return hook;
    }

    async function getAllAccountIds(): Promise<number[]> {
      const settings = await hook.app.service('settings').find({ query: { customerId } });
      const registeredAccountIds: number[] = settings.accounts.map((accounts) => +accounts.id);
      return Array.from(new Set([...registeredAccountIds, +customerId]));
    }

    if (accounts === AllAccounts) {
      hook.params.query.customerId = await getAllAccountIds();
      delete hook.params.query.accounts;
      return hook;
    } else if (IdListRegex.test(accounts)) {
      return parseAccountParams()(hook);
    } else if (LimitRegex.test(accounts)) {
      const [, limitType, count] = accounts.match(LimitRegex);
      const accountLimit = { limitType, count: parseInt(count) };
      const allAccountIds: number[] = await getAllAccountIds();

      const accountsInLimit: { id: string }[] =
        await sequelize.query(accountIdsInLimitQueryFn(
          registrationPointIds, dimension, accountLimit
        ), {
          replacements: {
            customerIds: allAccountIds,
            registrationPointIds,
            from: date.$gte,
            to: date.$lte
          },
          type: sequelize.QueryTypes.SELECT
        });

      hook.params.query.customerId = accountsInLimit.map(accountId => +accountId.id);
      delete hook.params.query.accounts;
      return hook;
    } else {
      const { requestId, sessionId } = hook.params;
      throw new errors.GeneralError('Could not parse accounts parameter, unsupported format', {
        errorCode: '400', errors: accounts, subModule, requestId, sessionId
      });
    }
  };
};
