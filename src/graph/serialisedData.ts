import { AnnotationTool } from '@/enums/annotationTool.ts';

export interface PointData {
  deleted: boolean;
  x: number;
  y: number;
  z?: number;
  id: number;
}

export interface ImageAnnotationData {
  [AnnotationTool.FaceMesh]?: PointData[][];
  [AnnotationTool.Hand]?: PointData[][];
  [AnnotationTool.Pose]?: PointData[][];
}

export interface GraphData {
  points?: ImageAnnotationData;
  sha256?: string;
}
