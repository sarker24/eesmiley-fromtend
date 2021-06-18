/* istanbul ignore file */

import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {
  return async (hook: HookContext) => {
    const { guestTypes } = hook.params.query;

    if(!guestTypes || guestTypes.length === 0) {
      return hook;
    }

    const ids: number[] = guestTypes.split(',').map(id => parseInt(id));

    delete hook.params.query.guestTypes;

    hook.params.query = {
      ...hook.params.query,
      guestTypeId: ids
    };

    return hook;

  };
};
