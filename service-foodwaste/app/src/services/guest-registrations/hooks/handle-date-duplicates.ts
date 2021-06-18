import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

/**

 In case user attempts to create new registration on date X using guest type Y and there already exists a
 record for the values X,Y, we need to soft delete the old record

 After hook: CREATE
 */

const subModule = 'handle-date-duplicates';

export default (): Hook => {
  return async (hook: HookContext) => {
    const sequelize = hook.app.get('sequelize');
    const guestRegistration = hook.result;
    const { requestId, sessionId } = hook.params;

    try {
      const duplicatesOnDate = await sequelize.models.guest_registration.findAll({
        raw: true,
        where: {
          date: guestRegistration.date,
          guestTypeId: guestRegistration.guestTypeId,
          customerId: guestRegistration.customerId,
          id: {
            $not: guestRegistration.id
          }
        }
      });

      if (duplicatesOnDate.length > 0) {
        const duplicateIds: number[] = duplicatesOnDate.map(duplicate => duplicate.id);
        await sequelize.models.guest_registration.destroy({
          where: {
            id: { $in: duplicateIds }
          }
        });
      }

      return hook;
    } catch (error) {
      throw new errors.GeneralError('Could not finish request - unexpected error occurred', {
        errorCode: 500,
        subModule,
        requestId,
        sessionId
      });
    }
  };
};
