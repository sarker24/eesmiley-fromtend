import moment from 'moment';
import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const STATUS_PENDING_START = 'PENDING_START';
const STATUS_RUNNING = 'RUNNING';
const STATUS_ON_HOLD = 'ON_HOLD';
const DURATION_CALENDAR = 'CALENDAR';

let requestId: string;
let sessionId: string;

/**
 * Calculates the percentage of completion of one or more projects and sets it as a property
 *
 * @returns {(hook) => (Promise<any> | Promise<any>)}
 */
export default (): Hook => {
  return (hook: HookContext) => {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    let isResultAnArray = false;
    let projects = [];
    let projectPercentageCalculationPromises = [];

    /*
     * hook.result may be an object or a single array depending of which feathers http method triggered the hook
     * for FIND: hook.result is array
     * for CREATE, GET, PATCH: hook. result is a single object
     *
     * For pragmatic purposes, single objects will be treated as one element arrays, then once validations are done,
     * returned to the user as single objects
     */
    if (Array.isArray(hook.result)) {
      projects = hook.result;
      isResultAnArray = true;
    } else {
      projects.push(hook.result);
    }

    projects.forEach((project) => {
      /*
       * Depending of the current status of the project, the validation for the next status will be performed
       */
      switch (project.status) {
        case STATUS_PENDING_START:
          project.percentage = 0;
          projectPercentageCalculationPromises.push(project);
          break;
        case STATUS_RUNNING:
        case STATUS_ON_HOLD:
          if (project.duration.type === DURATION_CALENDAR) {
            projectPercentageCalculationPromises.push(calculatePercentageByDurationCalendar(project));
          } else {
            /*
             * Therefore project.duration.type == REGISTRATIONS
             */
            projectPercentageCalculationPromises.push(calculatePercentageByDurationRegistrations(project, hook.app));
          }
          break;
        default:
          project.percentage = 100;
          projectPercentageCalculationPromises.push(project);
          break;
      }
    });

    return Promise.all(projectPercentageCalculationPromises)
      .then((result) => {
        /*
         * result contains updated percentage for the project(s)
         */
        if (isResultAnArray) {
          hook.result = result;
        } else {
          hook.result = result[0];
        }

        return Promise.resolve(hook);
      })
      .catch((err) => {

        return Promise.reject(new errors.GeneralError('Could not calculate completion percentage of project', {
          errors: err,
          errorCode: 'E164',
          projects: hook.result,
          subModule: 'calculate-percentage-of-completion',
          requestId,
          sessionId
        }));
      });
  };
};

/**
 * Calculates the percentage of completion of a project with duration.type == CALENDAR
 *
 * @param project
 * @returns {Promise<any>}
 */
export function calculatePercentageByDurationCalendar(project) {
  const totalDurationOfProject = project.duration.end - project.duration.start;
  const elapsedTimeProject = moment().unix() - project.duration.start;

  if (elapsedTimeProject >= totalDurationOfProject) {
    project.percentage = 100;

    return Promise.resolve(project);
  }

  if (elapsedTimeProject <= 0) {
    project.percentage = 0;

    return Promise.resolve(project);
  }

  /*
   * Simple crossed multiplication to calculate the percentage of completion
   * totalDurationOfProject  -> 100%
   * elapsedTimeProject      -> X
   *
   * X = (elapsedTimeProject * 100) / totalDurationOfProject
   */
  project.percentage = Math.round((elapsedTimeProject * 100) / totalDurationOfProject);

  return Promise.resolve(project);
}

/**
 * Calculates the percentage of completion of a project with duration.type == CALENDAR
 *
 * @param project
 * @param app
 * @returns {Promise<T>}
 */
export function calculatePercentageByDurationRegistrations(project, app){
  const totalDurationOfProject = project.duration.days;
  let elapsedDaysProject = 0;

  const sequelize = app.get('sequelize');
  return sequelize.query('   SELECT distinct(registration.date) FROM   ' +
    '   registration,  ' +
    '   project_registration  ' +
    '   WHERE  ' +
    '   registration.id = project_registration.registration_id  ' +
    '   AND project_registration.project_id = $projectId  ',
    {
      bind: {
        projectId: project.id
      },
      type: sequelize.QueryTypes.SELECT
    })
    .then((result) => {
      elapsedDaysProject = result.length;
      if (elapsedDaysProject >= totalDurationOfProject) {
        project.percentage = 100;

        return Promise.resolve(project);
      }

      /*
       * Simple crossed multiplication to calculate the percentage of completion
       * totalDurationOfProject  -> 100%
       * elapsedDaysProject      -> X
       *
       * X = (elapsedDaysProject * 100) / totalDurationOfProject
       */
      project.percentage = Math.round((elapsedDaysProject * 100) / totalDurationOfProject);

      return Promise.resolve(project);
    })
    .catch((err) => {
      return Promise.reject(new errors.GeneralError('Could not calculate completion percentage of project', {
        errors: err,
        project,
        errorCode: 'E164',
        subModule: 'calculate-percentage-of-completion',
        requestId,
        sessionId
      }));
    });
}
