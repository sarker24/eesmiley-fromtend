import * as React from 'react';
import { mount } from 'test-utils';
import FormattedMessage from './index';

describe('FormattedMessage component', () => {
  it('should render', () => {
    const wrapper = mount(<FormattedMessage id='settings.basic.currency' />);
    const FormattedMessageItem = wrapper.find('FormattedMessage');

    expect(FormattedMessageItem).toHaveLength(2);
  });
});
