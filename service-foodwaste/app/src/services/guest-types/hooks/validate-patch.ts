/**
 *
 * Enforce business requirement that user must have at least one activate type
 *
 * Before-hook for: PATCH
 *
 * */
import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule = 'validate-patch';

export default (): Hook => {
  return async (hook: HookContext) => {

    const sequelize = hook.app.get('sequelize');
    const { requestId, sessionId } = hook.params;
    const guestType = hook.data;

    if (guestType.active) {
      return hook;
    }

    let activeGuestType;

    try {
      activeGuestType = await sequelize.models.guest_type.findOne({
        raw: true,
        where: {
          active: true,
          customerId: guestType.customerId,
          id: {
            $not: guestType.id
          }
        }
      });
    } catch (error) {
      throw new errors.GeneralError('Could not apply changes - unexpected error occurred', {
        errorCode: 500,
        subModule,
        requestId,
        sessionId
      });
    }

    const hasNoActiveTypeLeft = !activeGuestType;

    if (hasNoActiveTypeLeft) {
      throw new errors.Conflict('Could not apply changes - at least one guest type must be set as active', {
        errorCode: 'E268',
        subModule,
        requestId,
        sessionId
      });
    }

    return hook;

  };
};
