import { AnnotationTool } from '@/enums/annotationTool.ts';
import type { PoseModelType } from '@/model/mediapipePose.ts';

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
  handMinDetectionConf: number;
  handMinPresenceConf: number;
  faceMinDetectionConf: number;
  faceMinPresenceConf: number;
  poseMinDetectionConf: number;
  poseMinPresenceConf: number;
  poseModelType: PoseModelType;
}

export interface AnnotationData {
  __id__?: string;
  config?: ToolConfig;
  [key: string]: GraphData | string | ToolConfig | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isToolConfig(value: any): value is ToolConfig {
  return (
    value &&
    typeof value === 'object' &&
    'handMinDetectionConf' in value &&
    'handMinPresenceConf' in value &&
    'faceMinDetectionConf' in value &&
    'faceMinPresenceConf' in value &&
    'poseMinDetectionConf' in value &&
    'poseMinPresenceConf' in value &&
    'poseModelType' in value
  );
}
