import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { AnnotationTool } from '../../enums/annotationTool';
import { useAnnotationToolStore } from '../annotationToolStore';

describe('useAnnotationToolStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with FaceMeshToolMenu Tool', () => {
    const store = useAnnotationToolStore();
    expect(store.tools).toEqual(new Set([AnnotationTool.FaceMesh]));
  });

  it('adds a new tool to the tools array', () => {
    const store = useAnnotationToolStore();
    const newTool = AnnotationTool.FaceMesh;
    store.tools.add(newTool);
    expect(store.tools).toContain(newTool);
  });
});
