import { Point2D } from '@/graph/point2d';
import type { ImageFile } from '@/imageFile';
import type { Graph } from '@/graph/graph';
import type { AnnotationTool } from '@/enums/annotationTool';
import type { GraphData } from '@/graph/serialisedData.ts';

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
   * @param {ImageFile} imageFile - The image file to analyze.
   * @returns {Promise<Graph<Point2D>>} - A promise resolving to a graph of detected face landmarks.
   */
  detect(imageFile: ImageFile): Promise<Graph<P>[] | undefined>;

  /**
   * Uploads annotations.
   * @param annotations - A JSON string containing annotation data.
   * @returns {Promise<void>} - A promise that resolves when the upload is complete.
   */
  uploadAnnotations(annotations: AnnotationData): Promise<void | Response>;

  updateSettings(): Promise<void>;

  get shouldUpload(): boolean;

  tool(): AnnotationTool;
}
