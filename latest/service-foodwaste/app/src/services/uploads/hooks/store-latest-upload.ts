import moment from 'moment';
import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

export default function (): Hook {
  /**
   * Stores a key-value pair within the settings object indicating when was the last time an ingredients file
   * upload was performed.
   *
   * Before-hook for: patch
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object
   */
  return (hook: HookContext) => {

    return hook.app.service('settings').find({
      query: {
        customerId: hook.data.customerId
      }
    }, hook.params)
      .then((result) => {
        let settings = {};
        /*
         * Settings endpoint, supports upsert, so we are going to post to CREATE method no matter what
         *
         * If there is an existing settings record, we will post back the settings object with 'lastUpload'
         * property set to the current unix timestamp
         *
         * In case there are no settings records, a new one is created; setting 'lasUpdate' as well
         */
        if (!result || Object.keys(result).length === 0) {
          settings['settings'] = {};
        } else {
          settings['settings'] = result;
        }
        settings['customerId'] = hook.data.customerId;
        settings['userId'] = hook.data.userId;
        settings['settings']['lastUpload'] = moment().unix();

        return hook.app.service('settings').create(settings, hook.params);
      })
      .then((result) => {
        log.debug({
          settings: result,
          subModule: 'store-latest-upload',
          requestId: hook.params.requestId,
          sessionId: hook.params.sessionId
        }, 'Timestamp for last ingredients file upload successfully added to settings object.');

        return Promise.resolve(hook);
      })
      .catch((err) => {
        return Promise.reject(new errors.GeneralError('Could not store timestamp for last ingredients file upload ' +
          'in settings.',
          {
            errorCode: 'E127',
            subModule: 'store-latest-upload',
            data: hook.data,
            errors: err,
            requestId: hook.params.requestId,
            sessionId: hook.params.sessionId
          }));
      });
  };
}
