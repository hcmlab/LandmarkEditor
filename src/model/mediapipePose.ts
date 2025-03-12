import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult
} from '@mediapipe/tasks-vision';
import type { AnnotationData, ModelApi } from '@/model/modelApi';
import { Point2D } from '@/graph/point2d';
import type { ImageFile } from '@/imageFile';
import { ModelType } from '@/enums/modelType';
import { imageFromFile } from '@/util/imageFromFile';
import { Graph } from '@/graph/graph';
import { findNeighbourPointIds } from '@/graph/face_landmarks_features';
import { AnnotationTool } from '@/enums/annotationTool';

// Docs on the model: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker

export class MediapipePoseModel implements ModelApi<Point2D> {
  private poseLandmarker: PoseLandmarker | null = null;

  private async initialize(): Promise<void> {
    return FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )
      .then((filesetResolver) =>
        PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
            delegate: undefined
          },
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputSegmentationMasks: false,
          runningMode: 'IMAGE',
          numPoses: 1
        })
      )
      .then((landmarker) => {
        this.poseLandmarker = landmarker;
      })
      .catch((e) => {
        throw new Error(`Failed to load model: ${e}`);
      });
  }

  async detect(imageFile: ImageFile): Promise<Graph<Point2D>[] | null> {
    if (!this.poseLandmarker) await this.initialize();
    const parsed_img = await imageFromFile(imageFile.filePointer);
    return new Promise<Graph<Point2D>[]>((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        const res = this.poseLandmarker?.detect(img);
        if (!res) {
          reject(new Error('PoseToolMenu could not be detected!'));
          return;
        }

        const graph = await MediapipePoseModel.processResult(res);
        if (!graph) {
          reject(new Error('PoseToolMenu could not be detected!'));
          return;
        }
        resolve([graph]);
      };
      img.src = parsed_img;
    });
  }

  private static async processResult(res: PoseLandmarkerResult): Promise<Graph<Point2D> | null> {
    if (res.landmarks.length == 0) return null;

    const graphs = await Promise.all(
      res.landmarks.map(async (landmarks) => {
        const points = await Promise.all(
          landmarks.map(async (dict, idx) => {
            const ids = Array.from(findNeighbourPointIds(idx, PoseLandmarker.POSE_CONNECTIONS, 1));
            return new Point2D(idx, dict.x, dict.y, ids);
          })
        );
        return new Graph(points);
      })
    );

    if (graphs) {
      return graphs[0];
    }
    return null;
  }

  type(): ModelType {
    return ModelType.other;
  }

  tool(): AnnotationTool {
    return AnnotationTool.Pose;
  }

  async uploadAnnotations(_: AnnotationData): Promise<void | Response> {
    return Promise.resolve();
  }
}
