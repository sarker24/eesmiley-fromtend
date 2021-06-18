import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const STATUS_ON_HOLD = 'ON_HOLD';
const STATUS_FINISHED = 'FINISHED';
const STATUS_PENDING_ACTION = 'PENDING_ACTION';
const STATUS_PENDING_FOLLOWUP = 'PENDING_FOLLOWUP';
const allowedStatus: any = [STATUS_ON_HOLD, STATUS_FINISHED, STATUS_PENDING_ACTION, STATUS_PENDING_FOLLOWUP];
const statusToFinishProject: any = [STATUS_PENDING_ACTION, STATUS_PENDING_FOLLOWUP];
const subModule: string = 'prevent-multiple-running-follow-ups';
let requestId: string;
let sessionId: string;

export default (): Hook => {

  /**
   * Prevents multiple followUp projects RUNNING at the same time
   * As a pre-requirement hook.parentProject must be set through 'get-parent-project' hook
   *
   *
   * Before-hook for: CREATE, PATCH
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object with the existing project as a property
   */
  return (hook: HookContext & { operations: any[]; parentProject: any; }) => {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    if (!hook.data.parentProjectId || !hook.parentProject) {
      return Promise.resolve(hook);
    }

    if (hook.method === 'patch') {
      let isStatusChange = false;

      hook.operations.some((operation) => {
        isStatusChange = (operation.op === 'replace' || operation.op === 'add')
          && operation.path === '/status'
          && operation.value !== STATUS_ON_HOLD
          && operation.value !== STATUS_FINISHED;

        return isStatusChange;
      });

      if (!isStatusChange) {
        return Promise.resolve(hook);
      }
    }

    let followUpProjectsToBeFinishedPromises = [];

    try {

      log.debug({
        subModule,
        parentProjectId: hook.parentProject.id,
        followUpProjectsCount: hook.parentProject.followUpProjects.length,
        requestId,
        sessionId
      }, 'Validate that the parent project does NOT have multiple follow-up projects currently running');

      const hasParentOtherFollowUpsRunning = hook.parentProject.followUpProjects.some(({ id, status }) => (hook.method === 'create' || id !== hook.data.id) && !allowedStatus.includes(status));

      if (hasParentOtherFollowUpsRunning) {
        throw new errors.BadRequest('Status for other follow up projects for parentProjectId must ' +
          'be either ON_HOLD or FINISHED',
          {
            errorCode: 'E160', subModule, parentProjectId: hook.parentProject.id, requestId, sessionId
          });
      }

      hook.parentProject.followUpProjects.forEach((followUpProject) => {

        /*
         * If the parent happens to have followUp projects with status PENDING_INPUT or PENDING_FOLLOWUP, then, they are added to be later
         * mark as FINISHED
         */
        if (followUpProject.id !== hook.data.id && statusToFinishProject.includes(followUpProject.status)) {
          followUpProjectsToBeFinishedPromises.push(hook.app.service('projects').patch(followUpProject.id, [{
            op: 'replace',
            path: '/status',
            value: STATUS_FINISHED
          }]));
        }
      });
    } catch (err) {
      if (err.data && err.data.errorCode) {
        return Promise.reject(err);
      } else {
        return Promise.reject(new errors.BadRequest('Could not validate parent project', {
          errorCode: 'E167',
          subModule,
          parentProject: hook.parentProject,
          requestId,
          sessionId
        }));
      }
    }

    if (followUpProjectsToBeFinishedPromises.length === 0) {
      return Promise.resolve(hook);
    }

    return Promise.all(followUpProjectsToBeFinishedPromises)
      .then((result) => {

        return Promise.resolve(hook);
      })
      .catch((err) => {
        return Promise.reject(new errors.GeneralError('Could not mark other followUp projects as FINISHED', {
          errorCode: 'E168',
          errors: err,
          subModule,
          parentProject: hook.parentProject,
          requestId,
          sessionId
        }));
      });
  };
};
