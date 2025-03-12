import { FaceLandmarker } from '@mediapipe/tasks-vision';
import { type CanvasGradient, type CanvasPattern } from 'canvas';
import {
  Connection,
  FACE_LANDMARKS_NOSE,
  UPDATED_LEFT_IRIS,
  UPDATED_RIGHT_IRIS
} from '@/graph/face_landmarks_features';
import { useFaceMeshConfig } from '@/stores/ToolSpecific/faceMeshConfig';
import { Editor } from '@/Editors/Editor';
import { AnnotationTool } from '@/enums/annotationTool';
import { PointMoveEditor, type PointPairs } from '@/Editors/PointMoveEditor';

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
import type { Point2D } from '@/graph/point2d';

export class FaceMeshEditor extends PointMoveEditor {
  private readonly editorConfigStore = useFaceMeshConfig();

  constructor() {
    super(AnnotationTool.FaceMesh);
    this.editorConfigStore.$subscribe(() => {
      Editor.draw();
    });

    Editor.add(this);
  }

  get tool(): AnnotationTool {
    return AnnotationTool.FaceMesh;
  }

  draw(): void {
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

  private drawFaceTrait(
    connections: Connection[],
    color: string | CanvasGradient | CanvasPattern
  ): void {
    if (this.graph) {
      const pointPairs: PointPairs<Point2D>[] = connections.map((connection) => {
        return {
          start: this.graph.getById(connection.start),
          end: this.graph.getById(connection.end)
        } as PointPairs<Point2D>;
      });

      this.drawEdges(color, pointPairs);
    }
  }

  getDragDepth(): number {
    return this.editorConfigStore.dragDepth;
  }
}
