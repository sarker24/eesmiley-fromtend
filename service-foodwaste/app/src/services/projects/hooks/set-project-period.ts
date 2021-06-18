import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule = 'set-project-period';
let requestId: string;
let sessionId: string;

export default (): Hook => {
  /**
   * If the new project has a parent project, we'll get the number of followUp projects to that parent and add a
   * period to the project we're creating. This period equals the number of followUp projects incremented by 2, because
   * the parent itself is the first period.
   *
   * Before-hook for: CREATE
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object
   */
  return (hook: HookContext & { parentProject: any; }) => {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    /*
     * When creating a parent project, the period is set to 1 by default by the DB. That's why we execute this hook
     * only for followUp projects
     */
    if (!hook.parentProject) {
      return Promise.resolve(hook);
    }

    /*
     * The period in reality is incremented by 1, but in the code it is +2, because the parent project itself is the
     * first period
     */
    hook.data.period = hook.parentProject.followUpProjects.length + 2;

    log.info({
      subModule, parentProjectId: hook.parentProject.id, newPeriod: hook.data.period, requestId, sessionId
    }, 'Starting new followUp project period');

    /*
     * Update the parent project's period to the period of the new followUp project
     */
    return hook.app.service('/projects').patch(hook.parentProject.id, [{
      op: 'replace',
      path: '/period',
      value: hook.data.period
    }])
      .then(() => {
        log.debug({
          subModule, parentProjectId: hook.parentProject.id, newPeriod: hook.data.period, requestId, sessionId
        }, 'Parent project updated with new period');

        return Promise.resolve(hook);
      })
      .catch((err) => {

        return Promise.reject(new errors.GeneralError('Could not update parent project with new period from ' +
          'new followUp project',
          {
            subModule,
            errors: err,
            parentProjectId: hook.parentProject.id,
            newPeriod: hook.data.period,
            errorCode: 'E176',
            requestId,
            sessionId
          }));
      });
  };
};
