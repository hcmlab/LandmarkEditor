import { FaceLandmarker } from '@mediapipe/tasks-vision';
import {
  FACE_LANDMARKS_NOSE,
  UPDATED_LEFT_IRIS,
  UPDATED_RIGHT_IRIS
} from '@/graph/face_landmarks_features';
import { AnnotationTool } from '@/enums/annotationTool';
import { PointMoveEditor } from '@/Editors/PointMoveEditor';

import {
  COLOR_EDGES_FACE_OVAL,
  COLOR_EDGES_LEFT_EYE,
  COLOR_EDGES_LEFT_IRIS,
  COLOR_EDGES_LIPS,
  COLOR_EDGES_NOSE,
  COLOR_EDGES_RIGHT_EYE,
  COLOR_EDGES_RIGHT_IRIS,
  COLOR_EDGES_TESSELATION
} from '@/Editors/EditorConstants';
import { useFaceMeshConfig } from '@/stores/ToolSpecific/faceMeshConfig.ts';

export class FaceMeshEditor extends PointMoveEditor {
  private readonly editorConfigStore = useFaceMeshConfig();

  constructor() {
    super(AnnotationTool.FaceMesh, useFaceMeshConfig());
  }

  draw(): void {
    if (this.graph.points.length === 0) return;
    // Draw Mesh
    if (this.editorConfigStore?.showTesselation) {
      this.drawFaceTrait(FaceLandmarker.FACE_LANDMARKS_TESSELATION, COLOR_EDGES_TESSELATION);
    }
    this.drawFaceTrait(FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, COLOR_EDGES_FACE_OVAL);
    this.drawFaceTrait(FaceLandmarker.FACE_LANDMARKS_LIPS, COLOR_EDGES_LIPS);
    this.drawFaceTrait(FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, COLOR_EDGES_RIGHT_EYE);
    this.drawFaceTrait(FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, COLOR_EDGES_RIGHT_EYE);
    this.drawFaceTrait(UPDATED_RIGHT_IRIS, COLOR_EDGES_RIGHT_IRIS);
    this.drawFaceTrait(FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, COLOR_EDGES_LEFT_EYE);
    this.drawFaceTrait(FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, COLOR_EDGES_LEFT_EYE);
    this.drawFaceTrait(UPDATED_LEFT_IRIS, COLOR_EDGES_LEFT_IRIS);
    this.drawFaceTrait(FACE_LANDMARKS_NOSE, COLOR_EDGES_NOSE);
  }
}
