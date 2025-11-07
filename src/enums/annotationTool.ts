export enum AnnotationTool {
  BackgroundDrawer = 'BackgroundDrawer',
  FaceMesh = 'Face Mesh',
  Hand = 'Hand',
  Pose = 'Pose'
}

export const allAnnotationTools: AnnotationTool[] = Object.values(
  AnnotationTool
) as AnnotationTool[];

allAnnotationTools.shift();
