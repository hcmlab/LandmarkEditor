import { Point2D } from './point2d';

export interface ImageDimension {
  width: number;
  height: number;
}

/**
 * Represents a utility class for 2D perspective transformations.
 */
export class Perspective {
  /**
   * Projects a point from normalized coordinates to display coordinates.
   * @param {HTMLImageElement} image - The image on which the point is defined.
   * @param {P} point - The normalized point.
   * @returns {P} - The projected point in display coordinates.
   */
  static project<P extends Point2D>(image: HTMLImageElement, point: P): P {
    return this.relativeToAbsolute({ width: image.width, height: image.height }, point);
  }

  /**
   * Calculates the Euclidean distance between two points in display coordinates.
   * @param {HTMLImageElement} image - The image on which the points are defined.
   * @param {P} pointFrom - The starting point.
   * @param {P} pointTo - The ending point.
   * @returns {number} - The distance between the two points.
   */
  static distanceTo<P extends Point2D>(image: HTMLImageElement, pointFrom: P, pointTo: P): number {
    const projectPointFrom = Perspective.project(image, pointFrom);
    const projectPointTo = Perspective.project(image, pointTo);
    return Math.sqrt(
      Math.pow(projectPointFrom.x - projectPointTo.x, 2) +
        Math.pow(projectPointFrom.y - projectPointTo.y, 2)
    );
  }

  /**
   * Checks if two points intersect within a specified delta distance.
   * @param {HTMLImageElement} image - The image on which the points are defined.
   * @param {P} point - The first point.
   * @param {P} pointCheck - The second point to check against.
   * @param {number} delta - The maximum allowed distance for intersection.
   * @returns {boolean} - True if the points intersect within the specified delta, false otherwise.
   */
  static intersects<P extends Point2D>(
    image: HTMLImageElement,
    point: P,
    pointCheck: P,
    delta: number
  ): boolean {
    return this.distanceTo(image, point, pointCheck) <= delta;
  }

  /**
   * Unprojects a point from display coordinates to normalized coordinates.
   * @param {HTMLImageElement} image - The image on which the point is defined.
   * @param {P} point - The point in display coordinates.
   * @returns {P} - The corresponding point in normalized coordinates.
   */
  static unproject<P extends Point2D>(image: HTMLImageElement, point: P): P {
    return this.absoluteToRelative({ width: image.width, height: image.height }, point);
  }

  /**
   * Converts a point from relative coordinates to absolute coordinates.
   * @param image_dim - An object containing the width and height of the image.
   * @param point - The point in relative coordinates.
   * @returns - The point in absolute coordinates.
   */
  static relativeToAbsolute<P extends Point2D>(image_dim: ImageDimension, point: P): P {
    const copy = point.clone();
    const absolute = new Point2D(
      point.id,
      point.x * image_dim.width,
      point.y * image_dim.height,
      []
    );
    copy.moveTo(absolute);
    return copy as P;
  }

  /**
   * Converts a point from absolute coordinates to relative coordinates.
   * @param image_dim - An object containing the width and height of the image.
   * @param point - The point in absolute coordinates.
   * @returns - The point in relative coordinates.
   */
  static absoluteToRelative<P extends Point2D>(image_dim: ImageDimension, point: P): P {
    const copy = point.clone();
    const relative = new Point2D(
      point.id,
      point.x / image_dim.width,
      point.y / image_dim.height,
      []
    );
    copy.moveTo(relative);
    return copy as P;
  }
}
