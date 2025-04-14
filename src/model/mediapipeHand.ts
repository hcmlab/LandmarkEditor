import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult
} from '@mediapipe/tasks-vision';
import { ModelApi } from '@/model/modelApi';
import { Point2D } from '@/graph/point2d';
import type { ImageFile } from '@/imageFile';
import { Graph } from '@/graph/graph';
import { AnnotationTool } from '@/enums/annotationTool';
import { imageFromFile } from '@/util/imageFromFile';
import { findNeighbourPointIds } from '@/graph/face_landmarks_features';
import { useHandConfig } from '@/stores/ToolSpecific/handConfig.ts';
import type { AnnotationData } from '@/graph/serialisedData.ts';
import { BodyFeature } from '@/enums/bodyFeature.ts';

export class MediapipeHandModel extends ModelApi<Point2D, HandLandmarkerResult> {
  private handLandmarker: HandLandmarker | undefined = undefined;
  private readonly config = useHandConfig();

  constructor() {
    super(AnnotationTool.Hand, false, [BodyFeature.Left_Hand, BodyFeature.Right_Hand]);
  }

  get shouldUpload(): boolean {
    return false;
  }

  async detect(imageFile: ImageFile): Promise<Graph<Point2D>[] | undefined> {
    this.config.processing = true;
    if (!this.handLandmarker) await this.initialize();
    const parsed_img = await imageFromFile(imageFile.filePointer);
    return new Promise<Graph<Point2D>[]>((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        const res = this.handLandmarker?.detect(img);
        if (!res) {
          this.config.processing = false;
          reject(
            new Error(`Hand(s) could not be detected for image  ${imageFile.filePointer.name}!`)
          );
          return;
        }

        const graph = await this.processResult(res);
        if (!graph) {
          this.config.processing = false;
          reject(
            new Error(`Hand(s) could not be detected for image  ${imageFile.filePointer.name}!`)
          );
          return;
        }
        this.config.processing = false;
        resolve([graph]);
      };
      img.src = parsed_img;
    });
  }

  updateSettings() {
    if (!this.handLandmarker) return Promise.resolve();
    return this.initialize();
  }

  async uploadAnnotations(_: AnnotationData): Promise<void | Response> {
    return Promise.resolve();
  }

  pointIdsFromFeature(feature: BodyFeature): number[] {
    switch (feature) {
      case BodyFeature.Left_Eye:
      case BodyFeature.Left_Eyebrow:
      case BodyFeature.Right_Eye:
      case BodyFeature.Right_Eyebrow:
      case BodyFeature.Nose:
      case BodyFeature.Mouth:
        return [];
      case BodyFeature.Left_Hand:
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      case BodyFeature.Right_Hand:
        return [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];
    }
  }

  protected processResult(res: HandLandmarkerResult): Graph<Point2D> | undefined {
    if (res.landmarks.length == 0) return undefined;

    const points = res.landmarks.flat().map((landmark, idx) => {
      const ids = Array.from(findNeighbourPointIds(idx, HandLandmarker.HAND_CONNECTIONS, 1));
      return new Point2D(idx, landmark.x, landmark.y, ids);
    });

    const graph = new Graph(points);
    if (points) {
      return graph;
    }
    return undefined;
  }

  private async initialize(): Promise<void> {
    return FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )
      .then((filesetResolver) =>
        HandLandmarker.createFromOptions(filesetResolver, this.config.getModelOptions)
      )
      .then((landmarker) => {
        this.handLandmarker = landmarker;
      })
      .catch((e) => {
        throw new Error(`Failed to load model: ${e}`);
      });
  }
}
