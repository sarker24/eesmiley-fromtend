import * as React from 'react';
import { UserFoldout, default as Wrapper } from './index';
import { initialState as settingsInitialState } from 'redux/ducks/settings';
import { mount } from 'test-utils';

describe('UserFoldout component', () => {
  it('should render with email', () => {
    const store = {
      user: {
        customerId: 1,
        name: 'Bob Bobson',
        email: 'it@esmiley.dk',
        username: 'bob'
      },
      settings: { ...settingsInitialState, useAccountNickname: false }
    };

    const wrapper = mount(
      <Wrapper
        menuHandler={() => {
          /* no op */
        }}
      />,
      { initialState: store }
    );

    const userFoldout = wrapper.find(UserFoldout);
    expect(userFoldout).toHaveLength(1);

    expect(userFoldout.find('li')).toHaveLength(1);
    expect(userFoldout.find('li').children()).toHaveLength(3);
    expect(userFoldout.find('h4').childAt(0).text()).toEqual(store.user.email);
  });

  it('should render without email', () => {
    const store = {
      user: {
        customerId: 2,
        name: 'Bob Bobson',
        username: 'bob'
      },
      settings: { ...settingsInitialState, useAccountNickname: false }
    };

    const wrapper = mount(
      <Wrapper
        menuHandler={() => {
          /* no op */
        }}
      />,
      { initialState: store }
    );

    const userFoldout = wrapper.find(UserFoldout);
    expect(userFoldout).toHaveLength(1);

    expect(userFoldout.find('li')).toHaveLength(1);
    expect(userFoldout.find('li').children()).toHaveLength(3);
    expect(userFoldout.find('h4').childAt(0).text()).toEqual(store.user.username);
  });

  it('should render identity when given customerName', () => {
    const store = {
      user: {
        customerId: 2,
        name: 'Bob Bobson',
        username: 'bob',
        customerName: 'Customer'
      },
      settings: { ...settingsInitialState, useAccountNickname: false }
    };

    const wrapper = mount(
      <Wrapper
        menuHandler={() => {
          /* no op */
        }}
      />,
      { initialState: store }
    );

    const userFoldout = wrapper.find(UserFoldout);
    expect(userFoldout).toHaveLength(1);

    expect(userFoldout.find('li')).toHaveLength(1);
    expect(userFoldout.find('li').children()).toHaveLength(3);
    expect(userFoldout.find('h4').childAt(0).text()).toEqual(store.user.customerName);
    expect(userFoldout.find('h4').childAt(1).text()).toEqual(`(${store.user.customerId})`);
  });
});
