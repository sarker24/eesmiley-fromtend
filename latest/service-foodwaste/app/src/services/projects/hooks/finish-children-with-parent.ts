import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const STATUS_FINISHED = 'FINISHED';

const subModule = 'finish-followups-with-parent';
let requestId: string;
let sessionId: string;

export default (): Hook => {
  /**
   * Changes the status of all followUp projects to FINISHED, if the parent project is patched with change to its
   * status to FINISHED.
   *
   * Before-hook for: PATCH
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object with the parent project as a property
   */
  return (hook: HookContext & { parentProject: any; operations: any[]; project: any; }) => {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    /*
     * Don't do anything for child projects
     */
    if (hook.parentProject) {
      return Promise.resolve(hook);
    }

    /*
     * If it's not a `replace` patch operation to set the `status` to 'FINISHED', then skip
     *
     * Note: if the PATCH is invoked externally (http request), it will have the "test" as first operation.
     * If invoked internally (a call from another module), we only pass the actual operations to be performed, thus it
     * will be at index 0.
     */
    const patchOperations = hook.operations[0].op === 'test' ? hook.operations[1] : hook.operations[0];

    if (!patchOperations ||
      ((patchOperations.op !== 'replace' && patchOperations.op !== 'add') ||
        patchOperations.path !== '/status' || patchOperations.value !== STATUS_FINISHED)) {
      return Promise.resolve(hook);
    }

    const sequelize: any = hook.app.get('sequelize');
    const followUpProjectIds = [];

    hook.project.followUpProjects.forEach(followUp => {
      followUpProjectIds.push(parseInt(followUp.id));
    });

    /*
     * The parent project will be patched anyway, so just set the `status` property to 'FINISHED' instead of
     * actually patching the record
     */
    hook.project.status = STATUS_FINISHED;

    log.info({
      subModule, parentProjectId: hook.project.id, followUpProjectIds, requestId, sessionId
    }, `Setting followUp projects to ${STATUS_FINISHED} because of parent project being set to FINISHED`);

    return sequelize.models.project.update({
      status: STATUS_FINISHED
    }, {
      where: { id: { $in: followUpProjectIds } },
      returning: true // tells Sequelize to return the updated records as objects. It is at index 1 in the DB result
    })
      .then(updatedFollowUpProjects => {

        updatedFollowUpProjects[1].forEach(followUp => {
          if (followUp.status !== STATUS_FINISHED) {
            throw new errors.GeneralError(`Updated follow-up project should have status ${STATUS_FINISHED}, but it does not`, {
              subModule,
              followUpProjectId: followUp.id,
              followUpProjectStatus: followUp.status,
              errorCode: 'E170',
              requestId,
              sessionId
            });
          }
        });

        /*
         * Update the `status` property of the followUp project(s) in the response object
         */
        hook.project.followUpProjects.forEach(followUp => {
          followUp.status = STATUS_FINISHED;
        });

        return Promise.resolve(hook);
      })
      .catch(err => {
        if (err.data && err.data.errorCode) {
          return Promise.reject(err);
        }

        return Promise.reject(new errors.GeneralError(`Could not update one or more follow-up projects to status ${STATUS_FINISHED}`, {
          subModule,
          errors: err,
          parentProjectId: hook.id,
          followUpProjectIds: followUpProjectIds,
          errorCode: 'E171',
          requestId,
          sessionId
        }));
      });
  };
};
