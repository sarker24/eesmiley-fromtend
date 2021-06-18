import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {

  /**
   * Gets the parent project for validation purposes in case of attempt of creation of a followUp project
   * Adds it to the hook object as a property called `parentProject'
   *
   *
   * Before-hook for: CREATE, PATCH
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object with the parent project as a property
   */
  return (hook: HookContext) => {
    if (!hook.data.parentProjectId) {
      hook['parentProject'] = null;

      return Promise.resolve(hook);
    }

    return hook.app.service('projects').get(hook.data.parentProjectId)
      .then((parentProject) => {
        if (parentProject.parentProjectId) {
          throw new errors.BadRequest('Parent project has a parent itself', {
            parentProject,
            errorCode: 'E166',
            subModule: 'get-parent-project',
            requestId: hook.params.requestId,
            sessionId: hook.params.sessionId
          });
        }

        hook['parentProject'] = parentProject;

        return Promise.resolve(hook);
      })
      .catch((err) => {
        if (err.data && err.data.errorCode) {
          return Promise.reject(err);
        }

        return Promise.reject(new errors.NotFound('Could not find parent project', {
          parentProjectId: hook.data.parentProjectId,
          errors: err,
          errorCode: 'E162',
          subModule: 'get-parent-project',
          requestId: hook.params.requestId,
          sessionId: hook.params.sessionId
        }));
      });
  };
};
