import { mount } from '@vue/test-utils';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/Editors/FaceMeshEditor');
vi.mock('@/Editors/BackgroundDrawer');
vi.mock('@/Editors/Editor');

import { Editor } from '../../../Editors/Editor';
import CentralCanvas from '../CentralCanvas.vue';
import { useAnnotationToolStore } from '../../../stores/annotationToolStore';

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
    const tools = useAnnotationToolStore();

    const mockFile = { file: 'test-image.png' };
    tools.histories.selectedHistory = mockFile;

    await wrapper.vm.$nextTick();

    expect(Editor.setBackgroundSource).toHaveBeenCalledWith(mockFile.file);
  });
});
