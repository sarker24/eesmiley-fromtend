import * as React from 'react';
import { mount } from 'test-utils';
import Input from './index';

describe('Input component', () => {
  it('should render', () => {
    const testFn = jest.fn();
    const value = 'hejsan';
    const label = 'important label';
    const input = mount(
      <Input
        focusOnMount={true}
        required={true}
        placeholder={label + 'Placeholder'}
        type={'text'}
        name={'testfield'}
        value={value}
        onChange={testFn}
        label={label}
      />
    );

    expect(input.find('input').prop('value')).toBe(value);
    expect(input.find('input').getDOMNode()).toBe(document.activeElement);
    expect(input.find('label').contains(label)).toBe(true);
  });

  it('should attach ref to root component', () => {
    const testFn = jest.fn();
    const value = 'hejsan';
    const label = 'important label';
    const ref = React.createRef<any>();
    const input = mount(
      <Input
        focusOnMount={true}
        required={true}
        placeholder={label + 'Placeholder'}
        type={'text'}
        name={'testfield'}
        value={value}
        onChange={testFn}
        ref={ref}
        label={label}
      />
    );

    // eslint-disable-next-line
    expect(input.find('Input').instance()).toBe(ref.current.getWrappedInstance());
  });
});
