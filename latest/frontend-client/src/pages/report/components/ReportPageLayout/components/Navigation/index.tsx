import * as React from 'react';
import Navigation from './Navigation';
import { withRouter } from 'react-router';
import { Location } from 'history';

export interface MenuLink {
  title: string;
  link?: string;
  divider?: boolean;
  disabled?: boolean;
  isStartPage?: boolean;
}

interface ComponentProps {
  location: Location;
}

const NavigationContainer: React.FunctionComponent<ComponentProps> = ({ location }) => {
  return <Navigation location={location} />;
};

export default withRouter(NavigationContainer);
