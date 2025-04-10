import { defineStore } from 'pinia';
import { AnnotationTool } from '@/enums/annotationTool';

export const useAnnotationToolStore = defineStore('annotationTool', {
  state: (): {
    tools: Set<AnnotationTool>;
  } => ({
    tools: new Set([AnnotationTool.FaceMesh])
  }),
  actions: {}
});
