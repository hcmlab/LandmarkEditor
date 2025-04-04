import { defineStore } from 'pinia';

export const usePointMoveConfig = defineStore('pointMoveConfig', {
  state: (): {
    dragDepth: number;
  } => ({
    dragDepth: 0
  }),
  getters: {
    getDragDepth: (state) => state.dragDepth
  },
  actions: {}
});
