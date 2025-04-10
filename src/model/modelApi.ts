import { Point2D } from '@/graph/point2d';
import type { ModelType } from '@/enums/modelType';
import { FileAnnotationHistory, type GraphData } from '@/cache/fileAnnotationHistory';

import type { MultipleViewImage } from '@/interface/multiple_view_image';

export interface AnnotationData {
  [key: string]: GraphData | string;
}

/**
 * Represents an interface for a model API that performs face landmark detection.
 * @template P - Type of the points (must extend Point2D).
 */
export interface ModelApi<P extends Point2D> {
  /**
   * Detects face landmarks in the provided image file.
   * @param imageFile - The image file to analyze.
   * @returns - A promise resolving to a graph of detected face landmarks.
   */
  detect(imageFile: MultipleViewImage): Promise<FileAnnotationHistory<P> | null>;

  /**
   * Uploads annotations.
   * @param annotations - A JSON string containing annotation data.
   * @returns A promise that resolves when the upload is complete.
   */
  uploadAnnotations(annotations: AnnotationData): Promise<void | Response>;

  type(): ModelType;
}
