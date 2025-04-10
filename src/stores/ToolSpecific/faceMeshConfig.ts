import { defineStore } from 'pinia';

export const useFaceMeshConfig = defineStore('faceMeshConfig', {
  state: (): {
    dragDepth: number;
    showTesselation: boolean;
  } => ({
    dragDepth: 0,
    showTesselation: false
  }),
  actions: {}
});
