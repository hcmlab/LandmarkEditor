import { defineStore } from 'pinia';

export const useImageLoadStore = defineStore('imageLoad', {
  state: (): {
    showLoadModal: boolean;
  } => ({
    showLoadModal: false
  }),
  actions: {}
});
