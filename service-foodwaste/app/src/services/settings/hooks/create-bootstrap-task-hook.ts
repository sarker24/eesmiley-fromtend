import { HookContext } from '@feathersjs/feathers';

const subModule = 'create-bootstrap-task-hook';

export default () => {
  /**
   *
   * Calls /bootstrap-tasks if new user had defined template id in settings
   *
   * After-hook for: create
   *
   */
  return async (hook: HookContext): Promise<HookContext> => {
    const { requestId, sessionId, isNewCustomer } = hook.params;
    const { bootstrapTemplateId } = hook.result;
    /*
     * If not new customer or no bootstrap template id was defined
     */
    if (!isNewCustomer || !bootstrapTemplateId) {
      return hook;
    }

    log.debug({
      customerId: hook.data.customerId, bootstrapTemplateId, subModule, requestId, sessionId
    }, `New customer has selected bootstrap template ${bootstrapTemplateId}`);

    try {
      await hook.app.service('/bootstrap-tasks').create({
        templateId: bootstrapTemplateId
      }, hook.params);

      log.debug({
        customerId: hook.data.customerId, bootstrapTemplateId, subModule, requestId, sessionId
      }, 'Bootstrapped data has been populated for the new customer');

      return hook;
    } catch (error) {

      log.error({
        customerId: hook.data.customerId, error, bootstrapTemplateId, subModule, requestId, sessionId
      }, 'Could not populate bootstrapped data for the new customer');
      /*
       * Settings were successfully created so Promise is resolved no matter what.
       * In the case of an error bootstrapping, it is logged, but execution is not interrupted
       */
      return hook;
    }
  };
};
