import * as React from 'react';
import { mount } from 'test-utils';
import ModuleDropdown from './moduleDropdown';
import { Popover } from '@material-ui/core';

describe('moduleSelector/ModuleDropdown component', () => {
  const modules = [
    {
      label: 'Test 1',
      icon: '',
      link: ''
    },
    {
      label: 'Test 2',
      icon: '',
      link: ''
    }
  ];

  test('should render with menu closed', () => {
    const wrapper = mount(<ModuleDropdown modules={modules} />);
    const moduleDropdown = wrapper.find('ModuleDropdown');

    expect(moduleDropdown.exists()).toBe(true);
    expect(moduleDropdown.find('button').text()).toBe('FoodWaste');
    expect(wrapper.find(Popover).prop('anchorEl')).toBe(null);
  });

  test('should render the menu when clicked on the menu button', () => {
    const wrapper = mount(<ModuleDropdown modules={modules} />);
    const menuButton = wrapper.find('button');
    const buttonNode = menuButton.getDOMNode();

    menuButton.simulate('click', { target: buttonNode, currentTarget: buttonNode });

    expect(wrapper.find(Popover).prop('anchorEl')).toBe(buttonNode);
    expect(wrapper.find('li').length).toBe(modules.length);
  });
});
