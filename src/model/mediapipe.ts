import {
  FaceLandmarker,
  type FaceLandmarkerResult,
  FilesetResolver
} from '@mediapipe/tasks-vision';
import type { AnnotationData, ModelApi } from './modelApi';
import { findNeighbourPointIds } from '@/graph/face_landmarks_features';
import { Graph } from '@/graph/graph';
import { Point3D } from '@/graph/point3d';
import { ModelType } from '@/enums/modelType';
import { type ImageFile } from '@/imageFile';
import { AnnotationTool } from '@/enums/annotationTool';
import { imageFromFile } from '@/util/imageFromFile';
import { useFaceMeshConfig } from '@/stores/ToolSpecific/faceMeshConfig.ts';
/**
 * Represents a model using MediaPipe for face landmark detection.
 * Implements the ModelApi interface for working with Point3D graphs.
 */
export class MediapipeModel implements ModelApi<Point3D> {
  private meshLandmarker: FaceLandmarker | null = null;
  private readonly config = useFaceMeshConfig();

  private async initialize(): Promise<void> {
    return FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )
      .then((filesetResolver) =>
        FaceLandmarker.createFromOptions(filesetResolver, this.config.modelOptions)
      )
      .then((landmarker) => {
        this.meshLandmarker = landmarker;
      })
      .catch((e) => {
        throw new Error(`Failed to load Landmarker: ${e}`);
      });
  }

  async detect(imageFile: ImageFile): Promise<Graph<Point3D>[] | null> {
    this.config.processing = true;
    if (!this.meshLandmarker) await this.initialize();
    const img_src = await imageFromFile(imageFile.filePointer);
    return new Promise<Graph<Point3D>[] | null>((resolve, reject) => {
      const image = new Image();
      image.onload = (_) => {
        const result = this.meshLandmarker?.detect(image);
        if (!result) {
          this.config.processing = false;
          reject(
            new Error(`Face(s) could not be detected for image ${imageFile.filePointer.name}!`)
          );
          return;
        }
        const graph = MediapipeModel.processResult(result);
        if (!graph) {
          this.config.processing = false;
          reject(new Error(`Face(s) could not be for image ${imageFile.filePointer.name}!`));
          return;
        }
        this.config.processing = false;
        resolve([graph]);
      };
      image.src = img_src;
    });
  }

  private static processResult(result: FaceLandmarkerResult) {
    const graphs = result.faceLandmarks
      .map((landmarks) =>
        landmarks.map((dict, idx) => {
          const ids = Array.from(
            findNeighbourPointIds(idx, FaceLandmarker.FACE_LANDMARKS_TESSELATION, 1)
          );
          return new Point3D(idx, dict.x, dict.y, dict.z, ids);
        })
      )
      // filter out the iris markings
      .map((landmarks) => {
        landmarks = landmarks.filter((point) => {
          return ![
            ...FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS.map((con) => con.start),
            ...FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS.map((con) => con.start)
          ].includes(point.id);
        });
        return new Graph(landmarks);
      });
    if (graphs) {
      return graphs[0];
    }
    return null;
  }

  updateSettings(): Promise<void> {
    if (!this.meshLandmarker) return Promise.resolve();
    return this.initialize();
  }

  async uploadAnnotations(_: AnnotationData): Promise<void | Response> {
    return Promise.resolve();
  }

  type(): ModelType {
    return ModelType.mediapipeFaceMesh;
  }

  tool(): AnnotationTool {
    return AnnotationTool.FaceMesh;
  }
}
