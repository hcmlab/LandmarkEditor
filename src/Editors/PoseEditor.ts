import { PoseLandmarker } from '@mediapipe/tasks-vision';
import { Editor } from '@/Editors/Editor';
import { AnnotationTool } from '@/enums/annotationTool';
import { type Point2D } from '@/graph/point2d';
import { usePoseConfig } from '@/stores/ToolSpecific/poseConfig';
import { PointMoveEditor, type PointPairs } from '@/Editors/PointMoveEditor';
import { FaceFeature } from '@/enums/faceFeature';

export class PoseEditor extends PointMoveEditor {
  private readonly editorConfigStore = usePoseConfig();
  constructor() {
    super(AnnotationTool.Pose);

    this.editorConfigStore.$subscribe(() => {
      Editor.draw();
    });

    Editor.add(this);
  }

  draw(): void {
    this.graph.points.forEach((point: Point2D) => {
      this.drawPoint(point);
    });

    const pointPairs = PoseLandmarker.POSE_CONNECTIONS.map((connection) => {
      return {
        start: this.graph.getById(connection.start),
        end: this.graph.getById(connection.end)
      } as PointPairs<Point2D>;
    });

    this.drawEdges('ff0000', pointPairs);
  }

  toggleFeature(feature: FaceFeature) {
    console.log('Pose: ', feature);
    const selectedHistory = this.tools.getSelectedHistory();
    if (!selectedHistory) {
      throw new Error('Failed to get histories on feature deletion.');
    }
    const graph = selectedHistory.get(this.tool);
    console.log('Pose: ', graph);
    if (!graph) return;
    switch (feature) {
      case FaceFeature.Left_Eye:
        graph.togglePoints(POSE_FEATURE_LEFT_EYE);
        break;
      case FaceFeature.Right_Eye:
        graph.togglePoints(POSE_FEATURE_RIGHT_EYE);
        break;
      case FaceFeature.Nose:
        graph.togglePoints(POSE_FEATURE_NOSE);
        break;
      case FaceFeature.Mouth:
        graph.togglePoints(POSE_FEATURE_MOUTH);
        break;
      default:
        break;
    }
    selectedHistory.add(graph, this.tool);
  }
}

export const POSE_FEATURE_LEFT_EYE = [1, 2, 3, 7];
export const POSE_FEATURE_RIGHT_EYE = [4, 5, 6, 8];
export const POSE_FEATURE_NOSE = [0];
export const POSE_FEATURE_MOUTH = [9, 10];
