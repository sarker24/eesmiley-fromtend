import * as React from 'react';

import { default as Wrapper, Nav } from './index';
import { mount, DataTransferMock } from 'test-utils';
import { initialState } from 'redux/ducks/ui';

describe('Nav component', () => {
  const dataTransfer = DataTransferMock(window.sysvars.LEGACY_API_URL);

  beforeEach(() => {
    dataTransfer.onGet('/system-api/modules').reply([
      200,
      [
        {
          name: 'module 1',
          url: 'module-1-url',
          icon: ''
        },
        {
          name: 'module2',
          url: 'module-2-url',
          icon: ''
        }
      ]
    ]);
  });

  it('should render desktop view', () => {
    const wrapper = mount(<Wrapper title='it title' isMobile={false} />);

    expect(wrapper.find(Nav).length).toBe(1);
    expect(wrapper.find('h5').text()).toBe('it title');
    expect(wrapper.find('ModuleSelector').length).toBe(1);
    expect(wrapper.find('LanguageSwitcher').length).toBe(1);
  });

  it('should render mobile view', () => {
    const wrapper = mount(<Wrapper title='it title' isMobile={true} />);

    expect(wrapper.find(Nav).length).toBe(1);
    expect(wrapper.find('h5').text()).toBe('it title');
    expect(wrapper.find('ModuleSelector').length).toBe(1);
    expect(wrapper.find('LanguageSwitcher').length).toBe(0);
  });

  it('should not render menu icon when menu is open', () => {
    const wrapper = mount(<Wrapper title='it title' isMobile={false} />, {
      initialState: { ui: { ...initialState, isMenuOpen: true } }
    });

    expect(wrapper.find('.Nav-sidebarMenuButton').length).toBe(0);
  });

  it('should open menu when clicked on menu icon', () => {
    const wrapper = mount(<Wrapper title='it title' isMobile={false} />, {
      initialState: {
        ui: {
          ...initialState,
          isMenuOpen: false
        }
      }
    });

    wrapper.find('.Nav-sidebarMenuButton').find('button').simulate('click');

    expect(wrapper.find('Nav').prop('isMenuOpen')).toBe(true);
    expect(wrapper.find('.Nav-sidebarMenuButton').length).toBe(0);
  });
});
