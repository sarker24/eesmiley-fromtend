import { Hook, HookContext } from '@feathersjs/feathers';

/**

 Joins guest registrations at app level, to avoid dealing with foreign key issues at db level.
 This is temporary solution while we still have sales showing guests

 After Hook: ALL

 * */

export default (): Hook => {
  return async (hook: HookContext) => {

    const sequelize = hook.app.get('sequelize');

    const { customerId } = ['find', 'get', 'remove'].includes(hook.method) ? hook.params.query : hook.data;
    const sales = Array.isArray(hook.result) ? hook.result : [hook.result];
    const dates = sales.map(sale => sale.date);

    const guestRegistrations = await sequelize.models.guest_registration.findAll({
      raw: true,
      attributes: ['date', [sequelize.fn('sum', sequelize.col('amount')), 'amount']],
      where: {
        customerId,
        date: dates
      },
      group: ['date']
    });

    const guestRegistrationsByDate = guestRegistrations.reduce((byDate, registration) => ({
      ...byDate,
      [registration.date]: parseInt(registration.amount)
    }), {});

    const salesWithGuests = sales.map(sale => ({ ...sale, guests: guestRegistrationsByDate[sale.date] || 0 }));

    hook.result = Array.isArray(hook.result) ? salesWithGuests : salesWithGuests[0];
    return hook;
  };
};
