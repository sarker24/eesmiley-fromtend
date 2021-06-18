import * as React from 'react';
import { mount } from 'test-utils';
import Avatar from './index';

describe('Avatar component', () => {
  it('should render', () => {
    const avatar = mount(<Avatar />).find('Avatar');

    expect(avatar).toHaveLength(1);
    expect(avatar).toMatchSnapshot();
  });

  it('should render with default avatar image', () => {
    const avatar = mount(<Avatar />);

    expect(avatar.find('img').prop('src')).toEqual('https://gravatar.com/avatar');
  });

  it('should render with correct avatar image', () => {
    const avatar = mount(<Avatar email={'it@esmiley.dk'} />);

    expect(avatar.find('img').prop('src')).toEqual(
      'https://gravatar.com/avatar/c52556a86f12bb81d68c26d347114a1a'
    );
  });
});
