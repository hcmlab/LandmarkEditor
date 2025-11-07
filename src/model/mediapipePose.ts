import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult
} from '@mediapipe/tasks-vision';
import { ModelApi } from '@/model/modelApi';
import { Point2D } from '@/graph/point2d';
import type { ImageFile } from '@/imageFile';
import { imageFromFile } from '@/util/imageFromFile';
import { Graph } from '@/graph/graph';
import { Connection, findNeighbourPointIds } from '@/graph/face_landmarks_features';
import { AnnotationTool } from '@/enums/annotationTool';
import { usePoseConfig } from '@/stores/ToolSpecific/poseConfig.ts';
import type { AnnotationData } from '@/graph/serialisedData.ts';
import { BodyFeature } from '@/enums/bodyFeature.ts';

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

export class MediapipePoseModel extends ModelApi<Point2D, PoseLandmarkerResult> {
  private poseLandmarker: PoseLandmarker | undefined = undefined;
  private readonly config = usePoseConfig();

  constructor() {
    super(AnnotationTool.Pose, false, []);
  }

  get shouldUpload(): boolean {
    return false;
  }

  async detect(
    imageFile: ImageFile,
    deletedFeatures: Set<BodyFeature> | undefined
  ): Promise<Graph<Point2D>[] | undefined> {
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

        const graph = await this.processResult(res, deletedFeatures);
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

  async uploadAnnotations(_: AnnotationData): Promise<void | Response> {
    return Promise.resolve();
  }

  pointIdsFromFeature(feature: BodyFeature): number[] {
    switch (feature) {
      case BodyFeature.Left_Eye:
        return POSE_FEATURE_LEFT_EYE;
      case BodyFeature.Right_Eye:
        return POSE_FEATURE_RIGHT_EYE;
      case BodyFeature.Nose:
        return POSE_FEATURE_NOSE;
      case BodyFeature.Mouth:
        return POSE_FEATURE_MOUTH;
      case BodyFeature.Left_Hand:
        return POSE_FEATURE_LEFT_HAND;
      case BodyFeature.Right_Hand:
        return POSE_FEATURE_RIGHT_HAND;
      case BodyFeature.Left_Eyebrow:
      case BodyFeature.Right_Eyebrow:
        return [];
    }
  }

  protected processResult(
    res: PoseLandmarkerResult,
    deletedFeatures: Set<BodyFeature> | undefined
  ): Graph<Point2D> | undefined {
    if (res.landmarks.length == 0) return undefined;

    const graphs = res.landmarks.map((landmarks) => {
      let points = landmarks.map((dict, idx) => {
        const ids = Array.from(findNeighbourPointIds(idx, PoseLandmarker.POSE_CONNECTIONS, 1));
        return new Point2D(idx, dict.x, dict.y, ids);
      });
      points = this.handleDeletedFeatures(points, deletedFeatures);
      return new Graph(points);
    });
    if (graphs) {
      return graphs[0];
    }
    return undefined;
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

export const POSE_FEATURE_LEFT_EYE = [1, 2, 3, 7];
export const POSE_FEATURE_RIGHT_EYE = [4, 5, 6, 8];
export const POSE_FEATURE_NOSE = [0];
export const POSE_FEATURE_MOUTH = [9, 10];
export const POSE_FEATURE_LEFT_HAND = [17, 19, 21];
export const POSE_FEATURE_RIGHT_HAND = [18, 20, 22];
export const LEFT_SIDE: Connection[] = [
  // Face connections
  new Connection(0, 1),
  new Connection(1, 2),
  new Connection(2, 3),
  new Connection(3, 7),
  // Arm Connections
  new Connection(11, 13),
  new Connection(13, 15),
  new Connection(15, 17),
  new Connection(15, 21),
  new Connection(15, 19),
  new Connection(17, 19),
  new Connection(11, 23),
  // Leg Connections
  new Connection(23, 25),
  new Connection(25, 27),
  new Connection(27, 29),
  new Connection(29, 31),
  new Connection(27, 31)
];
export const RIGHT_SIDE: Connection[] = [
  // Face connections
  new Connection(0, 4),
  new Connection(4, 5),
  new Connection(5, 6),
  new Connection(6, 8),
  // Arm Connections
  new Connection(12, 14),
  new Connection(14, 16),
  new Connection(16, 18),
  new Connection(16, 22),
  new Connection(16, 20),
  new Connection(18, 20),
  // Leg Connections
  new Connection(12, 24),
  new Connection(24, 26),
  new Connection(26, 28),
  new Connection(28, 30),
  new Connection(30, 32),
  new Connection(28, 32)
];
export const BOTH_SIDES: Connection[] = [
  new Connection(11, 12),
  new Connection(23, 24),
  new Connection(9, 10)
];
