import { FaceLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { Point2D } from './point2d';
import type { ModelApi } from '@/model/modelApi';
import { findNeighbourPointIds } from '@/graph/face_landmarks_features';
import type { PointData } from '@/cache/fileAnnotationHistory';
import { Point3D } from '@/graph/point3d';

import type { MultipleViewImage } from '@/interface/multiple_view_image';

/**
 * Represents a graph of points in a 2D space.
 * @template P - Type of the points (must extend Point2D).
 */
export class Graph<P extends Point2D> {
  static readonly MAX_ID = 478;

  private readonly _points: P[];

  /**
   * Creates a new Graph instance with the given points.
   * @param {P[]} points - An array of points.
   */
  constructor(points: P[]) {
    this._points = points;
  }

  /**
   * Gets the array of points in the graph.
   */
  get points(): P[] {
    return this._points;
  }

  /**
   * Creates a Graph instance from a JSON object. Expects to be verified
   * @param jsonObject - An array of point objects in JSON format.
   * @param newObject - A function to create a new point object. Should call the new constructor and load the id.
   * @returns - A new Graph instance.
   */
  static fromJson<P extends Point2D>(
    jsonObject: PointData[],
    newObject: (id: number, neighbors: number[]) => P
  ): Graph<P> {
    return new Graph<P>(
      jsonObject.map((dict) => {
        const point = newObject(
          dict.id,
          findNeighbourPointIds(dict.id, FaceLandmarker.FACE_LANDMARKS_TESSELATION, 1)
        );
        // Manually assign properties from dict to point
        Object.keys(dict).forEach((key) => {
          if (key !== 'id') {
            (point as unknown as Record<string, unknown>)[key] = dict[key as keyof PointData];
          }
        });
        return point;
      })
    );
  }

  static fromMesh<P extends Point2D>(mesh: NormalizedLandmark[]): Graph<P> {
    const points: P[] = mesh
      .map((dict, idx) => {
        const ids = Array.from(
          findNeighbourPointIds(idx, FaceLandmarker.FACE_LANDMARKS_TESSELATION, 1)
        );
        return new Point3D(idx, dict.x, dict.y, dict.z, ids);
      })
      .map((point) => point as unknown as P)
      // filter out the iris markings
      .filter((point) => {
        return ![
          ...FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS.map((con) => con.start),
          ...FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS.map((con) => con.start)
        ].includes(point.id);
      });
    return new Graph<P>(points);
  }

  static detect<P extends Point2D>(api: ModelApi<P>, file: MultipleViewImage) {
    return api.detect(file);
  }

  /**
   * marks all listed points as deleted from graph
   * @param pointIds points to delete
   * @private
   */
  deletePoints(pointIds: number[]): void {
    this.points.forEach((point) => {
      if (pointIds.includes(point.id)) {
        point.deleted = true;
      }
    });
  }

  /**
   * Retrieves a point from the graph by its ID.
   * @param {number} id - The ID of the point.
   * @returns {P} - The point with the specified ID.
   */
  getById(id: number): P | undefined {
    return this.points.find((p: P) => p.id === id);
  }

  /**
   * Retrieves the neighboring points of a given point.
   * @param {P} point - The point for which neighbors are requested.
   * @returns {P[]} - An array of neighboring points.
   */
  getNeighbourPointsOf(point: P): (P | undefined)[] {
    return point.getNeighbourIds().map((id) => this.getById(id));
  }

  /**
   * Gets the selected point (if any) from the graph.
   * @returns {P | undefined} - The selected point or undefined if none is selected.
   */
  getSelected(): P | undefined {
    return this.points.find((p) => p.selected && p.hovered);
  }

  /**
   * Creates a shallow copy of the graph.
   * @returns - A new Graph instance with cloned points.
   */
  clone(): Graph<P> {
    // @ts-expect-error: converting Points to abstract class
    return new Graph<P>(this.points.map((p) => p.clone()));
  }

  /**
   * Converts the graph to an array of dictionaries.
   * @returns - An array of dictionaries representing the points.
   */
  toDictArray(): PointData[] {
    return this.points.map((point) => point.toDict());
  }
}
