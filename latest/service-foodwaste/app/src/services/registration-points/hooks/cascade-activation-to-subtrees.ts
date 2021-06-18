import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

/**
 *
 * Toggle active state changes to all registration points in the subtree of the affected registration point.
 *
 * After hook: PATCH
 *
 */
const subModule: string = 'cascade-activation-to-subtrees';

export function hasActivationOp(ops: Array<PatchOperation>): boolean {
  return ops.some(op => op.path === '/active');
}

export default (): Hook => {
  return async (hook: HookContext & { operations: any[]; }): Promise<any> => {

    if (!hasActivationOp(hook.operations)) {
      return hook;
    }

    const rootPath = hook.result.path ? `${hook.result.path}.${hook.result.id}` : hook.result.id.toString();

    try {
      await hook.app.get('sequelize').models.registration_point.update({
        active: hook.result.active
      }, {
        where: {
          path: {
            $contained: rootPath
          }
        }
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
