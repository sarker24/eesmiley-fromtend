import * as errors from '@feathersjs/errors';

const subModule: string = 'projects-actions';
let requestId: string;
let sessionId: string;

/**
 * This file provides functionality for the endpoint /projects/:projectId/actions/:actionsId
 *
 * @param app
 * @returns Object
 */
export default function (app) {

  return {
    /**
     * FeathersJS CREATE method, creates a new action, and attaches it to the project identified with :projectId through a PATCH
     * request
     *
     * @param data
     * @param params
     * @returns {Promise}
     */
    create: (data, params) => {
      requestId = params.requestId;
      sessionId = params.sessionId;

      /*
       * Project identified with :projectId is retrieved.
       * If none found, error is thrown
       * If found, then action is created
       */
      return app.service('projects').get(params.projectId)
        .then((result) => {
          if (!result) {
            throw new errors.NotFound('Project not found.', {
              errorCode: 'E039', subModule, projectId: params.projectId, requestId, sessionId
            });
          }

          return app.service('actions').create(data);
        })
        /*
         * After creation of action, is is attached to the project through a PATCH request
         */
        .then((result) => {
          log.info({
            actionId: result.id, actionName: result.name, projectId: params.projectId, subModule, requestId, sessionId
          }, 'New Action created. Attaching it to the project...');

          const operation = [{
            op: 'add',
            path: '/actions/-',
            value: {
              id: result.id,
              name: result.name
            }
          }];

          return app.service('projects').patch(params.projectId, operation);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },

    /**
     * FeathersJS FIND method, returns the actions associated to the project identified with :projectId,
     * that match the params in the query
     *
     * @param params
     * @returns {Promise}
     */
    find: (params) => {
      requestId = params.requestId;
      sessionId = params.sessionId;

      /*
       * The Action(s) are related to a Project through a nested JSONB object within the Project entity. That's why
       * we only retrieve the Project itself.
       */
      return app.service('projects').get(params.projectId)
        .then((result) => {
          if (!result) {
            throw new errors.NotFound('Project not found.', {
              errorCode: 'E040', projectId: params.projectId, subModule, requestId, sessionId
            });
          }

          let filteredActions = result.actions;

          Object.keys(params.query).forEach(queryKey => {
            filteredActions = filteredActions.filter((actionItem) => {

              return actionItem[queryKey] == params.query[queryKey];
            });
          });

          return Promise.resolve(filteredActions);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },

    /**
     * FeathersJS GET method, returns the actions associated to the project identified with :projectId, that matches :actionId
     * Notice, that although there may exist an action identified with :actionId, it won't be return if it's not associated
     * to the project with id :projectId
     *
     * @param id
     * @param params
     * @returns {Promise}
     */
    get: (id, params) => {
      requestId = params.requestId;
      sessionId = params.sessionId;

      /*
       * Project identified with :projectId is retrieved.
       * If none found, error is thrown
       * If found, then actions are filtered according to id
       */
      return app.service('projects').get(params.projectId)
        .then((result) => {
          if (!result) {
            throw new errors.NotFound('Project not found.', {
              errorCode: 'E041', subModule, projectId: params.projectId, requestId, sessionId
            });
          }

          return result.actions.filter(actionItem => {
            return actionItem.id == id;
          })[0];
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },

    /**
     * FeathersJS REMOVE method, removes the action from the project
     *
     * @param id
     * @param params
     * @returns {Promise}
     */
    remove: (id, params) => {
      requestId = params.requestId;
      sessionId = params.sessionId;

      return app.service('projects').get(params.projectId)
        .then((result) => {
          if (!result) {
            throw new errors.NotFound('Project not found.', {
              errorCode: 'E042', subModule, projectId: params.projectId, requestId, sessionId
            });
          }
          /*
           * We lookup for the index of the element we want to remove from the 'actions' array
           */
          const actionId = result.actions.findIndex((action) => {
            return action.id == id;
          });

          const operation = [{
            op: 'remove',
            path: `/actions/${actionId}`
          }];

          log.info({
            actionId, projectId: params.projectId, subModule, requestId, sessionId
          }, 'Removing an Action from a Project...');

          return app.service('projects').patch(params.projectId, operation);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }
  };
}
