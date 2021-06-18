/**
 * After-hook for: FIND, CREATE
 *
 * @return {any}
 */
import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {
  return async (hook: HookContext) => {
    /*
     * If there is no result from the query - simply return the result, which is an empty array.
     */
    if (Array.isArray(hook.result) && hook.result.length > 0) {
      /*
       * The Sequelize find() method returns an array of found results (and so does Feathers' find() endpoint).
       * But since we have just one record per unique customer_id, the data we are looking for is always at index 0.
       */
      const settingsInstance = hook.result[0];
      hook.result = settingsInstance.current;

      return hook;
    }

    if (hook.method === 'create') {
      hook.result = hook.result.current;
    }

    return hook;
  };
};
