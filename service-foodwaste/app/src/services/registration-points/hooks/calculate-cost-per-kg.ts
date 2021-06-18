import { Hook, HookContext } from '@feathersjs/feathers';

const AMOUNT_DEFAULT = 1000;
const COST_DEFAULT = 0;

export default function (): Hook {
  /**
   * Calculates the cost per kilogram (kg) for a registration point
   *
   * Before-hook for: create/patch
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object with a calculated costPerkg
   */
  return function (hook: HookContext) {
    /*
     * If no amount is provided a value of 1000 (1 kg) is used as default
     *
     * FIXME: #PROD-2084 Remove this default once Frontend is able to provide amount when posting registration points.
     */
    if (!hook.data.amount) {
      hook.data.amount = AMOUNT_DEFAULT;
    }

    if (!hook.data.cost) {
      hook.data.cost = COST_DEFAULT;
    }

    log.debug({
      data: hook.data,
      subModule: 'calculate-cost-per-kg',
      requestId: hook.params.requestId,
      sessionId: hook.params.sessionId
    }, 'Calculating costPerKg of registration point');

    const amountPerKg = hook.data.amount / 1000;
    hook.data.costPerkg = hook.data.cost / amountPerKg;

    return Promise.resolve(hook);
  };
}
