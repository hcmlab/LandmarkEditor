import { HandLandmarker } from '@mediapipe/tasks-vision';
import { PointMoveEditor, type PointPairs } from '@/Editors/PointMoveEditor';
import { AnnotationTool } from '@/enums/annotationTool';
import { Editor } from '@/Editors/Editor';
import { useHandConfig } from '@/stores/ToolSpecific/handConfig';
import type { Point2D } from '@/graph/point2d';

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

    const pointPairs = HandLandmarker.HAND_CONNECTIONS.map((connection) => {
      return {
        start: this.graph.getById(connection.start),
        end: this.graph.getById(connection.end)
      } as PointPairs<Point2D>;
    });

    this.drawEdges('00FF00', pointPairs);
  }

  getDragDepth(): number {
    return 0;
  }

  get tool(): AnnotationTool {
    return AnnotationTool.Hand;
  }
}
