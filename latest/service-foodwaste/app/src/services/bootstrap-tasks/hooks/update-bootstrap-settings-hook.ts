/**
 *
 * Updates the used bootstrap template id
 *
 * */
import { Hook, HookContext } from '@feathersjs/feathers';

export default (): ((hook: HookContext) => Promise<HookContext>) => {
  return async (hook: HookContext): Promise<HookContext> => {

    const { templateId, customerId, userId } = hook.data;
    const sequelize = hook.app.get('sequelize');
    const settingsService = hook.app.service('/settings');

    const settings = await sequelize.models.settings.findOne({
      raw: true,
      where: { customerId }
    });

    if (settings) {
      if(settings.current.bootstrapTemplateId === templateId) {
        return hook;
      }
      await settingsService.patch(settings.id,
        [{
          op: 'replace', path: '/current/bootstrapTemplateId', value: templateId
        }], hook.params);
    } else {
      await settingsService.create({
        settings: { bootstrapTemplateId: templateId },
        customerId,
        userId
      }, hook.params);
    }
    return hook;
  };
};
