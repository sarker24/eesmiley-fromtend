import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'calculate-registration-cost';

export default function (): Hook {
  /**
   * Calculates the cost of a registration based on the cost of a registration point and the amount wasted
   *
   * Before-hook for: create
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object
   */
  return async (hook: HookContext): Promise<HookContext> => {
    try {
      const sequelize = hook.app.get('sequelize');
      const { customerId, registrationPointId } = hook.data;

      const settings = await sequelize.models.settings.findOne({
        raw: true,
        attributes: [[sequelize.json('current.currency'), 'currency']],
        where: {
          customerId
        }
      });

      const registrationPoint = await sequelize.models.registration_point.findOne({
        raw: true,
        where: {
          id: registrationPointId
        }});

      log.debug({
        registrationPoint, subModule, requestId: hook.params.requestId, sessionId: hook.params.sessionId
      }, 'Calculating cost of waste for registration point');

      if(settings && settings.currency) {
        hook.data.currency = settings.currency;
      }
      hook.data.cost = (registrationPoint.costPerkg / 1000) * hook.data.amount;
      return hook;
    } catch (err) {
      throw new errors.BadRequest('Could not get price info for the given registration point', {
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
