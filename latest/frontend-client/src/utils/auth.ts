import { decodeJWT } from 'redux/ducks/auth';
import { RedirectFunction, RouterState } from 'react-router';
import { QueryWithToken } from 'routes';

export function isAuthenticated(localStorage?: Storage): boolean {
  return localStorage
    ? localStorage.getItem('token') && localStorage.getItem('token') != null
    : window.hasOwnProperty('localStorage') && window.localStorage.getItem('token') != null;
}

export function requireAuthUtil(
  nextState: RouterState<QueryWithToken>,
  replace: RedirectFunction,
  isAuthenticated: (storage?: Storage) => boolean,
  localStorage: Storage
): boolean {
  if (nextState.location.query && nextState.location.query.token) {
    const jwtRegex = new RegExp('^[a-zA-Z0-9\\-_]+?\\.[a-zA-Z0-9\\-_]+?\\.([a-zA-Z0-9\\-_]+)?$');
    if (!jwtRegex.test(nextState.location.query.token)) {
      return false;
    }
  }
  if (!isAuthenticated() && !localStorage.getItem('token')) {
    replace('/auth' + nextState.location.search);
  } else if (
    isAuthenticated() &&
    nextState.location.query.token &&
    nextState.location.query.token !== localStorage.getItem('token')
  ) {
    localStorage.setItem('token', `"${nextState.location.query.token}"`);

    const tokenPayload = decodeJWT(nextState.location.query.token);

    if (tokenPayload && tokenPayload.exp) {
      localStorage.setItem('tokenExpiry', String(tokenPayload.exp));
    }
  }

  const tokenExpiry = localStorage.getItem('tokenExpiry');
  if (tokenExpiry && parseInt(tokenExpiry) < Date.now() / 1000) {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    replace('/auth');
  }
}
