import { AnnotationTool } from '@/enums/annotationTool';
import type { PoseModelType } from '@/model/mediapipePose';

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

export interface ToolConfig {
  faceMinDetectionConf: number;
  faceMinPresenceConf: number;
  faceTesselation: boolean;
  handMinDetectionConf: number;
  handMinPresenceConf: number;
  poseMinDetectionConf: number;
  poseMinPresenceConf: number;
  poseModelType: PoseModelType;
}

export interface AnnotationData {
  __id__?: string;
  config?: ToolConfig;

  [key: string]: GraphData | string | ToolConfig | undefined;
}
