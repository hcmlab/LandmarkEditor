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
  const requiredKeys: (keyof ToolConfig)[] = Object.keys({} as ToolConfig) as (keyof ToolConfig)[];

  return value && typeof value === 'object' && requiredKeys.every((key) => key in value);
}
