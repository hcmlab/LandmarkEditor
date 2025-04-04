import { defineStore } from 'pinia';
import type { PoseLandmarkerOptions } from '@mediapipe/tasks-vision';
import { PoseModelType } from '@/model/mediapipePose.ts';

export const usePoseConfig = defineStore('poseConfig', {
  state: () => ({
    processing: false,
    modelConfig: {
      baseOptions: {
        modelAssetPath: '',
        delegate: undefined
      },
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputSegmentationMasks: false,
      runningMode: 'IMAGE',
      numPoses: 1
    } as PoseLandmarkerOptions,
    modelType: PoseModelType.FULL
  }),
  getters: {
    isProcessing: (state) => state.processing,
    getModelConfig: (state) => {
      const config = state.modelConfig;
      if (!config.baseOptions) throw new Error('Model config is not properly set');
      switch (state.modelType) {
        case PoseModelType.LITE:
          config.baseOptions.modelAssetPath =
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';
          break;
        case PoseModelType.FULL:
          config.baseOptions.modelAssetPath =
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task';
          break;
        case PoseModelType.HEAVY:
          config.baseOptions.modelAssetPath =
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task';
          break;
      }
      return config;
    },
    getModelType: (state) => state.modelType
  },
  actions: {}
});
