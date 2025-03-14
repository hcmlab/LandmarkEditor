import { defineStore } from 'pinia';

export const useFaceMeshConfig = defineStore({
  id: 'faceMeshConfig',

  state: (): {
    showTesselation: boolean;
  } => ({
    showTesselation: false
  }),
  actions: {}
});
