import { Point2D } from './point2d';

/**
 * Represents a utility class for 2D perspective transformations.
 */
export class Perspective2D {
  /**
   * Projects a point from normalized coordinates to display coordinates.
   * @param {HTMLImageElement} image - The image on which the point is defined.
   * @param {Point2D} point - The normalized point.
   * @returns {Point2D} - The projected point in display coordinates.
   */
  static project(image: HTMLImageElement, point: Point2D): Point2D {
    const copy = point.clone();
    copy.x = point.x * image.width;
    copy.y = point.y * image.height;
    return copy;
  }

  /**
   * Calculates the Euclidean distance between two points in display coordinates.
   * @param {HTMLImageElement} image - The image on which the points are defined.
   * @param {Point2D} pointFrom - The starting point.
   * @param {Point2D} pointTo - The ending point.
   * @returns {number} - The distance between the two points.
   */
  static distanceTo(image: HTMLImageElement, pointFrom: Point2D, pointTo: Point2D): number {
    const projectPointFrom = Perspective2D.project(image, pointFrom);
    const projectPointTo = Perspective2D.project(image, pointTo);
    return Math.sqrt(
      Math.pow(projectPointFrom.x - projectPointTo.x, 2) +
        Math.pow(projectPointFrom.y - projectPointTo.y, 2)
    );
  }

  /**
   * Checks if two points intersect within a specified delta distance.
   * @param {HTMLImageElement} image - The image on which the points are defined.
   * @param {Point2D} point - The first point.
   * @param {Point2D} pointCheck - The second point to check against.
   * @param {number} delta - The maximum allowed distance for intersection.
   * @returns {boolean} - True if the points intersect within the specified delta, false otherwise.
   */
  static intersects(
    image: HTMLImageElement,
    point: Point2D,
    pointCheck: Point2D,
    delta: number
  ): boolean {
    return this.distanceTo(image, point, pointCheck) <= delta;
  }

  /**
   * Unprojects a point from display coordinates to normalized coordinates.
   * @param {HTMLImageElement} image - The image on which the point is defined.
   * @param {Point2D} point - The point in display coordinates.
   * @returns {Point2D} - The corresponding point in normalized coordinates.
   */
  static unproject(image: HTMLImageElement, point: Point2D): Point2D {
    const copy = point.clone();
    copy.x = point.x / image.width;
    copy.y = point.y / image.height;
    return copy;
  }
}
