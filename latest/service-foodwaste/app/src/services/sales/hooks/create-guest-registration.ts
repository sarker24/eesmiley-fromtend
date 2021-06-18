import { Hook, HookContext } from '@feathersjs/feathers';

/**

 Create guest registration for given data, when new guest registration flow is disabled. Use cases:
 -if registration exists with same amount, dont create new record, otherwise delete and create new
 -dont create empty records (null or 0 guests)

 Before Hook: CREATE/PATCH
 * */

export default (): Hook => {
  return async (hook: HookContext) => {

    const sequelize = hook.app.get('sequelize');
    const { date, guests, customerId, userId } = hook.data;

    delete hook.data.guests;

    const settings = await sequelize.models.settings.findOne({
      raw: true,
      attributes: ['current'],
      where: {
        customerId
      }
    });

    if (settings && settings.current.enableGuestRegistrationFlow) {
      return hook;
    }

    const guestRegistration = await sequelize.models.guest_registration.findOne({
      where: {
        customerId,
        date
      }
    });

    if (guestRegistration && guestRegistration.amount === guests) {
      return hook;
    }

    if (guestRegistration) {
      await guestRegistration.destroy();
    }

    if (!guests || guests <= 0) {
      return hook;
    }

    await sequelize.models.guest_registration.create({
      date,
      amount: guests,
      customerId,
      userId
    });

    return hook;
  };
};
