import { CreateGuestRegistration } from 'redux/ducks/guestRegistrations/types';
import emptyGuestType from 'registration/GuestRegistration/utils/emptyGuestType';

function transformGuestRegistrationDraft(draft: CreateGuestRegistration): CreateGuestRegistration {
  const { guestTypeId, ...rest } = draft;
  if (guestTypeId === emptyGuestType.id) {
    return rest;
  }

  return draft;
}

export default transformGuestRegistrationDraft;
