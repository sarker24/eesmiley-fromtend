import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'get-follow-up-projects';
let requestId: string;
let sessionId: string;

export default function (): Hook {
  /**
   * Appends follow up projects to a parent project in an object "followUpProjects"
   *
   *
   * After-hook for: ALL
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook response object with the followUpProjects appended to the result
   */
  return function (hook: HookContext) {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;
    /*
     * A project can not be parent and child at the same time, so if it has
     * a parentProjectId, means it's a child, so no need to search if it has children
     *
     * For 'CREATE' method there will never be follow up projects so search is also aborted
     */
    if (hook.result.parentProjectId || hook.method === 'create') {

      return Promise.resolve(hook);
    }

    /*
     * Depending of the Feathers method used, "result" might be an array of projects or a project JSON object:
     * Method FIND: Array
     * Methods CREATE, PATCH, GET: Object
     *
     * In the case of an array, we need to loop through it and append to each project its followUp projects.
     */
    if (Array.isArray(hook.result)) {
      let responsePromises = [];
      hook.result.forEach((project) => {
        responsePromises.push(getFollowUpProjects(project, hook.app));
      });

      return Promise.all(responsePromises)
        .then((result) => {
          hook.result = result;

          return Promise.resolve(hook);
        })
        .catch((err) => {

          return Promise.reject(err);
        });
    }

    return getFollowUpProjects(hook.result, hook.app)
      .then((result) => {
        hook.result = result;

        return Promise.resolve(hook);
      })
      .catch((err) => {

        return Promise.reject(err);
      });
  };
}

/**
 * Appends an Array with the follow-up project for a given project. Property "followUpProjects" will be used
 *
 * @param parentProject
 * @param app
 * @returns {Promise<TResult|T>}
 */
function getFollowUpProjects(parentProject, app) {
  log.debug({
    subModule, requestId, sessionId, projectId: parentProject.id
  }, 'Getting follow-up projects');

  return app.service('projects').find({
    query: {
      parentProjectId: parentProject.id,
      $sort: {
        id: 1
      }
    }
  })
    .then((result) => {
      if (!result || result.length === 0) {
        log.debug({
          subModule, requestId, sessionId, projectId: parentProject.id
        }, 'No follow-up projects found');
      }
      parentProject.followUpProjects = result;

      return Promise.resolve(parentProject);
    })
    .catch((err) => {
      throw new errors.GeneralError('Could not get follow-up projects', {
        errors: err,
        errorCode: 'E152',
        parentProjectId: parentProject.id,
        subModule,
        requestId,
        sessionId
      });
    });
}
