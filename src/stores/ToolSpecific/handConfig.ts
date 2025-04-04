import { defineStore } from 'pinia';
import type { HandLandmarkerOptions } from '@mediapipe/tasks-vision';

export const useHandConfig = defineStore('handConfig', {
  state: (): {
    processing: boolean;
    modelOptions: HandLandmarkerOptions;
  } => ({
    processing: false,
    modelOptions: {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
        delegate: undefined
      },
      runningMode: 'IMAGE',
      minTrackingConfidence: 0.5,
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5
    }
  }),
  getters: {
    isProcessing: (state) => state.processing,
    getModelOptions: (state) => {
      const config = state.modelOptions;
      if (!config.baseOptions) throw new Error('Model config is not properly set');
      return config;
    }
  },
  actions: {}
});
