import { defineStore } from 'pinia';

export const useHandConfig = defineStore({
  id: 'handConfig',
  state: (): {
    processing: boolean;
  } => ({
    processing: false
  }),
  actions: {}
});
