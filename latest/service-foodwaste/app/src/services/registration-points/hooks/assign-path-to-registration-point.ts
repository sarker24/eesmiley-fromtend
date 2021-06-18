import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'assign-path-to-registration-point';

/**
 *  Fetched parent record from database and calculates correct path for the child.
 *
 *  Before hook: POST, PATCH
 */

export default (): Hook => {
  return async (hook: HookContext) => {
    const { requestId, sessionId } = hook.params;
    const { parentId } = hook.data;
    if (!parentId) {
      hook.data.path = null;
      return hook;
    }

    const sequelize = hook.app.get('sequelize');
    const parent = await sequelize.models.registration_point.findOne({ where: { id: parentId } });

    if (!parent) {
      throw new errors.BadRequest('Could not create a new Registration point when parent does not exist', {
        errorCode: 'E236', requestId, sessionId, subModule, registrationPoint: hook.data
      });
    }
    if (parent.path) {
      hook.data.path = `${parent.path}.${parent.id}`;
    } else {
      hook.data.path = parent.id.toString();
    }
    return hook;
  };
};
