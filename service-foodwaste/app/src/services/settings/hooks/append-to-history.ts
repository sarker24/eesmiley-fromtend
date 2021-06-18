import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'append-to-history';
let requestId: string;
let sessionId: string;

/**
 * Creates new settings for a customer, if none exist already. Otherwise, append the settings given as input to the
 * `history` property of the existing settings object, and then replace the `current` value with the input.
 *
 * Before-hook for: CREATE
 *
 * @return {any}
 */
export default (): Hook => {
  return async (hook: HookContext & { guestsMigrated: boolean; }) => {

    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    const input = hook.data;
    const { userId, customerId, settings } = input;
    const currentTimestamp = Date.now();

    const dataToStore: any = {};
    dataToStore.customerId = customerId;
    dataToStore.userId = userId;
    dataToStore.current = settings;
    dataToStore.history = {};

    let customerSettings;

    try {
      customerSettings = await hook.service.Model.findOne({ raw: false, where: { customerId: input.customerId } });
    } catch (err) {
      throw new errors.GeneralError('Could not create or update settings for customer', {
        errorCode: 'E050', subModule, customerId: input.customerId, errors: err, requestId, sessionId
      });
    }

    if (!customerSettings) {
      dataToStore.history[currentTimestamp] = input;
      hook.params['isNewCustomer'] = true;
      hook.data = dataToStore;

      log.info({
        input, subModule, newSettingsData: dataToStore, requestId, sessionId
      }, 'Stored new settings for customer');

      return hook;
    } else {

      try {
        customerSettings.history = { ...customerSettings.history, [currentTimestamp]: input };
        customerSettings.current = settings;

        await customerSettings.save();
        hook.result = JSON.parse(JSON.stringify(customerSettings));
        return hook;
      } catch (err) {
        throw new errors.GeneralError('Could not append new settings to the existing settings object', {
          errorCode: 'E177', subModule, errors: err, dataToStore, requestId, sessionId
        });
      }
    }
  };
};
