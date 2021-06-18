import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

/**
 *
 * Cascades removal to all registration points in the subtree of the affected registration point.
 *
 * After hook: REMOVE
 *
 */
const subModule: string = 'cascade-removal-to-subtrees';

export default (): Hook => {
  return async (hook: HookContext): Promise<any> => {

    const rootPath = hook.result.path ? `${hook.result.path}.${hook.result.id}` : hook.result.id.toString();

    try {
      await hook.app.get('sequelize').models.registration_point.destroy({
        where: {
          path: {
            $contained: rootPath
          }
        }
      });
      return hook;
    } catch (error) {
      throw new errors.GeneralError(`Could not remove nested registration points`, {
        errorCode: 'E260',
        subModule,
        registrationPoint: hook.result
      });
    }
  };
};
