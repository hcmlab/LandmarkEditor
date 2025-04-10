import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAnnotationHistoryStore } from '../../../stores/annotationHistoryStore';
import CentralCanvas from '../CentralCanvas.vue';
import { FileAnnotationHistory } from '../../../cache/fileAnnotationHistory';

import { MultipleViewImage } from '../../../interface/multiple_view_image';
import { BackgroundDrawer } from '../../../Editors/BackgroundDrawer';

vi.mock('@/Editors/Editor');

const mockData = {
  center: {
    image: {
      filePointer: new File([''], 'mock.png', {
        type: 'image/png'
      })
    },
    mesh: []
  },
  left: null,
  right: null
} as MultipleViewImage;

describe('AnnotationCanvas.vue', () => {
  let wrapper;

  beforeEach(() => {
    setActivePinia(createPinia());
    wrapper = mount(CentralCanvas);
  });

  it('should mount the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should update the background source when selectedHistory changes', async () => {
    // @ts-expect-error: I have no idea why the setBackgroundSource parameter doesn't work
    const SpySetBackgroundSource = vi.spyOn(BackgroundDrawer, 'setBackgroundSource');
    const annotationHistoryStore = useAnnotationHistoryStore();
    annotationHistoryStore.selectedHistory = new FileAnnotationHistory(mockData, 25);

    await wrapper.vm.$nextTick();

    expect(SpySetBackgroundSource).toHaveBeenCalledOnce();
  });
});
