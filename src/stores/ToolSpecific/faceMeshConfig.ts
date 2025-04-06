import { defineStore } from 'pinia';
import type { FaceLandmarkerOptions } from '@mediapipe/tasks-vision';

export const useFaceMeshConfig = defineStore('faceMeshConfig', {
  state: () => ({
    showTesselation: false,
    processing: false,
    modelOptions: {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        // When adding user model of same type -> modelAssetBuffer
        delegate: 'CPU'
      },
      minFaceDetectionConfidence: 0.3,
      minFacePresenceConfidence: 0.3,
      runningMode: 'IMAGE',
      numFaces: 1,
      outputFacialTransformationMatrixes: true,
      outputFaceBlendshapes: true
    } as FaceLandmarkerOptions
  }),
  getters: {
    minDetectionConfidence: (state) => state.modelOptions.minFaceDetectionConfidence,
    minPresenceConfidence: (state) => state.modelOptions.minFacePresenceConfidence
  },
  actions: {
    setProcessing(processing: boolean) {
      this.processing = processing;
    },
    setShowTesselation(showTesselation: boolean) {
      this.showTesselation = showTesselation;
    },
    setMinDetectionConfidence(faceDetectionConfidence: number) {
      if (faceDetectionConfidence < 0 || faceDetectionConfidence > 1) {
        throw new Error('Face detection confidence must be between 0 and 1');
      }
      this.modelOptions.minFaceDetectionConfidence = faceDetectionConfidence;
    },
    setMinPresenceConfidence(facePresence: number) {
      if (facePresence < 0 || facePresence > 1) {
        throw new Error('Face presence confidence must be between 0 and 1');
      }
      this.modelOptions.minFacePresenceConfidence = facePresence;
    }
  }
});
