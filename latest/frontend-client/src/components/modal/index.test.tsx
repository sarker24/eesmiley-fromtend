import * as React from 'react';
import { mount } from 'test-utils';
import Modal from 'modal/index';
import { Dialog } from '@material-ui/core';

describe('Modal component', () => {
  it('should render children when given no modal', () => {
    const children = <div>No modal</div>;
    const wrapper = mount(<Modal>{children}</Modal>);

    expect(wrapper.contains(children)).toBe(true);
  });

  it('should render modal', () => {
    const children = <div>Hello World</div>;
    const modalNode = <div>Hello Modal</div>;
    const modal = {
      visible: true,
      content: modalNode,
      className: undefined,
      fullBleed: undefined
    };

    const wrapper = mount(<Modal modal={modal}>{children}</Modal>);

    expect(wrapper.contains(children)).toBe(true);
    expect(wrapper.find(Dialog).prop('open')).toBe(true);
    expect(wrapper.find(Dialog).contains(modalNode)).toBe(true);
  });

  it('should not render modal when visible flag is set to false', () => {
    const children = <div>Hello World</div>;
    const modal = { content: 'hello', visible: false };
    const wrapper = mount(<Modal modal={modal}>{children}</Modal>);

    expect(wrapper.contains(children)).toBe(true);
    expect(wrapper.find(Dialog).prop('open')).toBe(false);
  });

  it('should not render modal when content is not defined', () => {
    const children = <div>Hello World</div>;

    const modal = {
      visible: true,
      content: null,
      className: '',
      fullBleed: undefined
    };

    const wrapper = mount(<Modal modal={modal}>{children}</Modal>);

    expect(wrapper.contains(children)).toBe(true);
    expect(wrapper.find(Dialog).exists()).toBe(false);
  });
});
