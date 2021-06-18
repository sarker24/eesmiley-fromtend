import * as errors from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';

const subModule = 'project-registrations';
let requestId: string;
let sessionId: string;

/**
 * This file provides functionality for the endpoint /projects/:projectId/registrations
 *
 * @param app
 * @returns Object
 */
export default function (app) {

  return {
    /**
     * FeathersJS GET method, returns the registrations associated to the project identified with :projectId, that matches "id"
     * Notice, that although there may exist a registration identified with "id", it won't be return if it's not associated
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
       * If found, then registrations are filtered according to id
       */
      return app.get('sequelize').models.project.findOne({
        where: {
          id: params.route.projectId,
          customerId: params.query.customerId
        }
      })
        .then((project) => {
          if (!project) {
            throw new errors.NotFound('Project not found.', {
              errorCode: 'E043', project, subModule, requestId, sessionId
            });
          }

          return project.getRegistrations();
        })
        .then((registrations) => {
          /*
           * This trick transforms from a Sequelize instance object into a plain JSON object.
           * See http://docs.sequelizejs.com/manual/tutorial/instances.html#values-of-an-instance (Linked 2017-07-10)
           * TODO: Get useful information from the Sequelize object in a decent way
           */
          registrations = JSON.parse(JSON.stringify(registrations));
          const filteredRegistrations = registrations.filter((element) => {
            return element.id == id;
          })[0];

          return Promise.resolve(filteredRegistrations);
        });
    },

    /**
     * FeathersJS FIND method, returns the registrations associated to the project identified with :projectId, that match the params in the query
     *
     * @param params
     * @returns {Promise}
     */
    find: (params: Params) => {
      requestId = params.requestId;
      sessionId = params.sessionId;
      const sequelize = app.get('sequelize');
      const { projectId } = params.route;
      /*
       * It's possible to receive boolean params as strings('true' or 'false') So to be sure, they are converted into propper
       * booleans
       */
      const isGroupBy = params.query.group === 'true' || params.query.group === true;
      delete params.query.group;

      const includeProject = params.query.includeProject === 'true' || params.query.includeProject === true;

      return sequelize.models.project.findOne({
        where: {
          id: projectId
        },
        include: [{
          model: sequelize.models.registration_point,
          as: 'registrationPoints',
          through: { attributes: [] }
        }]
      })
        .then((project) => {
          if (!project) {
            throw new errors.NotFound('Project not found.', {
              errorCode: 'E044', project, subModule, requestId, sessionId
            });
          }
          /*
           * If Param 'group' is provided, results will be groupped by registration_point_id. costs and amounts will be
           * added into total values
           */
          if (isGroupBy) {
            const registrationModel = sequelize.models.registration;
            /*
             * In case of a group By, Sequelize group functionality will be used to speed up process.
             * Since operation is done over registrations model, project_registration table is joined to get Id of project
             * and be able to filter by it
             */
            return {
              project,
              registrations: registrationModel.findAll({
                group: ['registrationPointId'],
                attributes: [
                  [sequelize.fn('sum', sequelize.col('cost')), 'cost'],
                  [sequelize.fn('sum', sequelize.col('amount')), 'amount'],
                  'registrationPointId'
                ],
                silent: true,
                timestamps: false,
                join: [{
                  model: [sequelize.models.project_registration, sequelize.models.project],
                  where: {
                    project_id: projectId
                  }
                }]
              })
            };
          }

          /*
           * If not group By needed, sequelize 'getRegistrations' is good enough
           */

          return { project, registrations: project.getRegistrations() };
        })
        .then((result) => {
          /*
           * We want the promises to be evaluated, but still passing 'project' to the next 'then'
           */
          return Promise.all([result.project, result.registrations]);
        })
        .then((result) => {
          let project = result[0];
          let registrations = JSON.parse(JSON.stringify(result[1]));

          delete params.query.includeProject;
          Object.keys(params.query).forEach((queryKey) => {
            registrations = registrations.filter((registrationItem) => {
              return registrationItem[queryKey] == params.query[queryKey];
            });
          });

          /*
           * Detailed info about registration point appended to result
           */
          registrations.forEach((registration) => {
            registration.registrationPoint = project.registrationPoints.filter((registrationPoint) => {
              return registrationPoint.id == registration.registrationPointId;
            })[0];

            /*
             * Because of the settings of Sequelize, fields such as date, createdAt, and updatedAt, are added to the result
             * which is undesired in the case of a grouped result
             */
            if (isGroupBy) {
              delete registration.date;
              delete registration.createdAt;
              delete registration.updatedAt;
            }
            return registration;
          });

          /*
           * If 'includeProject' flag is present; a project object with an array of registrations associated will be returned.
           * If the flag is not present, only the array of registrations will be returned
           *
           * TODO: Remove validation for 'includeProject' flag once frontend is ready, then system should behave
           * as it does now when 'includeProject = true'
           */
          if (includeProject) {
            project = JSON.parse(JSON.stringify(project));
            project.registrations = registrations;

            params.query.includeProject = true;

            return Promise.all([project, findRegistrationsChildrenProjects(project.id, params, app)]);
          }

          return Promise.all([registrations, findRegistrationsChildrenProjects(project.id, params, app)]);
        })
        .then((result) => {
          if (includeProject) {
            let project = result[0];
            project.followUpProjects = result[1];

            return Promise.resolve(project);
          }
          let response = result[0];
          /*
           * In case only the registrations are returned. Parent project registrations as well as children projects registrations
           * are merged into the same array
           */
          result[1].forEach((childProjectRegistrations) => {
            response = response.concat(childProjectRegistrations);
          });

          return Promise.resolve(response);

        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },

    /**
     * FeathersJS REMOVE method, removes the relationship between projects and registrations
     *
     * @param id
     * @param params
     * @returns {Promise}
     */
    remove: (id, params) => {
      const { projectId } = params.route;
      return app.get('sequelize').models.project_registration.findOne({
        where: {
          project_id: projectId,
          registration_id: id
        }
      })
        .then((projectRegistration) => {
          if (!projectRegistration) {
            throw new errors.NotFound('Project or registration not found.', {
              errorCode: 'E045',
              subModule,
              projectRegistration,
              requestId: params.requestId,
              sessionId: params.sessionId
            });
          }

          return projectRegistration.destroy();
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

  };
}

/**
 * Returns registrations for ALL children projects of a given parent projectId
 *
 * @param parentProjectId
 * @param params
 * @param app
 * @returns [{Promise<(T[]}]
 */
function findRegistrationsChildrenProjects(parentProjectId, params, app) {
  log.debug({
    parentProjectId, subModule, requestId, sessionId
  }, 'Getting children projects');

  return app.service('projects').find({ query: { parentProjectId } })
    .then((result) => {
      /*
       * If the given project has no children, we abort returning an empty array
       */
      if (!result || result.length === 0) {
        return Promise.resolve([]);
      }
      /*
       * We build an array with the registrations of each children project to be returned
       */
      let childProjectRegistrationsPromises: Array<any> = [];

      result.forEach((childProject) => {
        log.debug({
          childProjectId: childProject.id, subModule, requestId, sessionId
        }, 'Getting registrations for children projects');

        const childProjectParams = Object.assign({}, params);
        childProjectParams['route'] = { projectId: childProject.id };

        childProjectRegistrationsPromises.push(
          app.service(`projects/:projectId/registrations`).find(childProjectParams)
        );
      });

      return Promise.all(childProjectRegistrationsPromises);
    });
}
