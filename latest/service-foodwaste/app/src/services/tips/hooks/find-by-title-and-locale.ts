import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule = 'find-by-title-and-locale';
let requestId: string;
let sessionId: string;

export default function (): Hook {
  /**
   * Retrieves tip(s) by title for a given locale - looks into the JSONB columns.
   *
   * Before-hook for: find
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise
   */
  return function (hook: HookContext) {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    const locale = hook.params.query.locale;
    const title = hook.params.query.title;
    /*
     * If only one of either `locale` or `title` is given, then return BadRequest, since both must be present, if one
     * of them is given.
     * We have defined this input params check in here instead of in the Schemas, because it is a mess to defined such
     * a condition in there.
     */
    if ((typeof locale === 'string' && typeof title !== 'string') ||
      (typeof locale !== 'string' && typeof title === 'string')) {

      return Promise.reject(new errors.BadRequest('Both locale and title must be present as params, if one of them ' +
        'is given.', { subModule, params: hook.params.query, errorCode: 'E082', requestId, sessionId }));
    }

    /*
     * If both are given - query for tips with the given params.
     */
    if (typeof locale === 'string' && typeof title === 'string') {
      delete hook.params.query.title;
      delete hook.params.query.locale;

      const whereParams = hook.params.query;
      whereParams[`title.${locale}`] = title;

      return hook.app.get('sequelize').models.tip.findAll({ where: whereParams })
        .then((result) => {
          if (result.length === 0) {
            throw new errors.NotFound('No tips found.',
              { subModule, data: whereParams, errorCode: 'E083', requestId, sessionId });
          }

          hook.result = result;

          return Promise.resolve(hook);
        })
        .catch((err) => {
          if (err.data && err.data.errorCode) {
            return Promise.reject(err);
          }

          return Promise.reject(new errors.GeneralError('Could not get tips',
            { subModule, data: whereParams, errorCode: 'E083', errors: err, requestId, sessionId }));
        });
    }
  };
}
