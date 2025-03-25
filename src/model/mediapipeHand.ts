import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult
} from '@mediapipe/tasks-vision';
import type { AnnotationData, ModelApi } from '@/model/modelApi';
import { Point2D } from '@/graph/point2d';
import type { ImageFile } from '@/imageFile';
import { Graph } from '@/graph/graph';
import { AnnotationTool } from '@/enums/annotationTool';
import { ModelType } from '@/enums/modelType';
import { imageFromFile } from '@/util/imageFromFile';
import { findNeighbourPointIds } from '@/graph/face_landmarks_features';

export class MediapipeHandModel implements ModelApi<Point2D> {
  private handLandmarker: HandLandmarker | null = null;

  private async initialize(): Promise<void> {
    return FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )
      .then((filesetResolver) =>
        HandLandmarker.createFromOptions(filesetResolver, {
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
        })
      )
      .then((landmarker) => {
        this.handLandmarker = landmarker;
      })
      .catch((e) => {
        throw new Error(`Failed to load model: ${e}`);
      });
  }

  async detect(imageFile: ImageFile): Promise<Graph<Point2D>[] | null> {
    if (!this.handLandmarker) await this.initialize();
    const parsed_img = await imageFromFile(imageFile.filePointer);
    return new Promise<Graph<Point2D>[]>((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        const res = this.handLandmarker?.detect(img);
        if (!res) {
          reject(new Error('Pose could not be detected!'));
          return;
        }

        const graph = await MediapipeHandModel.processResult(res);
        if (!graph) {
          reject(new Error('Pose could not be detected!'));
          return;
        }
        resolve([graph]);
      };
      img.src = parsed_img;
    });
  }

  private static async processResult(res: HandLandmarkerResult): Promise<Graph<Point2D> | null> {
    if (res.landmarks.length == 0) return null;

    const points = res.landmarks.flat().map((landmark, idx) => {
      const ids = Array.from(findNeighbourPointIds(idx, HandLandmarker.HAND_CONNECTIONS, 1));
      console.log(landmark);
      return new Point2D(idx, landmark.x, landmark.y, ids);
    });

    const graph = new Graph(points);
    if (points) {
      return graph;
    }
    return null;
  }

  tool(): AnnotationTool {
    return AnnotationTool.Hand;
  }

  type(): ModelType {
    return ModelType.other;
  }

  async uploadAnnotations(_: AnnotationData): Promise<void | Response> {
    return Promise.resolve();
  }
}
