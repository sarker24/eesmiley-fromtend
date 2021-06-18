import * as React from 'react';
import { shallow } from 'test-utils';
import { FailedPlaceholder, default as Wrapper } from './index';

describe('FailedPlaceholder component', () => {
  it('should render with defaults', () => {
    const wrapper = shallow(<Wrapper />, { diveTo: FailedPlaceholder });

    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('should render with the button', () => {
    const wrapper = shallow(
      <Wrapper
        className='it-class'
        title='foo'
        description='bar'
        retryHandler={() => {
          /* no op*/
        }}
      />,
      { diveTo: FailedPlaceholder }
    );

    expect(wrapper.dive()).toMatchSnapshot();
  });
});
