import {
  FaceLandmarker,
  type FaceLandmarkerResult,
  FilesetResolver
} from '@mediapipe/tasks-vision';
import { ModelApi } from './modelApi';
import {
  FACE_FEATURE_LEFT_EYE,
  FACE_FEATURE_LEFT_EYEBROW,
  FACE_FEATURE_LIPS,
  FACE_FEATURE_NOSE,
  FACE_FEATURE_RIGHT_EYE,
  FACE_FEATURE_RIGHT_EYEBROW,
  findNeighbourPointIds
} from '@/graph/face_landmarks_features';
import { Graph } from '@/graph/graph';
import { Point3D } from '@/graph/point3d';
import { type ImageFile } from '@/imageFile';
import { AnnotationTool } from '@/enums/annotationTool';
import { imageFromFile } from '@/util/imageFromFile';
import { useFaceMeshConfig } from '@/stores/ToolSpecific/faceMeshConfig.ts';
import type { AnnotationData } from '@/graph/serialisedData.ts';
import { BodyFeature } from '@/enums/bodyFeature.ts';

/**
 * Represents a model using MediaPipe for face landmark detection.
 * Implements the ModelApi interface for working with Point3D graphs.
 */
export class MediapipeFaceModel extends ModelApi<Point3D, FaceLandmarkerResult> {
  private meshLandmarker: FaceLandmarker | undefined = undefined;
  private readonly config = useFaceMeshConfig();

  constructor(should_upload: boolean = false) {
    super(AnnotationTool.FaceMesh, should_upload, [
      BodyFeature.Nose,
      BodyFeature.Mouth,
      BodyFeature.Right_Eye,
      BodyFeature.Right_Eyebrow,
      BodyFeature.Left_Eye,
      BodyFeature.Left_Eyebrow
    ]);
  }

  async detect(
    imageFile: ImageFile,
    deletedFeatures: Set<BodyFeature> | undefined
  ): Promise<Graph<Point3D>[] | undefined> {
    this.config.processing = true;
    if (!this.meshLandmarker) await this.initialize();
    const img_src = await imageFromFile(imageFile.filePointer);
    return new Promise<Graph<Point3D>[] | undefined>((resolve, reject) => {
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
        const graph = this.processResult(result, deletedFeatures);
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

  updateSettings(): Promise<void> {
    if (!this.meshLandmarker) return Promise.resolve();
    return this.initialize();
  }

  async uploadAnnotations(_: AnnotationData): Promise<void | Response> {
    return Promise.resolve();
  }

  pointIdsFromFeature(feature: BodyFeature): number[] {
    switch (feature) {
      case BodyFeature.Left_Eye:
        return FACE_FEATURE_LEFT_EYE;
      case BodyFeature.Left_Eyebrow:
        return FACE_FEATURE_LEFT_EYEBROW;
      case BodyFeature.Right_Eye:
        return FACE_FEATURE_RIGHT_EYE;
      case BodyFeature.Right_Eyebrow:
        return FACE_FEATURE_RIGHT_EYEBROW;
      case BodyFeature.Nose:
        return FACE_FEATURE_NOSE;
      case BodyFeature.Mouth:
        return FACE_FEATURE_LIPS;
      case BodyFeature.Left_Hand:
      case BodyFeature.Right_Hand:
        return [];
    }
  }

  protected processResult(
    result: FaceLandmarkerResult,
    deletedFeatures: Set<BodyFeature> | undefined
  ) {
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
        landmarks = this.handleDeletedFeatures(landmarks, deletedFeatures);
        return new Graph(landmarks);
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
        FaceLandmarker.createFromOptions(filesetResolver, this.config.modelOptions)
      )
      .then((landmarker) => {
        this.meshLandmarker = landmarker;
      })
      .catch((e) => {
        throw new Error(`Failed to load Landmarker: ${e}`);
      });
  }
}
