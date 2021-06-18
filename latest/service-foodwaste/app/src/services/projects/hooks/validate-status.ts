import moment from 'moment';
import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const STATUS_PENDING_START = 'PENDING_START';
const STATUS_RUNNING = 'RUNNING';
const STATUS_PENDING_INPUT = 'PENDING_INPUT';
const STATUS_PENDING_FOLLOWUP = 'PENDING_FOLLOWUP';
const STATUS_RUNNING_FOLLOWUP = 'RUNNING_FOLLOWUP';
/*
 *Status ON_HOLD, and FINISHED are manually set by the client
 */
const DURATION_REGISTRATIONS = 'REGISTRATIONS';
const DURATION_CALENDAR = 'CALENDAR';

const subModule: string = 'validate-status';
let requestId: string;
let sessionId: string;

/**
 * Automatically routes to different status validators based on the current status
 *
 * @returns {(hook) => (Promise<any> | Promise<any>)}
 */
exports.route = (): Hook => {
  return (hook: HookContext) => {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    /*
     * To avoid circular references, this hook will only be trigger when request come from
     * the client or from '/registrations' endpoint
     */
    if (!hook.params.provider && !hook.params.isFromAssociateRegistrationWithProject) {
      return Promise.resolve(hook);
    }

    let isResultAnArray = false;
    let projects = [];
    let projectStatusPromises = [];

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

    for (const project of projects) {
      /*
       * Depending of the current status of the project, the validation for the next status will be performed
       */
      switch (project.status) {
        case STATUS_PENDING_START:
          projectStatusPromises.push(setToRunningStatus(project, hook.app, hook.params));
          break;
        case STATUS_RUNNING:
          projectStatusPromises.push(setToPendingInputStatus(project, hook.app, hook.params));
          break;
        case STATUS_PENDING_INPUT:
          projectStatusPromises.push(setToPendingFollowUpStatus(project, hook));
          break;
        case STATUS_PENDING_FOLLOWUP:
          projectStatusPromises.push(setToRunningFollowUpStatus(project, hook.app));
          break;
        default:
          projectStatusPromises.push(project);
          break;
      }
    }

    return Promise.all(projectStatusPromises)
      .then((result) => {
        /*
         * result contains updated status for the project(s)
         */
        if (isResultAnArray) {
          hook.result = result;
        } else {
          hook.result = result[0];
        }

        return Promise.resolve(hook);
      })
      .catch((err) => {
        return Promise.reject(new errors.GeneralError('Error updating status of projects', {
          errors: err, errorCode: 'E158', subModule, requestId, sessionId
        }));
      });

  };
};

/**
 * Validates and sets a project into status RUNNING if it reaches the duration criteria,
 * either the first day of registration happens, or the start date has passed
 *
 * @param project
 * @param app feathers app object
 * @param params feathers hook params
 * @returns {any}
 */
export function setToRunningStatus(project, app, params) {
  log.debug({
    projectId: project.id, subModule, requestId, sessionId
  }, `Validating if project should change status to ${STATUS_RUNNING}`);
  /*
   * Project will start 2 conditions (Either a.) or b.) must be fulfilled)
   * a.) If Its duration type is REGISTRATIONS and a new registration was associated to the project
   * b.) If its duration type is CALENDAR and the current date > start date of the project
   */
  if ((project.duration.type === DURATION_REGISTRATIONS && params.isFromAssociateRegistrationWithProject)
    || (project.duration.type === DURATION_CALENDAR && project.duration.start <= moment().unix())) {

    return setStatus(project.id, STATUS_RUNNING, app);
  }

  return Promise.resolve(project);
}

/**
 * Validates and sets a project into status PENDING_INPUT if it duration is fulfilled,
 * meaning Registrations days have been reached or chosen end date has passed
 *
 * @param project
 * @param app feathers app object
 * @param params feathers hook params
 * @returns {any}
 */
export function setToPendingInputStatus(project, app, params) {
  log.debug({
    projectId: project.id, params, subModule, requestId, sessionId
  }, `Validating if project should change status to ${STATUS_PENDING_INPUT}`);

  if (project.duration.type === DURATION_CALENDAR) {
    if (moment().diff(moment.unix(project.duration.end), 'days') > 0) {

      return setStatus(project.id, STATUS_PENDING_INPUT, app);
    }

    return Promise.resolve(project);
  }

  /*
   * DURATION TYPE is REGISTRATIONS
  */

  return validateSetToPendingInputDurationRegistrations(project, app, params);
}

