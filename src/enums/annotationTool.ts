export enum AnnotationTool {
  BackgroundDrawer = 'BackgroundDrawer',
  FaceMesh = 'Face Mesh',
  Pose = 'Pose'
}

export const allAnnotationTools: AnnotationTool[] = Object.values(
  AnnotationTool
) as AnnotationTool[];

allAnnotationTools.shift();
