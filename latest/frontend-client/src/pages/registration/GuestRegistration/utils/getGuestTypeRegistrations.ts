import { GuestType } from 'redux/ducks/guestTypes/types';
import { GuestRegistration } from 'redux/ducks/guestRegistrations/types';
import { GuestTypeRegistration } from 'registration/GuestRegistration/types';
import emptyGuestType from 'registration/GuestRegistration/utils/emptyGuestType';

interface GuestRegistrationByType {
  [index: number]: Partial<GuestRegistration>;
}

function getGuestTypeRegistrations(
  guestTypes: GuestType[],
  guestRegistrations: GuestRegistration[]
): GuestTypeRegistration[] {
  // TODO: normalize redux state, so we wouldnt need this kind of logic here
  const registrationsByGuestType: GuestRegistrationByType = groupByGuestType(guestRegistrations);

  return guestTypes.map((guestType) => ({
    ...registrationsByGuestType[guestType.id],
    guestType
  }));
}

function groupByGuestType(guestRegistrations: GuestRegistration[]): GuestRegistrationByType {
  return guestRegistrations.reduce((obj, guestRegistration) => {
    const { guestType, ...registration } = guestRegistration;
    const guestTypeId = guestType ? guestType.id : emptyGuestType.id;
    obj[guestTypeId] = registration;
    return obj;
  }, {});
}

export default getGuestTypeRegistrations;
