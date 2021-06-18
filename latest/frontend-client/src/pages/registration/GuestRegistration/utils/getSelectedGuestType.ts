import { GuestType } from 'redux/ducks/guestTypes/types';

interface SelectGuestTypeOptions {
  guestTypes: GuestType[];
  selectedGuestTypeId?: number;
  autoSelectSingleEntry: boolean;
}

function getSelectedGuestType(options: SelectGuestTypeOptions): GuestType | null {
  const { guestTypes, selectedGuestTypeId, autoSelectSingleEntry = true } = options;

  if (!selectedGuestTypeId && guestTypes.length > 1) {
    return null;
  }

  if (guestTypes.length === 1 && autoSelectSingleEntry) {
    return guestTypes[0];
  } else {
    return guestTypes.find((guestType) => guestType.id === selectedGuestTypeId);
  }
}

export default getSelectedGuestType;
