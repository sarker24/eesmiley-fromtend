import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

/**
 *
 * Cascade parent/path update to all registration points in the subtree of the affected registration point.
 *
 * After hook: PATCH
 *
 */
const subModule: string = 'cascade-path-update-to-subtrees';

export function hasParentChangeOp(ops: Array<PatchOperation>): boolean {
  return ops.some(op => op.path === '/parentId');
}

export default (): Hook => {
  return async (hook: HookContext & { operations: any[]; registration_point: any; }): Promise<any> => {

    if (!hasParentChangeOp(hook.operations)) {
      return hook;
    }

    const { registration_point: pointBefore, result: pointAfter, app } = hook;
    const sequelize = app.get('sequelize');

    const oldRootPath = pointBefore.path ? `${pointBefore.path}.${pointBefore.id}` : pointBefore.id.toString();
    const newPath = pointAfter.path;
    const updatePathQuery = 'UPDATE registration_point set path = COALESCE(:newPath || subpath(path, nlevel(:oldRootPath) - 1),  subpath(path, nlevel(:oldRootPath) - 1)) WHERE path <@ :oldRootPath';
    try {
      await sequelize.query(updatePathQuery,
        {
          replacements: {
            oldRootPath,
            newPath
          },
          type: sequelize.QueryTypes.UPDATE
        });
      return hook;
    } catch (error) {
      throw new errors.GeneralError(`Could not apply changes to nested registration points`, {
        errorCode: 'E259',
        subModule,
        registrationPoint: hook.result
      });
    }
  };
};
