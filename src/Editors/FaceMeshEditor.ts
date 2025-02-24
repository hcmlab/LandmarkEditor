import { FaceLandmarker } from '@mediapipe/tasks-vision';
import { type CanvasGradient, type CanvasPattern } from 'canvas';
import { Perspective } from '@/graph/perspective';
import {
  Connection,
  FACE_LANDMARKS_NOSE,
  UPDATED_LEFT_IRIS,
  UPDATED_RIGHT_IRIS
} from '@/graph/face_landmarks_features';
import { useFaceMeshConfig } from '@/stores/ToolSpecific/faceMeshConfig';
import { useAnnotationHistoryStore } from '@/stores/annotationHistoryStore';
import { Editor } from '@/Editors/Editor';
import { SaveStatus } from '@/enums/saveStatus';
import { AnnotationTool } from '@/enums/annotationTool';
import { Point3D } from '@/graph/point3d';
import { Point2D } from '@/graph/point2d';

const COLOR_POINT_HOVERED = 'rgba(255,250,163,0.6)';

const COLOR_POINT_SELECTED = 'rgba(255,250,58,0.6)';

const COLOR_POINT_DEFAULT = '#0d6efd';

const COLOR_EDGES_TESSELATION = '#d5d5d5';

const COLOR_EDGES_FACE_OVAL = '#42ffef';

const COLOR_EDGES_LIPS = '#ff0883';

const COLOR_EDGES_RIGHT_EYE = '#b3ff42';

const COLOR_EDGES_RIGHT_IRIS = '#efffd8';

const COLOR_EDGES_LEFT_EYE = '#42c6ff';

const COLOR_EDGES_LEFT_IRIS = '#b5ebff';

const COLOR_EDGES_NOSE = '#eada70';

const LINE_WIDTH_DEFAULT = 2;

const POINT_WIDTH = 3;

const POINT_EXTENDED_WIDTH = 5;

export class FaceMeshEditor extends Editor {
  private readonly editorConfigStore = useFaceMeshConfig();
  private readonly annotationHistoryStore = useAnnotationHistoryStore();

  constructor() {
    super();

    // Size canvas
    this.editorConfigStore.$subscribe(() => {
      // Manually redraw the canvas on config change
      Editor.draw();
    });
  }

  get tool(): AnnotationTool {
    return AnnotationTool.FaceMesh;
  }

