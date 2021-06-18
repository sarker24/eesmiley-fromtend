import { isAuthenticated, requireAuthUtil } from './auth';
import { RedirectFunction, RouterState } from 'react-router';
import { QueryWithToken } from 'routes';

// todo better  mocks, now just type casting as  quick fix
describe('Tests login', () => {
  test('Should return true for isAuthenticated if there is a token in the localStorage', () => {
    const localStorage = {
      getItem: (name: string): string => name
    } as Storage;
    const result = isAuthenticated(localStorage);

    expect(result).toEqual(true);
  });

  test('Should return false for isAuthenticated if there is a token in the localStorage', () => {
    const localStorage = ({
      getItem: (): string => null
    } as unknown) as Storage;
    const result = isAuthenticated(localStorage);
    expect(result).toEqual(null);
  });

  test('Should require authentication if isAuthenticated is not true', () => {
    const isAuthenticated = () => {
      return false;
    };
    const nextState = {
      location: {
        search: 'thingies'
      }
    } as RouterState<QueryWithToken>;

    const localStorage = ({
      getItem: () => false
    } as unknown) as Storage;

    let test = '';
    const replace = (((value: string) => {
      test = value;
    }) as unknown) as RedirectFunction;

    requireAuthUtil(nextState, replace, isAuthenticated, localStorage);
    expect(test).toEqual('/auththingies');
  });

  test('Should replace the token in local storage if a   snew token is sent through params', () => {
    const isAuthenticated = () => {
      return true;
    };
    const nextState = {
      location: {
        query: {
          token: 'aaa.bbb.ccc'
        }
      }
    } as RouterState<QueryWithToken>;
    let test = '';
    const localStorage = ({
      getItem: (): string => '111.222.333',
      setItem: (item: string, value: string) => {
        test = value;
      },
      removeItem: () => {
        /* no op */
      }
    } as unknown) as Storage;
    const replace = () => {
      /* no op */
    };
    requireAuthUtil(nextState, replace, isAuthenticated, localStorage);
    expect(test).toEqual('"aaa.bbb.ccc"');
  });

  test('Should not proceed if an invalid formated JWT is pased', () => {
    const isAuthenticated = () => {
      return true;
    };
    const nextState = {
      location: {
        query: {
          token: 'an invalid token'
        }
      }
    } as RouterState<QueryWithToken>;
    let test = '';
    const localStorage = ({
      getItem: () => '111.222.333',
      setItem: (item: string, value: string) => {
        test = value;
      }
    } as unknown) as Storage;
    const replace = () => {
      /* no op */
    };
    requireAuthUtil(nextState, replace, isAuthenticated, localStorage);
    expect(test).toEqual('');
  });
});
