import { PoseLandmarker } from '@mediapipe/tasks-vision';
import { Editor } from '@/Editors/Editor';
import { AnnotationTool } from '@/enums/annotationTool';
import { type Point2D } from '@/graph/point2d';
import { usePoseConfig } from '@/stores/ToolSpecific/poseConfig';
import { PointMoveEditor, type PointPairs } from '@/Editors/PointMoveEditor';

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

  get tool(): AnnotationTool {
    return AnnotationTool.Pose;
  }

  getDragDepth(): number {
    return 0;
  }
}

export const POSE_FEATURE_LEFT_EYE = [4, 5, 6, 8];
export const POSE_FEATURE_RIGHT_EYE = [1, 2, 3, 7];
export const POSE_FEATURE_NOSE = [0];
export const POSE_FEATURE_MOUTH = [9, 10];
