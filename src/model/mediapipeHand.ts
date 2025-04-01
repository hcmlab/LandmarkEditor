import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult
} from '@mediapipe/tasks-vision';
import type { ModelApi } from '@/model/modelApi';
import { Point2D } from '@/graph/point2d';
import type { ImageFile } from '@/imageFile';
import { Graph } from '@/graph/graph';
import { AnnotationTool } from '@/enums/annotationTool';
import { imageFromFile } from '@/util/imageFromFile';
import { findNeighbourPointIds } from '@/graph/face_landmarks_features';
import { useHandConfig } from '@/stores/ToolSpecific/handConfig.ts';
import type { AnnotationData } from '@/graph/serialisedData.ts';

export class MediapipeHandModel implements ModelApi<Point2D> {
  private handLandmarker: HandLandmarker | undefined = undefined;
  private readonly config = useHandConfig();

  private async initialize(): Promise<void> {
    return FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )
      .then((filesetResolver) =>
        HandLandmarker.createFromOptions(filesetResolver, this.config.modelOptions)
      )
      .then((landmarker) => {
        this.handLandmarker = landmarker;
      })
      .catch((e) => {
        throw new Error(`Failed to load model: ${e}`);
      });
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

        const graph = await MediapipeHandModel.processResult(res);
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

  private static async processResult(
    res: HandLandmarkerResult
  ): Promise<Graph<Point2D> | undefined> {
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

  updateSettings() {
    if (!this.handLandmarker) return Promise.resolve();
    return this.initialize();
  }

  tool(): AnnotationTool {
    return AnnotationTool.Hand;
  }

  get shouldUpload(): boolean {
    return false;
  }

  async uploadAnnotations(_: AnnotationData): Promise<void | Response> {
    return Promise.resolve();
  }
}
