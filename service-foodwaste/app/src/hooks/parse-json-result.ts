import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {
  /**
   * When a ORM such as Sequelize is Used, FeathersJS returns the whole output
   * from it.
   * JSON.parse(JSON.stringify(<value>)) cleans up the nested and circular objects inside
   *
   * After-hook for: ALL
   *
   * @param {any} hook  Contains  The request object
   * @returns {Promise} Promise   The hook request object
   */
  return (hook: HookContext) => {
    try {
      hook.result = JSON.parse(JSON.stringify(hook.result));
    } catch (e) {
      hook.result = JSON.stringify(hook.result);
    }

    return hook;
  };
};
