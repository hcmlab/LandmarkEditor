import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult
} from '@mediapipe/tasks-vision';
import type { ModelApi } from '@/model/modelApi';
import { Point2D } from '@/graph/point2d';
import type { ImageFile } from '@/imageFile';
import { imageFromFile } from '@/util/imageFromFile';
import { Graph } from '@/graph/graph';
import { findNeighbourPointIds } from '@/graph/face_landmarks_features';
import { AnnotationTool } from '@/enums/annotationTool';
import { usePoseConfig } from '@/stores/ToolSpecific/poseConfig.ts';
import type { AnnotationData } from '@/graph/serialisedData.ts';

// Docs on the model: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker

export enum PoseModelType {
  LITE = 'Lite',
  FULL = 'Full',
  HEAVY = 'Heavy'
}

export const poseModelTypes: PoseModelType[] = [
  PoseModelType.LITE,
  PoseModelType.FULL,
  PoseModelType.HEAVY
];

export class MediapipePoseModel implements ModelApi<Point2D> {
  private poseLandmarker: PoseLandmarker | undefined = undefined;
  private readonly config = usePoseConfig();

  get shouldUpload(): boolean {
    return false;
  }

  private static async processResult(
    res: PoseLandmarkerResult
  ): Promise<Graph<Point2D> | undefined> {
    if (res.landmarks.length == 0) return undefined;

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
    return undefined;
  }

  async detect(imageFile: ImageFile): Promise<Graph<Point2D>[] | undefined> {
    this.config.processing = true;
    if (!this.poseLandmarker) await this.initialize();
    const parsed_img = await imageFromFile(imageFile.filePointer);
    return new Promise<Graph<Point2D>[]>((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        const res = this.poseLandmarker?.detect(img);
        if (!res) {
          this.config.processing = false;
          reject(new Error(`Pose could not be detected for image ${imageFile.filePointer.name}!`));
          return;
        }

        const graph = await MediapipePoseModel.processResult(res);
        if (!graph) {
          this.config.processing = false;
          reject(new Error(`Pose could not be detected for image ${imageFile.filePointer.name}!`));
          return;
        }
        this.config.processing = false;
        resolve([graph]);
      };
      img.src = parsed_img;
    });
  }

  async updateSettings(): Promise<void> {
    return this.initialize();
  }

  tool(): AnnotationTool {
    return AnnotationTool.Pose;
  }

  async uploadAnnotations(_: AnnotationData): Promise<void | Response> {
    return Promise.resolve();
  }

  private async initialize(): Promise<void> {
    return FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )
      .then((filesetResolver) =>
        PoseLandmarker.createFromOptions(filesetResolver, this.config.getModelOptions)
      )
      .then((landmarker) => {
        this.poseLandmarker = landmarker;
      })
      .catch((e) => {
        throw new Error(`Failed to load model: ${e}`);
      });
  }
}
