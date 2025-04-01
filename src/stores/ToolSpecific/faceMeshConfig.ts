import { defineStore } from 'pinia';
import type { FaceLandmarkerOptions } from '@mediapipe/tasks-vision';

export const useFaceMeshConfig = defineStore({
  id: 'faceMeshConfig',

  state: (): {
    showTesselation: boolean;
    processing: boolean;
    modelOptions: FaceLandmarkerOptions;
  } => ({
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
    }
  }),
  actions: {}
});
