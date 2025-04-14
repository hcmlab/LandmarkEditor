import { AnnotationTool } from '@/enums/annotationTool';
import { usePoseConfig } from '@/stores/ToolSpecific/poseConfig';
import { PointMoveEditor } from '@/Editors/PointMoveEditor';
import {
  COLOR_EDGES_LEFT_EYE,
  COLOR_EDGES_POSE,
  COLOR_EDGES_RIGHT_EYE
} from '@/Editors/EditorConstants';
import { BOTH_SIDES, LEFT_SIDE, RIGHT_SIDE } from '@/model/mediapipePose.ts';
import { HAND_WRIST_LEFT, HAND_WRIST_RIGHT } from '@/Editors/HandEditor.ts';

export class PoseEditor extends PointMoveEditor {
  constructor() {
    super(AnnotationTool.Pose, usePoseConfig());
  }

  draw(): void {
    if (this.graph.points.length === 0) return;

    this.drawFaceTrait(LEFT_SIDE, COLOR_EDGES_LEFT_EYE);
    this.drawFaceTrait(RIGHT_SIDE, COLOR_EDGES_RIGHT_EYE);
    this.drawFaceTrait(BOTH_SIDES, COLOR_EDGES_POSE);

    this.handleHandConnection();
  }

  private handleHandConnection() {
    // check if hand is used
    if (!this.toolStore.tools.has(AnnotationTool.Hand)) return;

    // get connection points
    const left_pose_wrist = this.graph.getById(15);
    if (!left_pose_wrist) return;
    const right_pose_wrist = this.graph.getById(16);
    if (!right_pose_wrist) return;

    const left_elbow = this.graph.getById(13);
    if (!left_elbow) return;
    const right_elbow = this.graph.getById(14);
    if (!right_elbow) return;

    const left_hand_wrist = this.toolStore.histories.selectedHistory
      ?.get(AnnotationTool.Hand)
      ?.getById(HAND_WRIST_LEFT);
    if (!left_hand_wrist) return;
    const right_hand_wrist = this.toolStore.histories.selectedHistory
      ?.get(AnnotationTool.Hand)
      ?.getById(HAND_WRIST_RIGHT);
    if (!right_hand_wrist) return;

    // update internal point
    left_pose_wrist.moveTo(left_hand_wrist);
    right_pose_wrist.moveTo(right_hand_wrist);

    // draw connection
    this.drawEdges(COLOR_EDGES_LEFT_EYE, [{ start: left_elbow, end: left_hand_wrist }]);
    this.drawEdges(COLOR_EDGES_RIGHT_EYE, [{ start: right_elbow, end: right_hand_wrist }]);
  }
}
