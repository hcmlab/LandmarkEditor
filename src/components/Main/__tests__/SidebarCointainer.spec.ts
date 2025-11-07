import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeAll } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import Component from '../SidebarContainer.vue';

beforeAll(() => {
  setActivePinia(createPinia());

  // Overwrite the global object
  // https://github.com/jsdom/jsdom/issues/3368#issuecomment-1147970817
  global.ResizeObserver = class ResizeObserver {
    observe() {
      // do nothing
    }
    unobserve() {
      // do nothing
    }
    disconnect() {
      // do nothing
    }
  };
});

describe('Sidebar Component', () => {
  it('renders component', () => {
    const wrapper = mount(Component);
    expect(wrapper.exists()).toBe(true);
  });
});
