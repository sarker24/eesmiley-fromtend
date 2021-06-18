/**
 *
 * Enforce business requirement that user must have at least one activate type
 *
 * Before-hook for: REMOVE
 *
 * */
import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule = 'validate-remove';

export default (): Hook => {
  return async (hook: HookContext) => {

    const sequelize = hook.app.get('sequelize');
    const { requestId, sessionId } = hook.params;
    const guestTypeId = hook.id;

    let activeGuestType;

    try {
      activeGuestType = await sequelize.models.guest_type.findOne({
        raw: true,
        where: {
          active: true,
          customerId: hook.params.query.customerId,
          id: {
            $not: guestTypeId
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
