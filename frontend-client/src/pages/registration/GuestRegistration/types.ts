import { GuestType } from 'redux/ducks/guestTypes/types';
import { CreateGuestRegistration, GuestRegistration } from 'redux/ducks/guestRegistrations/types';

export interface GuestTypeRegistration extends Omit<Partial<GuestRegistration>, 'guestType'> {
  guestType: GuestType;
}

export interface GuestRegistrationState {
  guestTypeId?: number;
  amount?: number;
  date: string;
  autoSelectSingleEntry: boolean;
  confirmChange: {
    showDialog: boolean;
    fromAmount?: number;
  };
}

type ConfirmChangeAction = {
  type: 'confirmChange';
  payload: { showDialog: boolean; fromAmount?: number };
};

type ChangeRegistrationAction = {
  type: 'changeRegistration';
  payload: Partial<CreateGuestRegistration>;
};

type ChangeGuestTypeAction = {
  type: 'changeGuestType';
  payload: number;
};

type DeselectAction = {
  type: 'deselect';
};

export type Actions =
  | ConfirmChangeAction
  | ChangeRegistrationAction
  | ChangeGuestTypeAction
  | DeselectAction;
