import { HandLandmarker } from '@mediapipe/tasks-vision';
import { PointMoveEditor, type PointPairs } from '@/Editors/PointMoveEditor';
import { AnnotationTool } from '@/enums/annotationTool';
import { useHandConfig } from '@/stores/ToolSpecific/handConfig';
import { type Point2D } from '@/graph/point2d';

export class HandEditor extends PointMoveEditor {
  constructor() {
    super(AnnotationTool.Hand, useHandConfig());
  }

  draw(): void {
    if (this.graph.points.length === 0) return;
    let pointPairs = HandLandmarker.HAND_CONNECTIONS.map((connection) => {
      return {
        start: this.graph.getById(connection.start),
        end: this.graph.getById(connection.end)
      } as PointPairs<Point2D>;
    });

    if (this.graph.points.length > SINGLE_HAND_POINT_COUNT) {
      pointPairs = pointPairs.concat(
        HandLandmarker.HAND_CONNECTIONS.map((connection) => {
          return {
            start: this.graph.getById(connection.start + SINGLE_HAND_POINT_COUNT),
            end: this.graph.getById(connection.end + SINGLE_HAND_POINT_COUNT)
          } as PointPairs<Point2D>;
        })
      );
    }

    this.drawEdges('#ff00ff', pointPairs);
  }
}

const SINGLE_HAND_POINT_COUNT = 21;
export const HAND_WRIST_LEFT = 0;
export const HAND_WRIST_RIGHT = 21;
