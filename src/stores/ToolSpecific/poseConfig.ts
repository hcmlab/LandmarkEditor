import { defineStore } from 'pinia';
import type { PoseLandmarkerOptions } from '@mediapipe/tasks-vision';
import { PoseModelType } from '@/model/mediapipePose.ts';

export const usePoseConfig = defineStore('poseConfig', {
  state: () => ({
    processing: false,
    modelOptions: {
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
    getModelOptions: (state) => {
      const config = state.modelOptions;
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
    getModelType: (state) => state.modelType,
    minDetectionConfidence: (state) => state.modelOptions.minPoseDetectionConfidence ?? 0.5,
    minPresenceConfidence: (state) => state.modelOptions.minPosePresenceConfidence ?? 0.5
  },
  actions: {
    setProcessing(processing: boolean) {
      this.processing = processing;
    },
    setMinDetectionConfidence(poseDetectionConfidence: number) {
      if (poseDetectionConfidence < 0 || poseDetectionConfidence > 1) {
        throw new Error('Pose detection confidence must be between 0 and 1');
      }
      this.modelOptions.minPoseDetectionConfidence = poseDetectionConfidence;
    },
    setMinPresenceConfidence(posePresence: number) {
      if (posePresence < 0 || posePresence > 1) {
        throw new Error('Pose presence confidence must be between 0 and 1');
      }
      this.modelOptions.minPosePresenceConfidence = posePresence;
    },
    setModelType(modelType: PoseModelType) {
      this.modelType = modelType;
    }
  }
});
