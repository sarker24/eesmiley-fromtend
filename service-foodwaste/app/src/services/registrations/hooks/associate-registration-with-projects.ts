import moment from 'moment';
import { Hook, HookContext } from '@feathersjs/feathers';
import Project = ProjectNamespace.Project;

const DURATION_CALENDAR = 'CALENDAR';

const subModule: string = 'associate-registration-with-projects';
let requestId: string;
let sessionId: string;

export default function (): Hook {
  /**
   * Queries projects, and creates associations between projects and registration, when they have registration point in common
   *
   * After-hook for: create
   */
  return async function (hook: HookContext): Promise<HookContext> {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;
    const regDateTimestamp: number = +moment.utc(hook.result.date).format('X');
    const registrationPoint = await hook.app.service('registration-points').get(hook.result.registrationPointId);

    /*
     * Projects are retrieved matching the following criteria:
     *
     * the project is in status PENDING_START or RUNNING
     * AND
     ** the project customerId equals to the given one
     * AND
     ** the project's start date is <= the date of the registration (so the reg fits in the project's time period)
     * AND
     * (
     *** the project contains the given registration point
     ** OR
     *** the project registration point has include_children flag set true and contains parent of the given registration point
     ** OR
     *** the project has no registration points (empty array in the corresponding columns)
     * )
    */
    const projectFilter = {
      query: {
        customerId: hook.data.customerId,
        status: {
          $in: [
            'PENDING_START',
            'RUNNING'
          ]
        },
        duration: {
          start: {
            $lte: regDateTimestamp
          }
        },
        $or: [
          {
            '$registrationPoints.id$': { $eq: null }
          },
          {
            '$registrationPoints.id$': registrationPoint.id
          },
          {
            $and: [
              {
                '$registrationPoints.path$': {
                  $contained: registrationPoint.path || registrationPoint.id
                }
              },
              {
                '$registrationPoints.project_registration_point.include_children$': true
              }
            ]
          }
        ]
      }
    };


    try {
      const projects: Project[] = await hook.app.service('projects').find({
        ...projectFilter,
        /*
         * Flag to indicate Find request to /projects comes from this hook,
         * used in a quick fix to handle project state changes with find/get requests
         */
        isFromAssociateRegistrationWithProject: true,
        registrationDate: hook.result.date
      });

      /*
       * For each project found, a record is stored in the linked table 'project_registration' creating an association
       * between the project and the registration.
       * If the project is of duration type CALENDAR, then also check the reg is within it's end period.
       * If of type REGISTRATION_DAYS, then the current project is always "open/valid" for more regs since it is in the
       * correct state (because it hasn't reached enough regs days) and has no "end" date.
       */
      const activeProjects = projects.filter(({ duration }) =>
        !(duration.type === DURATION_CALENDAR && duration.end < regDateTimestamp));

      const projectRegistrations = activeProjects.map(project => ({
        project_id: project.id,
        registration_id: hook.result.id
      }));

      log.info({
        projectRegistrations, subModule, requestId, sessionId
      }, 'Creating a Project-Registration relation...');

      await hook.app.get('sequelize').models.project_registration.bulkCreate(projectRegistrations);

      return hook;

    } catch (err) {
      /*
       * If an error occurs, it is logged, but it's not thrown to the user, since the registration was successfully
       * created
       */
      log.error({
        registrationId: hook.result.id, errorCode: 'E046', err, subModule, requestId, sessionId
      }, 'Could not create a relation between Project and Registration');

      return hook;
    }

  };
}
