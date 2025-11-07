import { mount } from '@vue/test-utils';
import { expect, describe, it } from 'vitest';
import YourComponent from '../ButtonWithIcon.vue';

describe('ButtonWithIcon', () => {
  it('receives props and emits click on `a` element click', async () => {
    const wrapped = mount(YourComponent, {
      props: {
        shortcut: 's',
        icon: 'icon-name',
        text: 'Some Text'
      }
    });

    const textElement = wrapped.get('a');

    expect(textElement.attributes('id')).to.equal('button-some-text');
    expect(textElement.text()).to.equal('Some Text');

    await textElement.trigger('click');

    expect(wrapped.emitted()).to.have.property('click');
  });
});
