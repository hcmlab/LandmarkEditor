import { defineStore } from 'pinia';
import type { ModelApi } from '@/model/modelApi';
import type { Point3D } from '@/graph/point3d';
import { MediapipeModel } from '@/model/mediapipe';

export const useModelStore = defineStore('model', {
  state: (): {
    model: ModelApi<Point3D>;
  } => ({
    model: new MediapipeModel()
  }),
  actions: {}
});
