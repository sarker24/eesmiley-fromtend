import * as React from 'react';
import { shallow, mount } from 'test-utils';
import DataPlaceholder from './index';

describe('DataPlaceholder component', () => {
  it('should render with defaults', () => {
    const dataPlaceholder = shallow(<DataPlaceholder title='foo' description='bar' />, {
      diveTo: 'DataPlaceholder'
    });

    expect(dataPlaceholder.dive()).toMatchSnapshot();
  });

  it('should render with the button', () => {
    const dataPlaceholder = shallow(
      <DataPlaceholder
        className='it-class'
        title='foo'
        description='bar'
        buttonIcon={<div>icon</div>}
        buttonHandler={() => {
          /* no op */
        }}
      />,
      { diveTo: 'DataPlaceholder' }
    );

    expect(dataPlaceholder.dive()).toMatchSnapshot();
  });

  it('should handle click events', () => {
    const onClickHandler = jest.fn();
    const dataPlaceholder = mount(
      <DataPlaceholder
        title='foo'
        description='bar'
        buttonIcon={<div>icon</div>}
        buttonHandler={onClickHandler}
      />
    );
    const button = dataPlaceholder.find('button');

    button.simulate('click');
    expect(onClickHandler).toBeCalledTimes(1);
  });
});
