import * as React from 'react';
import * as renderer from 'react-test-renderer';
import AppScale from './app';

jest.useFakeTimers();
jest.mock('../core/data-transfer');
jest.mock('react-native-bluetooth-state-manager', () => 'BluetoothStateManager');

describe('App', () => {
  it('matches snapshot', () => {
    const tree = renderer.create(<AppScale />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
