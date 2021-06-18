/* istanbul ignore file */

import { Hook, HookContext } from '@feathersjs/feathers';

enum SettingUnitKeyByDimension {
  weight = 'unit',
  cost = 'currency'
}

enum DefaultUnitByDimension {
  weight = 'kg',
  cost = 'DKK'
}

export default (): Hook => {
  return async (hook: HookContext) => {
    const sequelize = hook.app.get('sequelize');
    const { customerId } = hook.params.accessTokenPayload;
    const { dimension = 'weight' } = hook.params.query;

    if(dimension === 'co2') {
      hook.params.query = {
        ...hook.params.query,
        unit: 'kg',
        dimension
      };

      return hook;
    }

    // Customers may have different currencies, but as we do with metabase,
    // we discard currencies for simplification.
    // Instead of showing ,- in client, we use customer's currency or defaults.
    // Later perhaps cleaner way to send these from client
    const settings = await sequelize.models.settings.findOne({
      raw: true,
      attributes: [
        [sequelize.literal(`COALESCE(current->>'currency', '${DefaultUnitByDimension.cost}')`), 'currency'],
        [sequelize.literal(`COALESCE(current->>'unit', '${DefaultUnitByDimension.weight}')`), 'unit'],
      ],
      where: {
        customerId
      }
    });

    const unit = settings ? settings[SettingUnitKeyByDimension[dimension]] : DefaultUnitByDimension[dimension];

    hook.params.query = {
      ...hook.params.query,
      dimension,
      unit
    };

    return hook;

  };
};
