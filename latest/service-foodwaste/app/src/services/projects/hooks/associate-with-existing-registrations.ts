import * as errors from '@feathersjs/errors';
import moment from 'moment';
import * as _ from 'lodash';
import Project = ProjectNamespace.Project;
import Registration = RegistrationNamespace.Registration;
import Duration = ProjectNamespace.Duration;
import { Hook, HookContext } from '@feathersjs/feathers';

const DURATION_PERIOD: string = 'CALENDAR';
const DURATION_DAYS: string = 'REGISTRATIONS';
const subModule: string = 'associate-with-existing-registrations';

let requestId: string;
let sessionId: string;

/**
 * Creates project_registration association between Projects  and existing registrations
 * After-hook for CREATE, PATCH
 *
 * @returns {(hook) => (Promise<any> | Promise<any>)}
 */
export default (): Hook => {
  return async (hook: HookContext & { project: any; operations: any[]; }) => {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    const project: Project = hook.result;
    const projectPrevState: Project = hook.project;

    if (hook.method === 'create' && (project.duration.type === DURATION_DAYS && !project.duration.start)) {
      return hook;
    }

    const sequelize = hook.app.get('sequelize');

    /*
     * In case it's a PATCH request, we validate if a change is being done in the dates or registration points of the
     * Project.
     * In such case we associate the Project with the registrations that had been made withing the (new) properties
     * of the project.
     * The easiest way is to just deleting the existing project-registration relationships and creating new ones.
     */
    if (hook.method === 'patch') {
      const oldDuration: Duration = projectPrevState.duration;
      const oldRegistrationPointIds: Array<number> = projectPrevState.registrationPoints.map(({ id }) => id);
      const currentDuration: Duration = project.duration;
      const currentRegistrationPointIds: Array<number> = project.registrationPoints.map(({ id }) => id);

      if (_.isEqual(currentDuration, oldDuration)
        && _.isEqual(currentRegistrationPointIds, oldRegistrationPointIds)) {
        log.debug({
          project, subModule, requestId, sessionId
        }, 'No changes in start/end dates for edited project, no need re-create association with registrations');

        return hook;
      }

      try {
        await recreateAssociationsWithRegistrations(project, sequelize);

        return hook;

      } catch (err) {
        throw new errors.GeneralError('Could not associate edited project with registrations', {
          errorCode: 'E183',
          errors: err,
          operations: hook.operations,
          previousProjectVersion: projectPrevState,
          project,
          subModule,
          requestId,
          sessionId
        });
      }
    }

    try {
      if (project.duration.type === DURATION_PERIOD) {
        await associateRegistrationWithinPeriod(project, sequelize);
      } else {
        await associateRegistrationWithinDays(project, sequelize);
      }

      return hook;

    } catch (err) {
      throw new errors.GeneralError('Could not associate new Project with Registrations', {
        errorCode: 'E183', errors: err, project, subModule, requestId, sessionId
      });
    }
  };
};

/**
 * Deletes existing project_registration relationships, and invokes a function to re-create the original ones and/or
 * creates new ones based on the Project's `start` and `end` duration dates.
 *
 * @param project
 * @param sequelize
 * @returns {Promise<Project>}
 */
export async function recreateAssociationsWithRegistrations(project: Project, sequelize: any) {
  try {
    await sequelize.models.project_registration.destroy({
      where: { project_id: project.id }
    });

    log.info({
      project, projectId: project.id, subModule, requestId, sessionId
    }, 'Temporarily removed Project relationships with Registrations');

    if (project.duration.type === DURATION_PERIOD) {
      await associateRegistrationWithinPeriod(project, sequelize);
    } else {
      await associateRegistrationWithinDays(project, sequelize);
    }

    return project;

  } catch (err) {
    throw new errors.GeneralError('Could not recreate association between project and ' +
      'registrations with registrations',
      {
        errorCode: 'E182', errors: err, project, subModule, requestId, sessionId
      });
  }
}

/**
 * Creates project_registration relationships between freshly created/edited projects and existing registrations.
 *
 * The registrations to which the Project should be associated are queried by the following rules:
 * customerId
 * AND
 * startDate of Project <= registration <= endDate of Project
 * AND (?)
 * project contains registrationPointId of the registration.
 *
 * (?) - if the Project has no registration points stored at all, then the query will not include matching
 * registration point IDs of the registration.
 *
 * @param project
 * @param sequelize
 * @returns {Promise<Project>}
 */
export async function associateRegistrationWithinPeriod(project: Project, sequelize: any) {
  const registrationPointIds = await fetchSubtreeRegistrationPointIds(project, sequelize);
  const where: any = {
    customerId: project.customerId,
    date: {
      $gte: moment.unix(project.duration.start).format('YYYY-MM-DD'),
      $lte: moment.unix(project.duration.end).format('YYYY-MM-DD')
    }
  };

  if (registrationPointIds.length > 0) {
    where['registrationPointId'] = { $in: registrationPointIds };
  }

  try {
    const registrations: Array<Registration> = await sequelize.models.registration.findAll({ where });
    const projectsRegistrations = registrations.map(registration => ({
      'project_id': project.id,
      'registration_id': registration.id
    }));

    await sequelize.models.project_registration.bulkCreate(projectsRegistrations);

    log.info({
      project, subModule, requestId, sessionId
    }, 'Associated existing Registrations with a Project');

    return project;

  } catch (err) {
    throw new errors.GeneralError('Could not associate project with registrations', {
      errorCode: 'E181', errors: err, project, subModule, requestId, sessionId
    });
  }
}

