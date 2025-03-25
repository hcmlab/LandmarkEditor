import { PoseLandmarker } from '@mediapipe/tasks-vision';
import { Editor } from '@/Editors/Editor';
import { AnnotationTool } from '@/enums/annotationTool';
import { type Point2D } from '@/graph/point2d';
import { usePoseConfig } from '@/stores/ToolSpecific/poseConfig';
import { PointMoveEditor, type PointPairs } from '@/Editors/PointMoveEditor';
import { BodyFeature } from '@/enums/bodyFeature';
import { COLOR_EDGES_POSE } from '@/Editors/EditorConstants';

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
    const hiddenPoints = this.getOverwrittenPoints();
    this.graph.points.forEach((point: Point2D) => {
      if (hiddenPoints.includes(point.id)) return;
      this.drawPoint(point);
    });

    const pointPairs = PoseLandmarker.POSE_CONNECTIONS.filter((value) => {
      return !hiddenPoints.includes(value.start) && !hiddenPoints.includes(value.end);
    }).map((connection) => {
      return {
        start: this.graph.getById(connection.start),
        end: this.graph.getById(connection.end)
      } as PointPairs<Point2D>;
    });

    this.drawEdges(COLOR_EDGES_POSE, pointPairs);
  }

  protected pointIdsFromFeature(feature: BodyFeature): number[] {
    switch (feature) {
      case BodyFeature.Left_Eye:
        return POSE_FEATURE_LEFT_EYE;
      case BodyFeature.Right_Eye:
        return POSE_FEATURE_RIGHT_EYE;
      case BodyFeature.Nose:
        return POSE_FEATURE_NOSE;
      case BodyFeature.Mouth:
        return POSE_FEATURE_MOUTH;
      case BodyFeature.Left_Hand:
        return POSE_FEATURE_LEFT_HAND;
      case BodyFeature.Right_Hand:
        return POSE_FEATURE_RIGHT_HAND;
      case BodyFeature.Left_Eyebrow:
        return [];
      case BodyFeature.Right_Eyebrow:
        return [];
    }
  }
}

export const POSE_FEATURE_LEFT_EYE = [1, 2, 3, 7];
export const POSE_FEATURE_RIGHT_EYE = [4, 5, 6, 8];
export const POSE_FEATURE_NOSE = [0];
export const POSE_FEATURE_MOUTH = [9, 10];
export const POSE_FEATURE_LEFT_HAND = []; //[17, 19, 21];
export const POSE_FEATURE_RIGHT_HAND = []; //[18, 20, 22];