/**
 * For a project with duration type REGISTRATIONS, queries the database to see how many
 * days of registrations the project has, if happens to be more than what is defined in project.duration
 * sets project status (Allowing user to still register on the last day)
 *
 * @param project
 * @param app Feathers js app object
 * @param params input parameters
 * @returns {any}
 */
export function validateSetToPendingInputDurationRegistrations(project, app, params) {
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
    .then((daysWithRegistrations) => {
      if (parseInt(project.duration.days) > parseInt(daysWithRegistrations.length)) {
        return Promise.resolve(project);
      }
      /*
       * In case we have fulfilled the total amount of days with registrations defined in project.duration.days, We check
       * if the status of the project needs to be changed. Different scenarios could happen:
       *
       * 1. User is trying to do a registration in a day that already HAS registrations, in that case we will NOT change project status
       * 2. User is trying to get a project, which has registrations made today, in that case we will NOT change project status
       * 3. In an y other case we WILL change project status
       */
      const dayToCompareAgainst = params.registrationDate ? moment(params.registrationDate, 'YYYY-MM-DD') : moment();
      const registrationOnTheSameDay = daysWithRegistrations.find((dayWithRegistrations) => {

        return moment(dayWithRegistrations.date, 'YYYY-MM-DD').diff(dayToCompareAgainst, 'days') === 0;
      });

      if (registrationOnTheSameDay) {
        return Promise.resolve(project);
      }

      return setStatus(project.id, STATUS_PENDING_INPUT, app);
    })
    .catch((err) => {

      return Promise.reject(new errors.GeneralError('Could not validate if a running project should change its status', {
        errors: err, errorCode: 'E172', project, subModule, requestId, sessionId
      }));
    });
}

/**
 * Validates and sets a project into status PENDING_FOLLOWUP if for a project in PENDING_INPUT,
 * the user has provided required input such as actions and/or goals
 *
 * @param project
 * @param hook feathers js hook object
 * @returns {any}
 */
export function setToPendingFollowUpStatus(project, hook) {
  log.debug({
    projectId: project.id, subModule, requestId, sessionId
  }, `Validating if project should change status to ${STATUS_PENDING_FOLLOWUP}`);
  /*
   * status will change if actions are added/removed to the project
   */
  if (hook.method !== 'patch') {
    return Promise.resolve(project);
  }

  let isChangeInActions = false;

  hook.operations.forEach((operation) => {
    if (operation.path === '/actions' && (operation.op === 'replace' || operation.op === 'add' || operation.op === 'remove')) {
      isChangeInActions = true;
    }
  });

  if (!isChangeInActions) {
    return Promise.resolve(project);
  }

  return setStatus(hook.id, STATUS_PENDING_FOLLOWUP, hook.app);
}

/**
 * Validates and sets a project into status RUNNING_FOLLOWUP if the user has created a
 * follow up project and this follow up has started RUNNING
 *
 * @param project
 * @param app Feathers js ap object
 * @returns {any}
 */
export function setToRunningFollowUpStatus(project, app) {
  log.debug({
    projectId: project.id, subModule, requestId, sessionId
  }, `Validating if project should change status to ${STATUS_RUNNING_FOLLOWUP}`);

  /*
   * STATUS will change if one the followup projects is running
   */
  if (!project.followUpProjects || project.followUpProjects.length === 0) {
    return Promise.resolve(project);
  }

  let isFollowUpRunning = false;

  project.followUpProjects.some((followUpProject) => {
    isFollowUpRunning = followUpProject.status === STATUS_RUNNING;

    return isFollowUpRunning;
  });

  if (!isFollowUpRunning) {
    return Promise.resolve(project);
  }

  return setStatus(project.id, STATUS_RUNNING_FOLLOWUP, app);
}

/**
 * Sets the project status to a given new status
 *
 * @param projectId
 * @param status New status to be assigned to the project
 * @param app
 */
function setStatus(projectId, status, app) {
  log.debug({
    projectId, subModule, requestId, sessionId
  }, `Changing project status to ${status}`);

  return app.service('projects').patch(projectId, [{
    op: 'replace',
    path: '/status',
    value: status
  }]);
}

