import { mount, VueWrapper } from '@vue/test-utils';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/Editors/FaceMeshEditor');
vi.mock('@/Editors/BackgroundDrawer');
vi.mock('@/Editors/Editor');

import { Editor } from '../../../Editors/Editor';
import CentralCanvas from '../CentralCanvas.vue';
import { useAnnotationToolStore } from '../../../stores/annotationToolStore';
import { FileAnnotationHistory } from '../../../cache/fileAnnotationHistory';
import { Point2D } from '../../../graph/point2d';

describe('AnnotationCanvas.vue', () => {
  let wrapper: VueWrapper;

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
    const h = new FileAnnotationHistory<Point2D>(mockFile);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const histories = tools.histories as any;
    histories._histories = [h];

    await wrapper.vm.$nextTick();

    expect(Editor.setBackgroundSource).toHaveBeenCalledWith(mockFile);
  });
});
