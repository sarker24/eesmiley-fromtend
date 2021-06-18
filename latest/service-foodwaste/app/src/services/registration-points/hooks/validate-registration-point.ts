import * as errors from '@feathersjs/errors';
import { extractPathIds } from '../../../util/tree';
import { Hook, HookContext } from '@feathersjs/feathers';

/**
 * Validates there is no active project registered to registration points
 *
 * When registration point is deactivated or removed, the registration node and the subtree it forms,
 * must be validated against all active projects.
 *
 * Before hook: PATCH, REMOVE
 */
const subModule: string = 'validate-registration-point';

export async function validateForInactiveAncestors(hook) {
  const sequelize = hook.app.get('sequelize');
  const registrationPoint: RegistrationPoint = hook.registration_point;

  const ancestorIds = extractPathIds([registrationPoint]);

  if (ancestorIds.length === 0) {
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
    throw new errors.Conflict(`Cannot activate registration point with inactive parent`,
      {
        subModule,
        errorCode: 'E175',
        registrationPointIds: inactiveAncestorPoints.map(registrationPoint => parseInt(registrationPoint.id)),
      });
  } else {
    return hook;
  }
}

export async function validateForOngoingProjects(hook) {
  const sequelize = hook.app.get('sequelize');
  const registrationPoint: RegistrationPoint = hook.registration_point;
  const { params: { accessTokenPayload: { customerId } } } = hook;
  const { path, id } = registrationPoint;
  const subTreePath = path ? `${ path }.${ id }` : id.toString();
  const registrationPointIds = await sequelize.models.registration_point.findAll({
    // bigint type is presented as string in node;
    // a quick fix to cast them as int (needed for project query to work)
    attributes: [sequelize.cast(sequelize.col('id'), 'int')],
    raw: true,
    where: {
      customerId,
      $or: [
        {
          path: {
            $contained: subTreePath
          }
        },
        { id }
      ]
    }
  });

  // this probably should throw exception, since reg point doesnt exist itself
  if (registrationPointIds.length === 0) {
    return hook;
  }

  // note: this only checks for existence of ids registered to projects, but excludes projects that track all registration points
  const projects = await sequelize.query(
    'SELECT project.* FROM project ' +
    'JOIN project_registration_point prp ' +
    'ON prp.project_id = project.id AND prp.registration_point_id IN (:ids) ' +
    'WHERE project.customer_id = :customerId AND project.status <> \'FINISHED\'::project_status_type AND project.active', {
      replacements: { customerId, ids: registrationPointIds.map(_ => _.id) },
      type: sequelize.QueryTypes.SELECT
    });

  if (projects.length > 0) {
    throw new errors.Conflict(`User is not allowed to delete/hide registration points part of an ongoing project`, {
      errorCode: 'E258',
      subModule,
      registrationPointId: hook.id,
      projects
    });
  } else {
    return hook;
  }
}

export function getActiveOpValue(ops) {
  const activeOp = ops.find((op: PatchOperation) => {
    return op.path === '/active';
  });

  return activeOp ? (activeOp.value === true || activeOp.value === 'true') : undefined;
}

export default (): Hook => {
  return async (hook: HookContext) => {
    const isPatchMethod = hook.method === 'patch';
    const isRemoveMethod = hook.method === 'remove';

    if (isPatchMethod) {
      const activeValue = getActiveOpValue(hook.data);

      if (activeValue === undefined) {
        return hook;
      } else if (activeValue) {
        return validateForInactiveAncestors(hook);
      } else {
        return validateForOngoingProjects(hook);
      }
    } else if (isRemoveMethod) {
      return validateForOngoingProjects(hook);
    } else {
      return hook;
    }
  };
};
