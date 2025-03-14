import { defineStore } from 'pinia';

export const usePointMoveConfig = defineStore({
  id: 'pointMoveConfig',
  state: (): {
    dragDepth: number;
  } => ({
    dragDepth: 0
  }),
  actions: {}
});
