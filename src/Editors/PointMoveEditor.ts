import { watch } from 'vue';
import type { CanvasGradient, CanvasPattern } from 'canvas';
import type { Store } from 'pinia';
import { Editor } from '@/Editors/Editor';
import { Perspective2D } from '@/graph/perspective2d';
import { Point2D } from '@/graph/point2d';
import { Graph } from '@/graph/graph';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';
import {
  COLOR_POINT_DEFAULT,
  COLOR_POINT_HOVERED,
  COLOR_POINT_SELECTED,
  LINE_WIDTH_DEFAULT,
  POINT_EXTENDED_WIDTH,
  POINT_WIDTH
} from '@/Editors/EditorConstants';
import { type AnnotationTool } from '@/enums/annotationTool';
import { allBodyFeatures, type BodyFeature } from '@/enums/bodyFeature';
import { usePointMoveConfig } from '@/stores/ToolSpecific/pointMoveConfig';
import { Connection } from '@/graph/face_landmarks_features.ts';

export interface PointPairs<T extends Point2D> {
  start: T;
  end: T;
}

export abstract class PointMoveEditor extends Editor {
  protected readonly toolStore = useAnnotationToolStore();
  protected config = usePointMoveConfig();
  private oldDeletedFeatures = new Set<BodyFeature>();

  protected constructor(childTool: AnnotationTool, childConfig: Store) {
    super(childTool);
    /** Check for updates on the selected history. */
    watch(
      () => this.toolStore.histories.selectedHistory?.get(this.tool),
      () => {
        this.loadLatestAnnotation();
      },
      {
        deep: true
      }
    );

    /** Check for updates on the selected tool(s). */
    watch(
      () => this.toolStore.tools,
      () => this.loadLatestAnnotation(),
      {
        deep: true
      }
    );

    /** Check for updates on deleted features. */
    watch(
      () => this.toolStore.selectedHistory?.deletedFeatures,
      (value) => {
        const added = allBodyFeatures.filter(
          (feature) => value?.has(feature) && !this.oldDeletedFeatures.has(feature)
        );
        const removed = allBodyFeatures.filter(
          (feature) => !value?.has(feature) && this.oldDeletedFeatures.has(feature)
        );
        added.forEach((feature) => {
          this.toggleFeature(feature, true);
        });
        removed.forEach((feature) => {
          this.toggleFeature(feature, false);
        });
        this.oldDeletedFeatures = new Set<BodyFeature>([...value]);
      },
      {
        deep: true
      }
    );

    childConfig.$subscribe(() => {
      Editor.draw();
    });
  }

  private _graph: Graph<Point2D> = new Graph<Point2D>([]);

  protected get graph(): Graph<Point2D> {
    return this._graph;
  }

  protected set graph(value: Graph<Point2D> | undefined) {
    if (value) {
      this._graph = value.clone();
    } else {
      this._graph = new Graph<Point2D>([]);
    }
  }

  toggleFeature(feature: BodyFeature, deleted: boolean): void {
    const selectedHistory = this.toolStore.selectedHistory;
    if (!selectedHistory) {
      throw new Error('Failed to get histories on feature deletion.');
    }
    const graph = selectedHistory.get(this.tool);
    if (!graph) return;
    const model = this.toolStore.getModel(this.tool);
    if (!model) {
      throw new Error('Failed to get model on feature deletion.');
    }
    const points = model.pointIdsFromFeature(feature);
    if (points.length === 0) return; // nothing to hide
    graph.togglePoints(points, deleted);
    selectedHistory.add(graph, this.tool);
  }

  onMove(relativeMouseX: number, relativeMouseY: number): void {
    // Update normalized coordinates based on mouse position
    const alreadyUpdated = new Set();
    const relativeMouseNormalized = Perspective2D.unproject(
      Editor.image,
      new Point2D(-1, relativeMouseX, relativeMouseY, [])
    );
    const selectedPoint = this.graph.getSelected();
    let neighbourPoints = [selectedPoint];
    if (!selectedPoint) {
      return;
    }
    const deltaX = relativeMouseNormalized.x - selectedPoint.x;
    const deltaY = relativeMouseNormalized.y - selectedPoint.y;
    // eslint-disable-next-line no-loops/no-loops
    for (let depth = 0; depth <= this.config.dragDepth; depth++) {
      // Go through each depth step
      let tmpPoints: Point2D[] = [];
      neighbourPoints.forEach((neighbour) => {
        if (!neighbour) {
          return;
        }
        const influenceFactor = Math.exp(-depth);
        const newX = neighbour.x + deltaX * influenceFactor;
        const newY = neighbour.y + deltaY * influenceFactor;
        const newPoint = new Point2D(-1, newX, newY, []);
        neighbour.moveTo(newPoint);
        alreadyUpdated.add(neighbour.id);
        // extract next depth of neighbours
        const neighbors = this.graph.getNeighbourPointsOf(neighbour);
        if (neighbors) {
          tmpPoints = tmpPoints.concat(
            neighbors.filter((point): point is Point2D => point !== undefined)
          );
        }
      });
      neighbourPoints = tmpPoints.filter((p) => !alreadyUpdated.has(p.id));
    }
  }

