import { defineStore } from 'pinia';

export const usePoseConfig = defineStore({
  id: 'poseConfig',
  state: (): {
    processing: boolean;
  } => ({
    processing: false
  }),
  actions: {}
});
