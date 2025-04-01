import { Editor } from '@/Editors/Editor';
import { AnnotationTool } from '@/enums/annotationTool';
import { usePoseConfig } from '@/stores/ToolSpecific/poseConfig';
import { PointMoveEditor } from '@/Editors/PointMoveEditor';
import { BodyFeature } from '@/enums/bodyFeature';
import {
  COLOR_EDGES_LEFT_EYE,
  COLOR_EDGES_POSE,
  COLOR_EDGES_RIGHT_EYE
} from '@/Editors/EditorConstants';
import { Connection } from '@/graph/face_landmarks_features.ts';

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
    if (this.graph.points.length === 0) return;

    this.drawFaceTrait(LEFT_SIDE, COLOR_EDGES_LEFT_EYE);
    this.drawFaceTrait(RIGHT_SIDE, COLOR_EDGES_RIGHT_EYE);
    this.drawFaceTrait(BOTH_SIDES, COLOR_EDGES_POSE);

    this.handleHandConnection();
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

  private handleHandConnection() {
    // check if hand is used
    if (!this.tools.tools.has(AnnotationTool.Hand)) return;

    // get connection points
    const left_pose_wrist = this.graph.getById(15);
    if (!left_pose_wrist) return;
    const right_pose_wrist = this.graph.getById(16);
    if (!right_pose_wrist) return;

    const left_elbow = this.graph.getById(13);
    if (!left_elbow) return;
    const right_elbow = this.graph.getById(14);
    if (!right_elbow) return;

    const left_hand_wrist = this.tools.histories.selectedHistory
      ?.get(AnnotationTool.Hand)
      ?.getById(0);
    if (!left_hand_wrist) return;
    const right_hand_wrist = this.tools.histories.selectedHistory
      ?.get(AnnotationTool.Hand)
      ?.getById(21);
    if (!right_hand_wrist) return;

    // draw connection
    this.drawEdges(COLOR_EDGES_LEFT_EYE, [{ start: left_elbow, end: left_hand_wrist }]);
    this.drawEdges(COLOR_EDGES_RIGHT_EYE, [{ start: right_elbow, end: right_hand_wrist }]);

    // update internal point
    left_pose_wrist.moveTo(left_hand_wrist);
    right_pose_wrist.moveTo(right_hand_wrist);
  }
}

export const POSE_FEATURE_LEFT_EYE = [1, 2, 3, 7];
export const POSE_FEATURE_RIGHT_EYE = [4, 5, 6, 8];
export const POSE_FEATURE_NOSE = [0];
export const POSE_FEATURE_MOUTH = [9, 10];
export const POSE_FEATURE_LEFT_HAND = [15, 17, 19, 21];
export const POSE_FEATURE_RIGHT_HAND = [16, 18, 20, 22];

const LEFT_SIDE: Connection[] = [
  // Face connections
  new Connection(0, 1),
  new Connection(1, 2),
  new Connection(2, 3),
  new Connection(3, 7),
  // Arm Connections
  new Connection(11, 13),
  new Connection(13, 15),
  new Connection(15, 17),
  new Connection(15, 21),
  new Connection(15, 19),
  new Connection(17, 19),
  new Connection(11, 23),
  // Leg Connections
  new Connection(23, 25),
  new Connection(25, 27),
  new Connection(27, 29),
  new Connection(29, 31),
  new Connection(27, 31)
];

const RIGHT_SIDE: Connection[] = [
  // Face connections
  new Connection(0, 4),
  new Connection(4, 5),
  new Connection(5, 6),
  new Connection(6, 8),
  // Arm Connections
  new Connection(12, 14),
  new Connection(14, 16),
  new Connection(16, 18),
  new Connection(16, 22),
  new Connection(16, 20),
  new Connection(18, 20),
  // Leg Connections
  new Connection(12, 24),
  new Connection(24, 26),
  new Connection(26, 28),
  new Connection(28, 30),
  new Connection(30, 32),
  new Connection(28, 32)
];
const BOTH_SIDES: Connection[] = [
  new Connection(11, 12),
  new Connection(23, 24),
  new Connection(9, 10)
];
