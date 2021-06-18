/**
 * Validate for 2 conditions:
 * If user has given guest type id, validates the record exists and is active.
 * If user has guest types enabled, validates the registration has guest type id
 *
 * Before hook: CREATE / PATCH
 */

import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule = 'validate-guest-registration';

export default (): Hook => {
  return async (hook: HookContext) => {
    const sequelize = hook.app.get('sequelize');
    const { requestId, sessionId } = hook.params;
    const guestRegistration = hook.data;
    let hasEnabledGuestTypes;

    try {
      hasEnabledGuestTypes = 1 === (await sequelize.models.settings.count({
        where: {
          customerId: guestRegistration.customerId,
          current: { enableGuestTypes: true }
        }
      }));
    } catch (error) {
      throw new errors.GeneralError('Could not finish request - unexpected error occurred', {
        errorCode: 500,
        subModule,
        requestId,
        sessionId
      });
    }

    if (!guestRegistration.guestTypeId && !hasEnabledGuestTypes) {
      return hook;
    }

    if (!guestRegistration.guestTypeId && hasEnabledGuestTypes) {
      throw new errors.GeneralError('No guest type id given but guest types are enabled', {
        errorCode: 'E270',
        subModule,
        requestId,
        sessionId
      });
    }

    let guestType;

    try {
      guestType = await sequelize.models.guest_type.findOne({
        raw: true,
        where: {
          id: guestRegistration.guestTypeId,
          customerId: guestRegistration.customerId,
          active: true
        }
      });
    } catch (error) {
      throw new errors.GeneralError('Could not finish request - unexpected error occurred', {
        errorCode: 500,
        subModule,
        requestId,
        sessionId
      });
    }

    if (!guestType) {
      throw new errors.GeneralError('No active guest type exists for given id', {
        errorCode: 'E269',
        subModule,
        requestId,
        sessionId
      });
    }

    return hook;

  };
};
