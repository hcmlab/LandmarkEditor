import { defineStore } from 'pinia';

export const useFaceMeshConfig = defineStore({
  id: 'faceMeshConfig',

  state: (): {
    showTesselation: boolean;
    processing: boolean;
  } => ({
    showTesselation: false,
    processing: false
  }),
  actions: {}
});
