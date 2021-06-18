import * as React from 'react';
import { mount } from 'test-utils';
import Container from './index';

describe('Container component', () => {
  it('should render', () => {
    const wrapper = mount(<Container>Hello World</Container>);
    const container = wrapper.find('.container').hostNodes();
    expect(container).toHaveLength(1);
  });

  it('should be able to have children', () => {
    const wrapper = mount(
      <Container>
        <div className='child'>I am a child</div>
      </Container>
    );
    const child = wrapper.find('.child').hostNodes();
    expect(child).toHaveLength(1);
  });
});
