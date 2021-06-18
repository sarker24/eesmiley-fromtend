import * as React from 'react';
import Registration from './index';

const GuestRegistrationPage: React.FunctionComponent = () => (
  <Registration guestRegistrationOnly={true} />
);

export default GuestRegistrationPage;
