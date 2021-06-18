import * as React from 'react';
import { mount } from 'test-utils';
import FormattedCost from './index';

describe('FormattedCost component', () => {
  it('should render', () => {
    const wrapper = mount(<FormattedCost value={100} />);

    const FormattedCurrencyItem = wrapper.find('FormattedCost').first();

    expect(FormattedCurrencyItem).not.toBe(null);
  });
});
