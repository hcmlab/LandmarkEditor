import { HandLandmarker } from '@mediapipe/tasks-vision';
import { PointMoveEditor, type PointPairs } from '@/Editors/PointMoveEditor';
import { AnnotationTool } from '@/enums/annotationTool';
import { Editor } from '@/Editors/Editor';
import { useHandConfig } from '@/stores/ToolSpecific/handConfig';
import { type Point2D } from '@/graph/point2d';
import { BodyFeature } from '@/enums/bodyFeature';

export class HandEditor extends PointMoveEditor {
  private readonly editorConfigStore = useHandConfig();

  constructor() {
    super(AnnotationTool.Hand);

    this.editorConfigStore.$subscribe(() => {
      Editor.draw();
    });
    Editor.add(this);
  }

  draw(): void {
    if (this.graph.points.length === 0) return;
    let pointPairs = HandLandmarker.HAND_CONNECTIONS.map((connection) => {
      return {
        start: this.graph.getById(connection.start),
        end: this.graph.getById(connection.end)
      } as PointPairs<Point2D>;
    });

    const single_hand_point_count = 21;

    if (this.graph.points.length > single_hand_point_count) {
      pointPairs = pointPairs.concat(
        HandLandmarker.HAND_CONNECTIONS.map((connection) => {
          return {
            start: this.graph.getById(connection.start + single_hand_point_count),
            end: this.graph.getById(connection.end + single_hand_point_count)
          } as PointPairs<Point2D>;
        })
      );
    }

    this.drawEdges('#ff00ff', pointPairs);
  }

  protected pointIdsFromFeature(feature: BodyFeature): number[] {
    switch (feature) {
      case BodyFeature.Left_Eye:
      case BodyFeature.Left_Eyebrow:
      case BodyFeature.Right_Eye:
      case BodyFeature.Right_Eyebrow:
      case BodyFeature.Nose:
      case BodyFeature.Mouth:
        return [];
      case BodyFeature.Left_Hand:
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      case BodyFeature.Right_Hand:
        return [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];
    }
  }
}

export const WRIST_LEFT = 0;
export const WRIST_RIGHT = 21;
