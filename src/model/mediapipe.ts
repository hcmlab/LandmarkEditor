import { ModelApi } from './modelApi';
import { Graph } from '../graph/graph';
import {
  findNeighbourPointIds,
  UPDATED_LEFT_IRIS,
  UPDATED_RIGHT_IRIS,
} from '../graph/face_landmarks_features';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { Point2D } from '../graph/point2d';
import { Point3D } from '../graph/point3d';

/**
 * Represents a model using MediaPipe for face landmark detection.
 * Implements the ModelApi interface for working with Point2D graphs.
 */
export class MediapipeModel implements ModelApi<Point2D> {
  private meshLandmarker: FaceLandmarker;

  /**
   * Creates a new MediapipeModel instance.
   */
  constructor() {
    FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    )
      .then((filesetResolver) =>
        FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            // When adding user model of same type -> modelAssetBuffer
            delegate: 'CPU',
          },
          minFaceDetectionConfidence: 0.3,
          minFacePresenceConfidence: 0.3,
          runningMode: 'IMAGE',
          numFaces: 1,
        }),
      )
      .then((landmarker) => (this.meshLandmarker = landmarker));
  }

  async detect(imageFile: File): Promise<Graph<Point2D>> {
    return new Promise<Graph<Point2D>>((resolve, reject) => {
      const image = new Image();
      image.onload = (_) => {
        const result = this.meshLandmarker?.detect(image);
        if (result) {
          const graphs = result.faceLandmarks
            .map((landmarks) =>
              landmarks
                .map((dict, idx) => {
                  // calculate the iris center
                  if (idx === UPDATED_LEFT_IRIS[0].start) {
                    const iris = FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS.reduce(
                      (acc, con) => {
                        acc.x += landmarks[con.start].x;
                        acc.y += landmarks[con.start].y;
                        acc.z += landmarks[con.start].z;
                        return acc;
                      },
                      { x: 0.0, y: 0.0, z: 0.0 },
                    );

                    const avgFactor =
                      FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS.length;
                    dict.x = iris.x / avgFactor;
                    dict.y = iris.y / avgFactor;
                    dict.z = iris.z / avgFactor;
                  }
                  if (idx === UPDATED_RIGHT_IRIS[0].start) {
                    const iris =
                      FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS.reduce(
                        (acc, con) => {
                          acc.x += landmarks[con.start].x;
                          acc.y += landmarks[con.start].y;
                          acc.z += landmarks[con.start].z;
                          return acc;
                        },
                        { x: 0.0, y: 0.0, z: 0.0 },
                      );

                    const avgFactor =
                      FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS.length;
                    dict.x = iris.x / avgFactor;
                    dict.y = iris.y / avgFactor;
                    dict.z = iris.z / avgFactor;
                  }

                  const ids = Array.from(
                    findNeighbourPointIds(
                      idx,
                      FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                      1,
                    ),
                  );
                  return new Point3D(idx, dict.x, dict.y, dict.z, ids);
                })
                .map((point) => point as Point2D),
            )
            .map((landmarks) => {
              landmarks = landmarks.filter((point) => {
                return ![
                  ...FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS.slice(2).map(
                    (con) => con.start,
                  ),
                  ...FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
                ].includes(point.id);
              });
              return new Graph(landmarks);
            });
          if (graphs) {
            resolve(graphs[0]);
          }
        } else {
          reject('Face(s) could not be detected!');
        }
      };
      const reader = new FileReader();
      reader.onload = (_) => {
        const result = reader.result;
        if (result) {
          image.src = result.toString();
        } else {
          reject('Image could not be read!');
        }
      };
      reader.readAsDataURL(imageFile);
    });
  }

  async uploadAnnotations(_: string): Promise<void | Response> {
    return Promise.resolve();
  }
}
