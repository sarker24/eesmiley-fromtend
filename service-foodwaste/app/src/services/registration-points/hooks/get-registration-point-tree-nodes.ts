import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule = 'get-registration-point-tree-nodes';

/**
 * Get all registration points for a requested id(s) and transform them into a tree structure
 *
 * For FIND method, there may be multiple trees
 *
 * After hook: GET, FIND
 */

export function getRootIds(nodes: Array<Tree<any>>): Array<number> {

  const rootIdSet = new Set<number>();

  nodes.forEach(({ id, path }) => {
    const rootId = path ? parseInt(path.split('.')[0]) : id;
    rootIdSet.add(rootId);
  });

  return [...rootIdSet];
}

async function getAllRegistrationPointsInTree(hook: HookContext): Promise<Array<RegistrationPoint>> {

  const sequelize: any = hook.app.get('sequelize');
  const resultArray: Array<Tree<any>> = Array.isArray(hook.result) ? hook.result : [hook.result];
  const rootIds: Array<number> = getRootIds(resultArray);
  const rootPaths: Array<string> = rootIds.map(rootId => rootId + '.*');
  const includeDeleted: boolean = !!hook.params.sequelize && hook.params.sequelize.paranoid === false;
  const fetchQuery: string =
    'SELECT * FROM registration_point WHERE id IN (:rootIds) OR path ? ARRAY[:rootPaths]::lquery[]' +
    (includeDeleted ? '' : ' AND deleted_at is null' +
    ' ORDER BY nlevel(path) ASC NULLS FIRST, id ASC');

  const registrationPointInstances = await sequelize.query(fetchQuery,
    {
      replacements: {
        rootIds,
        rootPaths
      },
      model: sequelize.models.registration_point,
      mapToModel: true,
      type: sequelize.QueryTypes.SELECT
    });

  return registrationPointInstances.map(instance => JSON.parse(JSON.stringify(instance)));
}

export default (): Hook => async (hook: HookContext): Promise<any> => {

  if (!hook.result || (Array.isArray(hook.result) && hook.result.length === 0)) return hook;
  try {
    hook.result = await getAllRegistrationPointsInTree(hook);
    return hook;
  } catch (error) {
    const { sessionId, requestId } = hook.params;
    throw new errors.GeneralError('Could not get all registration points',
      { errorCode: 'E261', subModule, errors: error, requestId, sessionId });
  }
};

