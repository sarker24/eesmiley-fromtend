/**
 *
 * Check if customer has guest types enabled in settings
 *
 * */
import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule = 'has-guest-types-enabled';

export default (): ((hook: HookContext) => Promise<boolean>) => {
  return async (hook: HookContext): Promise<boolean> => {

    const sequelize = hook.app.get('sequelize');
    const customerId = hook.params.query.customerId || hook.data && hook.data.customerId;
    try {
      return 1 === (await sequelize.models.settings.count({
        raw: true,
        where: {
          customerId,
          current: { guestTypes: { enabled: true } }
        }
      }));
    } catch (error) {
      const { requestId, sessionId } = hook.params;
      throw new errors.GeneralError('Could not apply changes - unexpected error occurred', {
        errorCode: 500,
        subModule,
        requestId,
        sessionId
      });
    }
  };
};