/**
 * Creates project_registration relationships between edited projects and existing registrations.
 *
 * The registrations to which the Project should be associated are queried by the following rules:
 * customerId
 * AND
 * If start date is provided, then registrations older than this
 * AND
 * project contains registrationPointId of the registration.
 *
 * Amount of registrations will be limited to the duration days of the project
 *
 * (?) - if the Project has no registration points stored at all, then the query will not include matching
 * registration point IDs of the registration.
 *
 * @param project
 * @param sequelize
 * @returns {Promise<Project>}
 */
export async function associateRegistrationWithinDays(project: Project, sequelize: any) {
  const registrationPointIds = await fetchSubtreeRegistrationPointIds(project, sequelize);
  const where: any = {
    customerId: project.customerId,
  };

  if (registrationPointIds.length > 0) {
    where['registrationPointId'] = { $in: registrationPointIds };
  }

  if (project.duration.start) {
    where['date'] = {
      $gte: moment.unix(project.duration.start).format('YYYY-MM-DD')
    };
  }

  const sequelizeQuery = {
    attributes: ['date'],
    where,
    raw: true,
    timestamps: false,
    order: [['date', 'DESC']],
    limit: project.duration['days']
  };

  let daysWithRegistrations;

  try {
    /*
     * Since this a project with duration === REGISTRATIONS there is a fixed amount of days it can have registrations,
     * we retrieve the latest n days with registrations matching the project's properties in order to know which
     * will be the days that will have the existing registrations associated to the project
     *
     */
    daysWithRegistrations = JSON.parse(JSON.stringify(await sequelize.models.registration.findAll(sequelizeQuery)));
  } catch (err) {
    throw new errors.GeneralError(
      'Could not retrieve dates of registrations for the process of associating projects with registrations',
      { errorCode: 'E195', errors: err, project, subModule, requestId, sessionId });
  }

  if (daysWithRegistrations.length === 0) {
    return project;
  }

  where['date'] = { $in: daysWithRegistrations.map((registration) => registration.date) };
  let registrationIdsToAssociateWith;

  try {
    /*
     * In order to know which registrations should be associated with the project, we retrieve all the ids of the
     * registrations comprehended in the list of dates previously retrieved
     */
    registrationIdsToAssociateWith = JSON.parse(JSON.stringify(await sequelize.models.registration.findAll({
      attributes: ['id'],
      where,
      raw: true,
      timestamps: false,
    })));
  } catch (err) {

    throw new errors.GeneralError(
      'Could not retrieve ids of registrations for the process of associating projects with registrations',
      { errorCode: 'E196', errors: err, project, subModule, requestId, sessionId });
  }

  try {
    const projectsRegistrations = registrationIdsToAssociateWith.map(registration => ({
      'project_id': project.id,
      'registration_id': registration.id
    }));

    await sequelize.models.project_registration.bulkCreate(projectsRegistrations);

    log.info({
      project, subModule, requestId, sessionId
    }, 'Associated existing Registrations with a Project');

    return project;

  } catch (err) {
    throw new errors.GeneralError('Could not associate project with registrations', {
      errorCode: 'E181', errors: err, project, subModule, requestId, sessionId
    });
  }
}

/**
 * Fetch children registration point ids of the registration points registered to project.
 *
 * Registrations can take place at any level in the registration trees; We have 3 use cases:
 * 1. project has no specified registration points => all registration points of the customer are included to the project
 * 2. project has registration points with include children flag set to false => only include specified points
 * 3  project has registration points witn include children flag set true => fetch included points and also all point in
 * subtree
 *
 *
 * @param project
 * @param sequelize
 */
export async function fetchSubtreeRegistrationPointIds(project, sequelize) {
  const { registrationPoints } = project;

  if (!registrationPoints || registrationPoints.length === 0) {
    return [];
  }

  const registrationPointIds = await sequelize.query(
    'SELECT registration_point.id FROM project \n' +
    'LEFT JOIN project_registration_point prp ON prp.project_id = project.id\n' +
    'LEFT JOIN registration_point \n' +
    'ON registration_point.id = prp.registration_point_id \n' +
    'OR (prp.project_id IS NOT NULL AND prp.include_children = TRUE AND registration_point.path ~ concat(\'*.\', prp.registration_point_id, \'.*\')::lquery)\n' +
    'OR (prp.project_id IS NULL AND registration_point.customer_id = project.customer_id)\n' +
    'where project.id = :projectId',
    {
      raw: true,
      replacements: {
        projectId: project.id
      },
      type: sequelize.QueryTypes.SELECT
    });

  return registrationPointIds.map(registrationPoint => registrationPoint.id);

}
