import { HandLandmarker } from '@mediapipe/tasks-vision';
import { PointMoveEditor, type PointPairs } from '@/Editors/PointMoveEditor';
import { AnnotationTool } from '@/enums/annotationTool';
import { Editor } from '@/Editors/Editor';
import { useHandConfig } from '@/stores/ToolSpecific/handConfig';
import { type Point2D } from '@/graph/point2d';
import { type BodyFeature } from '@/enums/bodyFeature';

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
    this.graph.points.forEach((point: Point2D) => {
      this.drawPoint(point);
    });

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

  protected pointIdsFromFeature(_: BodyFeature): number[] {
    return [];
    // No feature to process
  }
}
