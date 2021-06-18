import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {
  return (hook: HookContext) => {
    // create and patch need separate logic due to handling of existing associations
    if (['create', 'patch'].includes(hook.method)) {
      return hook;
    }

    const sequelize = hook.app.get('sequelize');

    if (!hook.params.sequelize) {
      hook.params.sequelize = {};
    }

    hook.params.sequelize = Object.assign({}, hook.params.sequelize,
      {
        raw: false,
        include: [{
          attributes: ['id', 'path', 'name'],
          model: sequelize.models.registration_point,
          through: { attributes: [] },
          as: 'registrationPoints'
        }]
      });
    return hook;
  };
};
