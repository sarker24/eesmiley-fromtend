import * as errors from '@feathersjs/errors';
import { extractPathIds } from '../../../util/tree';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'validate-dependencies-are-active';


export default (): Hook => {
  /**
   * Validates that the dependencies of the Project (registration points) are active. This means that the registration points
   * and their ancestor registration points in the tree have property `active` set to `true`.
   *
   * Before-hook for: PATCH, CREATE
   *
   * @params {any} hook The hook object with the Project data
   * @returns {Promise} The same hook object
   */
  return async (hook: HookContext) => {
    const sequelize = hook.app.get('sequelize');
    const registrationPointIds: number[] = hook.data.registrationPoints.map(registrationPoint => registrationPoint.id);

    try {
      const registrationPoints = await sequelize.models.registration_point.findAll({
        raw: true,
        where: {
          id: {
            $in: registrationPointIds
          }
        }
      });

      if (registrationPointIds.length !== registrationPoints.length) {
        const nonExistentIds = registrationPointIds.filter(id => !registrationPoints.some(registrationPoint => parseInt(registrationPoint.id) === id));
        throw new errors.GeneralError(`Cannot ${hook.method} Project with non-existent Registration Points`,
          {
            subModule,
            errorCode: 'E263',
            registrationPointIds: nonExistentIds,
            projectId: hook.data.id || 'new project'
          });
      }

      const inactivePoints = registrationPoints.filter(registrationPoint => !registrationPoint.active);
      if(inactivePoints.length > 0) {
        throw new errors.GeneralError(`Cannot ${hook.method} Project with inactive Registration Points`,
          {
            subModule,
            errorCode: 'E264',
            registrationPointIds: inactivePoints.map(registrationPoint => parseInt(registrationPoint.id)),
            projectId: hook.data.id || 'new project'
          });
      }

      const ancestorIds = extractPathIds(registrationPoints);

      if(ancestorIds.length === 0) {
        return hook;
      }

      const inactiveAncestorPoints = await sequelize.models.registration_point.findAll({
        raw: true,
        where: {
          id: { $in: ancestorIds },
          active: false
        }
      });

      if (inactiveAncestorPoints.length > 0) {
        throw new errors.GeneralError(`Cannot ${hook.method} Project with inactive ancestor Registration Points`,
          {
            subModule,
            errorCode: 'E175',
            registrationPointIds: inactiveAncestorPoints.map(registrationPoint => parseInt(registrationPoint.id)),
            projectId: hook.data.id || 'new project'
          });
      }

      return hook;

    } catch (error) {

      if (error.data && error.data.errorCode) {
        throw error;
      }

      throw new errors.GeneralError('Could not get Registration Points for the given Project', {
        subModule,
        errorCode: 'E173',
        errors: error,
        registrationPointIds,
        projectId: hook.data.id || 'new project',
        requestId: hook.params.requestId,
        sessionId: hook.params.sessionId
      });
    }
  };
};
