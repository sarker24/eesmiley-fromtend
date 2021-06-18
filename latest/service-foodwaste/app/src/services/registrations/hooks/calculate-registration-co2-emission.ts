import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'calculate-registration-co2-emission';

/**
 * Calculates the co2 emission of a registration based on
 * the co2 per kg of a registration point and the amount wasted
 *
 * Before hook: CREATE
 */
export default function (): Hook {
  return async (hook: HookContext): Promise<HookContext> => {
    try {
      const sequelize = hook.app.get('sequelize');
      const { registrationPointId } = hook.data;

      const registrationPoint = await sequelize.models.registration_point.findOne({
        raw: true,
        where: {
          id: registrationPointId
        }
      });

      log.debug({
        registrationPoint, subModule, requestId: hook.params.requestId, sessionId: hook.params.sessionId
      }, 'Calculating co2 emission for the registration point');

      if (registrationPoint.co2Perkg) {
        hook.data.co2 = (registrationPoint.co2Perkg / 1000) * hook.data.amount;
      }

      return hook;
    } catch (err) {
      throw new errors.BadRequest('Could not calculate co2 emissions for given registration point', {
        errorCode: 'E088',
        data: hook.data,
        errors: err,
        subModule,
        requestId: hook.params.requestId,
        sessionId: hook.params.sessionId
      });
    }
  };
}
