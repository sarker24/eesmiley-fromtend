// internal only, to handle disabled guest types
// note 0 is invalid id (all ids > 0) from service

import { GuestType } from 'redux/ducks/guestTypes/types';

const emptyGuestType: GuestType = Object.freeze({
  id: 0,
  name: null,
  active: true
});

export default emptyGuestType;
