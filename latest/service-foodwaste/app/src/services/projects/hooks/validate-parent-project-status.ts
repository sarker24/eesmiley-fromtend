import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const STATUS_PENDING_FOLLOWUP = 'PENDING_FOLLOWUP';
const STATUS_RUNNING_FOLLOWUP = 'RUNNING_FOLLOWUP';
const STATUS_PENDING_START = 'PENDING_START';
const STATUS_ON_HOLD = 'ON_HOLD';
const STATUS_FINISHED = 'FINISHED';

const subModule = 'validate-parent-project-status';
let requestId: string;
let sessionId: string;

export default (): Hook => {
  /**
   * Validates the status of a parent project in case of attempt of creation of a followUp project
   * If parent_project is ON_HOLD, sets status for PENDING_FOLLOWUP
   *
   * Before-hook for: CREATE, PATCH
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object with the parent project as a property
   */
  return (hook: HookContext & { parentProject: any; }) => {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    if (!hook.parentProject) {
      return Promise.resolve(hook);
    }

    if (hook.method === 'patch') {
      return validateParentForPatchMethod(hook);
    }

    return validateParentForCreateMethod(hook);
  };
};

/**
 * Prevents the creation of followUp projects if parent has status different from PENDING_FOLLOWUP, RUNNING_FOLLOWUP,
 * ON_HOLD or FINISHED.
 * If status of parent is ON_HOLD, then sets it to PENDING_FOLLOWUP.
 *
 * @param hook
 * @returns {any}
 */
export function validateParentForCreateMethod(hook) {
  if (hook.parentProject.status !== STATUS_PENDING_FOLLOWUP && hook.parentProject.status !== STATUS_RUNNING_FOLLOWUP
    && hook.parentProject.status !== STATUS_ON_HOLD && hook.parentProject.status !== STATUS_FINISHED) {

    return Promise.reject(new errors.GeneralError('Can not create a followUp project. Status of parent project ' +
      'not allowed for this action.',
      {
        errorCode: 'E161',
        parentProjectId: hook.parentProject.id,
        allowedParentProjectStatuses: [STATUS_PENDING_FOLLOWUP, STATUS_RUNNING_FOLLOWUP, STATUS_ON_HOLD, STATUS_FINISHED],
        parentProjectStatus: hook.parentProject.status,
        subModule,
        requestId,
        sessionId
      }));
  }

  if (hook.parentProject.status === STATUS_PENDING_FOLLOWUP) {
    return Promise.resolve(hook);
  }

  return setProjectStatus(STATUS_PENDING_FOLLOWUP, hook.parentProject.id, hook.app)
    .then((parentProject) => {
      hook.parentProject = parentProject;

      return Promise.resolve(hook);
    })
    .catch((err) => {
      return Promise.reject(new errors.GeneralError('Can not update status of parent project', {
        errors: err, parentProject: hook.parentProject, errorCode: 'E162', subModule, requestId, sessionId
      }));
    });
}

/**
 * Validates status of parent when patching status for the followup project
 * Changes the parent status to PENDING_FOLLOWUP, RUNNING_FOLLOWUP or ON_HOLD
 * depending of the case
 *
 * @param hook
 * @returns {any}
 */
export function validateParentForPatchMethod(hook) {
  let isStatusChange = false;
  let newStatusForParent = null;

  for (const operation of hook.operations) {
    if ((operation.op !== 'replace' && operation.op !== 'add') || operation.path !== '/status') {
      continue;
    }

    isStatusChange = true;

    /*
     * If followUp status set to PENDING_START => Parent status set to PENDING_FOLLOWUP
     * If followUp status set to something different from PENDING_START, ON_HOLD or FINISHED => Parent status set to RUNNING_FOLLOWUP
     * IF followUp status set to ON_HOLD or FINISHED => Parent status set to ON_HOLD
     */
    if (operation.value === STATUS_PENDING_START) {
      newStatusForParent = STATUS_PENDING_FOLLOWUP;
      break;
    }

    if ([STATUS_ON_HOLD, STATUS_FINISHED].includes(operation.value)) {
      newStatusForParent = STATUS_ON_HOLD;
      break;
    } else {
      newStatusForParent = STATUS_RUNNING_FOLLOWUP;
      break;
    }
  }

  if (!isStatusChange || (newStatusForParent === hook.parentProject.status)) {
    return Promise.resolve(hook);
  }

  return setProjectStatus(newStatusForParent, hook.parentProject.id, hook.app)
    .then((parentProject) => {
      hook.parentProject = parentProject;

      return Promise.resolve(hook);
    })
    .catch((err) => {
      return Promise.reject(new errors.GeneralError('Can not update status of parent project', {
        errors: err,
        parentProjectId: hook.parentProject.id,
        parentProjectStatus: hook.parentProject.status,
        followUpProjectId: hook.project.id,
        followUpProjectStatus: hook.project.status,
        errorCode: 'E162',
        subModule,
        requestId,
        sessionId
      }));
    });
}

/**
 * Does a patch operation setting the status of a given project
 *
 * @param status
 * @param parentProjectId
 * @param app
 */
function setProjectStatus(status, parentProjectId, app) {
  log.debug({
    parentProjectId, requestId, sessionId
  }, `Setting parent project status to "${status}"...`);

  return app.service('projects').patch(parentProjectId, [{
    op: 'replace',
    path: '/status',
    value: status
  }])
    .then((parentProject) => {
      return Promise.resolve(parentProject);
    })
    .catch((err) => {
      return Promise.reject(new errors.GeneralError('Can not update status of parent project', {
        errors: err, parentProjectId, statusToUpdateTo: status, errorCode: 'E162', subModule, requestId, sessionId
      }));
    });
}


