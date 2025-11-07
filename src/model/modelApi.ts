import { Point2D } from '@/graph/point2d';
import type { ImageFile } from '@/imageFile';
import type { Graph } from '@/graph/graph';
import type { AnnotationTool } from '@/enums/annotationTool';
import type { AnnotationData } from '@/graph/serialisedData.ts';
import type { BodyFeature } from '@/enums/bodyFeature.ts';

/**
 * Represents an interface for a model API that performs face landmark detection.
 * @template P - Type of the points (must extend Point2D).
 */
export abstract class ModelApi<P extends Point2D, ResultType> {
  protected constructor(
    tool: AnnotationTool,
    should_upload: boolean,
    precedenceFeatures: BodyFeature[]
  ) {
    this._tool = tool;
    this._shouldUpload = should_upload;
    this._precedenceFeatures = precedenceFeatures;
  }

  _precedenceFeatures: BodyFeature[] = [];

  /**
   * Returns a list of features, where the model takes precedence. For example because it provides more details.
   */
  get precedenceFeatures(): BodyFeature[] {
    return this._precedenceFeatures;
  }

  _shouldUpload: boolean = false;

  get shouldUpload(): boolean {
    return this._shouldUpload;
  }

  _tool: AnnotationTool;

  get tool(): AnnotationTool {
    return this._tool;
  }

  /**
   * Detects face landmarks in the provided image file.
   * @param imageFile - The image file to analyze.
   * @param deletedFeatures - deletedFeatures, to be marked as deleted in the individual points
   * @returns - A promise resolving to a graph of detected face landmarks.
   */
  abstract detect(
    imageFile: ImageFile,
    deletedFeatures: Set<BodyFeature> | undefined
  ): Promise<Graph<P>[] | undefined>;

  /**
   * Uploads annotations.
   * @param annotations - A JSON string containing annotation data.
   * @returns {Promise<void>} - A promise that resolves when the upload is complete.
   */
  abstract uploadAnnotations(annotations: AnnotationData): Promise<void | Response>;

  abstract updateSettings(): Promise<void>;

  abstract pointIdsFromFeature(feature: BodyFeature): number[];

  protected handleDeletedFeatures(landmarks: P[], deletedFeatures: Set<BodyFeature> | undefined) {
    if (!deletedFeatures) return landmarks;
    deletedFeatures.forEach((feature) => {
      this.pointIdsFromFeature(feature).forEach((point) => {
        landmarks[point].deleted = true;
      });
    });
    return landmarks;
  }

  protected abstract processResult(
    res: ResultType,
    deletedFeatures: Set<BodyFeature> | undefined
  ): Graph<P> | undefined;
}
