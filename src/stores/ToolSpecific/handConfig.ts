import { defineStore } from 'pinia';
import type { HandLandmarkerOptions } from '@mediapipe/tasks-vision';

export const useHandConfig = defineStore('handConfig', {
  state: () => ({
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
    } as HandLandmarkerOptions
  }),
  getters: {
    isProcessing: (state) => state.processing,
    getModelOptions: (state) => {
      const config = state.modelOptions;
      if (!config.baseOptions) throw new Error('Model config is not properly set');
      return config;
    },
    minDetectionConfidence: (state) => state.modelOptions.minHandDetectionConfidence,
    minPresenceConfidence: (state) => state.modelOptions.minHandPresenceConfidence
  },
  actions: {
    setProcessing(processing: boolean) {
      this.processing = processing;
    },
    setMinDetectionConfidence(handDetectionConfidence: number) {
      if (handDetectionConfidence < 0 || handDetectionConfidence > 1) {
        throw new Error('Hand detection confidence must be between 0 and 1');
      }
      this.modelOptions.minHandDetectionConfidence = handDetectionConfidence;
    },
    setMinPresenceConfidence(handPresence: number) {
      if (handPresence < 0 || handPresence > 1) {
        throw new Error('Hand presence confidence must be between 0 and 1');
      }
      this.modelOptions.minHandPresenceConfidence = handPresence;
    }
  }
});
