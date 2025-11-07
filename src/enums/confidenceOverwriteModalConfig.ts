import type { AnnotationTool } from '@/enums/annotationTool.ts';

export interface ConfidenceOverwriteModalConfig {
  tool: AnnotationTool;
  detectionConfidence: number;
  presenceConfidence: number;
}
