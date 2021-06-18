/**
 * Validates that there is at least one active guest type record,
 * if user is about to enable guest types in settings
 *
 * Before hook: CREATE/PATCH
 *
 **/
import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'validate-guest-type-flag';

export default (): Hook => {
  return async (hook: HookContext) => {
    const sequelize = hook.app.get('sequelize');
    const { requestId, sessionId } = hook.params;
    const settingsKey = hook.method === 'create' ? 'settings' : 'current';
    const { customerId, [settingsKey]: { guestTypes } } = hook.data;

    // TODO: setup settings schema to avoid these
    if (guestTypes) {
      const { enabled, migrationStrategy } = guestTypes;

      if (typeof enabled !== 'boolean') {
        throw new errors.GeneralError(
          'Could not process guest types, guest type enabled flag is not set',
          {
            subModule,
            requestId,
            sessionId
          });
      }

      if (!migrationStrategy) {
        throw new errors.GeneralError(
          'Could not process guest types, migration strategy is not set',
          {
            subModule,
            requestId,
            sessionId
          });
      }

      if ((enabled && !['delete', 'useDefault'].includes(migrationStrategy.op)) ||
        (!enabled && !['delete', 'nullify'].includes(migrationStrategy.op))) {
        throw new errors.GeneralError(
          'Could not process guest types, migration strategy is not supported',
          {
            subModule,
            requestId,
            sessionId
          });
      }

      if (enabled === true) {
        const defaultGuestType = await sequelize.models.guest_type.findOne({
          where: {
            customerId,
            active: true
          }
        });

        if (!defaultGuestType) {
          throw new errors.GeneralError(
            'Could not enable guest types, an active guest type is missing',
            {
              errorCode: 'E271',
              subModule,
              requestId,
              sessionId
            });
        }
      }
    }

    return hook;

  };
};
