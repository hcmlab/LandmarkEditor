import { FaceLandmarker } from '@mediapipe/tasks-vision';
import { type CanvasGradient, type CanvasPattern } from 'canvas';
import {
  Connection,
  FACE_FEATURE_LEFT_EYE,
  FACE_FEATURE_LEFT_EYEBROW,
  FACE_FEATURE_LIPS,
  FACE_FEATURE_NOSE,
  FACE_FEATURE_RIGHT_EYE,
  FACE_FEATURE_RIGHT_EYEBROW,
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
import { FaceFeature } from '@/enums/faceFeature';

export class FaceMeshEditor extends PointMoveEditor {
  private readonly editorConfigStore = useFaceMeshConfig();

  constructor() {
    super(AnnotationTool.FaceMesh);
    this.editorConfigStore.$subscribe(() => {
      Editor.draw();
    });

    Editor.add(this);
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

  toggleFeature(feature: FaceFeature) {
    console.log('Mesh: ', feature);
    const selectedHistory = this.tools.getSelectedHistory();
    if (!selectedHistory) {
      throw new Error('Failed to get histories on feature deletion.');
    }
    const graph = selectedHistory.get(this.tool);
    console.log('Mesh: ', graph);
    if (!graph) return;
    switch (feature) {
      case FaceFeature.Left_Eye:
        graph.togglePoints(FACE_FEATURE_LEFT_EYE);
        break;
      case FaceFeature.Left_Eyebrow:
        graph.togglePoints(FACE_FEATURE_LEFT_EYEBROW);
        break;
      case FaceFeature.Right_Eye:
        graph.togglePoints(FACE_FEATURE_RIGHT_EYE);
        break;
      case FaceFeature.Right_Eyebrow:
        graph.togglePoints(FACE_FEATURE_RIGHT_EYEBROW);
        break;
      case FaceFeature.Nose:
        graph.togglePoints(FACE_FEATURE_NOSE);
        break;
      case FaceFeature.Mouth:
        graph.togglePoints(FACE_FEATURE_LIPS);
        break;
      default:
        throw new Error('No feature "' + feature + '" found to delete!');
    }
    selectedHistory.add(graph, this.tool);
  }
}
