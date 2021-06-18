import * as React from 'react';
import { mount } from 'test-utils';
import { Icon } from './index';
import testIcon from 'static/icons/test.svg';

describe('Icon component', () => {
  it('should render test icon successfully', () => {
    const wrapper = mount(<Icon icon={testIcon} />);
    expect(wrapper.find('SVGInline').exists()).toBe(true);
  });
});