  onPan(_: number, __: number): void {
    // Nothing to do here, everything is handled by containing component
  }

  onMouseDown(event: MouseEvent): void {
    // Check if any normalized 3D point is clicked
    if (event.button === 0) {
      // left button
      this._graph.points
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
    let pointHover = false;
    const relativeMouse = Perspective2D.unproject(
      Editor.image,
      new Point2D(-1, relativeMouseX, relativeMouseY, [])
    );
    this._graph.points.forEach((point) => {
      if (
        !pointHover &&
        Perspective2D.intersects(
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
    if (pointHover) {
      Editor.draw();
    }
  }

  onMouseUp(_: MouseEvent) {
    this._graph.points.forEach((point) => (point.selected = false));
  }

  onBackgroundLoaded() {
    this.loadLatestAnnotation();
  }

  onPointsEdited() {
    const selected_history = this.toolStore.selectedHistory;
    if (!selected_history) {
      throw new Error('Could not retrieve selected history');
    }
    selected_history.add(this.graph, this.tool);
  }

  protected drawPoint(point: Point2D): void {
    if (point && !point.deleted) {
      const projectedPoint = Perspective2D.project(Editor.image, point);

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
      // Draws the ID of the point next to it. Useful for debugging
      // Editor.ctx.font = 20 / Editor.zoomScale + 'px serif';
      // Editor.ctx.fillText(String(point.id), projectedPoint.x, projectedPoint.y);
      Editor.ctx.fill();
    }
  }

  protected drawFaceTrait(
    connections: Connection[],
    color: string | CanvasGradient | CanvasPattern
  ): void {
    if (!this.graph) return;
    const overwrittenPoints = this.getOverwrittenPoints();
    const pointPairs: PointPairs<Point2D>[] = connections
      .filter(
        (connection) =>
          !overwrittenPoints.includes(connection.start) &&
          !overwrittenPoints.includes(connection.end)
      )
      .map((connection) => {
        return {
          start: this.graph.getById(connection.start),
          end: this.graph.getById(connection.end)
        } as PointPairs<Point2D>;
      });

    this.drawEdges(color, pointPairs);
  }

  /** Draws all edges and points of the given point pairs */
  protected drawEdges(
    color: string | CanvasGradient | CanvasPattern,
    pointPairs: PointPairs<Point2D>[]
  ): void {
    // Draw edges
    Editor.ctx.beginPath();
    Editor.ctx.strokeStyle = color;
    Editor.ctx.lineWidth = LINE_WIDTH_DEFAULT / Editor.zoomScale;
    pointPairs.forEach((connection) => {
      let startPoint = connection.start;
      let endPoint = connection.end;
      if (startPoint && endPoint && !startPoint.deleted && !endPoint.deleted) {
        startPoint = Perspective2D.project(Editor.image, startPoint);
        endPoint = Perspective2D.project(Editor.image, endPoint);
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

  protected getOverwrittenPoints(): number[] {
    const h = this.toolStore.selectedHistory;
    if (!h) {
      return [];
    }

    let res: number[] = [];
    const ownModel = this.toolStore.getModel(this.tool);
    if (!ownModel) {
      throw new Error('Could not find model when drawing for model!');
    }
    this.toolStore.tools.forEach((tool) => {
      if (tool === this.tool) return;
      // Skip tool if the tool has no points
      if (!h.get(tool) || h.get(tool)?.points.length === 0) {
        return;
      }
      const model = this.toolStore.getModel(tool);
      if (!model) {
        throw new Error('Could not find model when drawing for model!');
      }
      model.precedenceFeatures.forEach((feature: BodyFeature) => {
        res = res.concat(ownModel.pointIdsFromFeature(feature));
      });
    });

    return res;
  }

  private loadLatestAnnotation() {
    const selectedHistory = this.toolStore.selectedHistory;
    if (!selectedHistory) return; // there is no error here. Just nothing to render.
    this.graph = undefined;
    this.graph = selectedHistory.get(this.tool)?.clone();

    // If you check the git history for this line you see that there was a check, if the amount of points was 0.
    // This was wrong, since the empty graph means no features were detected.
    if (!this.graph) return;

    Editor.draw();
  }
}