  draw(): void {
    // Draw Mesh
    if (this.editorConfigStore.showTesselation) {
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

  onMove(relativeMouseX: number, relativeMouseY: number): void {
    // Update normalized coordinates based on mouse position
    const alreadyUpdated = new Set<number>();
    const relativeMouseNormalized = Perspective.unproject(
      Editor.image,
      new Point2D(-1, relativeMouseX, relativeMouseY, [])
    );
    const h = this.annotationHistoryStore.selected();
    if (!h) {
      console.error('No selected history present');
      return;
    }

    const graph = h.get();
    if (!graph) {
      console.error('No graph for selected history present');
      return;
    }

    const selectedPoint = graph.getSelected();
    if (!selectedPoint) {
      return;
    }

    let neighbourPoints = [selectedPoint];
    const deltaX = relativeMouseNormalized.x - selectedPoint.x;
    const deltaY = relativeMouseNormalized.y - selectedPoint.y;

    // early return if no movement
    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    const movements: Point3D[] = [];
    // eslint-disable-next-line no-loops/no-loops
    for (let depth = 0; depth <= this.editorConfigStore.dragDepth; depth++) {
      let tmpPoints: Point3D[] = [];
      neighbourPoints.forEach((neighbour) => {
        if (!neighbour) {
          return;
        }
        const influenceFactor = Math.exp(-depth);
        alreadyUpdated.add(neighbour.id);
        const move = new Point3D(
          neighbour.id,
          deltaX * influenceFactor,
          deltaY * influenceFactor,
          0,
          []
        );
        neighbour.add(move);
        movements.push(move);
        const neighbors = graph.getNeighbourPointsOf(neighbour);
        if (neighbors) {
          tmpPoints = tmpPoints.concat(
            neighbors.filter((point): point is Point3D => point !== undefined)
          );
        }
      });
      neighbourPoints = tmpPoints.filter((p) => !alreadyUpdated.has(p.id));
    }
    this.processMultipleViews(movements).then();
  }

  /**
   * Process the points to update in the other views. Will broadcast the changes to the other views.
   * @param pointsToUpdate the points to update in the other views.
   *  The coordinates contained here are the relative movement. Can contain the same point multiple times.
   */
  private async processMultipleViews(pointsToUpdate: Point3D[]) {
    const history = this.annotationHistoryStore.selected();
    if (!history) {
      console.error('No selected history present');
      return;
    }

    if (!history?.file) {
      console.error('No file selected for selected history');
      return;
    }

    history.updateOtherPerspectives(pointsToUpdate);
  }

  onPan(_: number, __: number): void {
    // Nothing to do here, everything is handled by containing component
  }

  onMouseDown(event: MouseEvent): void {
    const graph = this.annotationHistoryStore.selected()?.get();
    if (!graph) {
      return;
    }
    // Check if any normalized 3D point is clicked
    if (event.button === 0) {
      // left button
      graph.points
        .filter((p) => p.hovered && !p.deleted)
        .forEach((p) => {
          p.selected = true;
          Editor.isMoving = true;
        });
      if (!Editor.isMoving) {
        Editor.isPanning = true;
      }
    } else if (event.button === 1) {
      // wheel button
    } else if (event.button === 2) {
      // right click
    }
  }

  onMouseMove(_: MouseEvent, relativeMouseX: number, relativeMouseY: number): void {
    const graph = this.annotationHistoryStore.selected()?.get();
    if (!graph) {
      return;
    }
    let pointHover = false;
    const relativeMouse = Perspective.unproject(
      Editor.image,
      new Point2D(-1, relativeMouseX, relativeMouseY, [])
    );
    graph.points.forEach((point) => {
      if (
        !pointHover &&
        Perspective.intersects(
          Editor.image,
          point,
          relativeMouse,
          POINT_EXTENDED_WIDTH / Editor.zoomScale
        )
      ) {
        point.hovered = true;
        pointHover = true;
      } else {
        pointHover ||= point.hovered; // Also update if one point gets un-hovered!
        point.hovered = false;
      }
    });
  }

  onMouseUp(_: MouseEvent) {
    const graph = this.annotationHistoryStore.selected()?.get();
    if (!graph) {
      return;
    }
    graph.points.forEach((point) => (point.selected = false));
  }

  onBackgroundLoaded() {}

  onPointsEdited() {
    const history = this.annotationHistoryStore.selectedHistory;
    if (!history) {
      return;
    }
    const graph = history.get();
    if (!graph) {
      return;
    }
    history.add(graph);
    history.status = SaveStatus.edited;
  }

  private drawPoint(point: Point3D): void {
    if (point && !point.deleted) {
      const projectedPoint = Perspective.project(Editor.image, point);
      /* Debug helper
      Editor.ctx.font = 20 / Editor.zoomScale + 'px serif';
      Editor.ctx.fillText(String(point.id), projectedPoint.x, projectedPoint.y);
      */
      if (point.hovered || point.selected) {
        const color = point.hovered ? COLOR_POINT_HOVERED : COLOR_POINT_SELECTED;
        Editor.drawCircleAtPoint(
          Editor.ctx,
          color,
          projectedPoint.x,
          projectedPoint.y,
          POINT_EXTENDED_WIDTH / Editor.zoomScale
        );
      }

      Editor.ctx.beginPath();
      Editor.ctx.fillStyle = COLOR_POINT_DEFAULT;
      Editor.ctx.arc(
        projectedPoint.x,
        projectedPoint.y,
        POINT_WIDTH / Editor.zoomScale,
        0,
        Math.PI * 2
      );
      Editor.ctx.fill();
    }
  }

  private drawFaceTrait(
    connections: Connection[],
    color: string | CanvasGradient | CanvasPattern
  ): void {
    const h = this.annotationHistoryStore.selected();
    if (!h) return;
    const graph = h.get();
    if (!graph) return;

    const pointPairs = connections.map((connection) => {
      return {
        start: graph.getById(connection.start),
        end: graph.getById(connection.end)
      };
    });
    // Draw edges
    Editor.ctx.beginPath();
    Editor.ctx.strokeStyle = color;
    Editor.ctx.lineWidth = LINE_WIDTH_DEFAULT / Editor.zoomScale;
    pointPairs.forEach((connection) => {
      let startPoint = connection.start;
      let endPoint = connection.end;
      if (startPoint && endPoint && !startPoint.deleted && !endPoint.deleted) {
        startPoint = Perspective.project(Editor.image, startPoint);
        endPoint = Perspective.project(Editor.image, endPoint);
        Editor.ctx.moveTo(startPoint.x, startPoint.y);
        Editor.ctx.lineTo(endPoint.x, endPoint.y);
      }
    });
    Editor.ctx.stroke();
    // Draw points
    pointPairs.forEach((connection) => {
      const startPoint = connection.start;
      const endPoint = connection.end;
      if (!startPoint || !endPoint) return;
      this.drawPoint(startPoint);
      this.drawPoint(endPoint);
    });
  }
}
// TODO: when moving side images translate the coordinates to the image coordinate system with the matrix
// TODO: only render points which are in foreground
