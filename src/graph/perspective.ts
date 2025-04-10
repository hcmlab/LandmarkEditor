import { Point2D } from './point2d';
import { Point3D } from '@/graph/point3d';

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

  /**
   * Ensures the points of the triangle are ordered by z-Coordinate.
   * @param points - Points of the triangle.
   * @returns An array of points ordered consistently.
   */
  static orderTrianglePoints(points: [Point3D, Point3D, Point3D]): [Point3D, Point3D, Point3D] {
    return points.sort((a, b) => b.z - a.z);
  }

  /**
   * Calculate the normal vector of a triangle formed by three points.
   * @param points - Points of the triangle.
   * @param viewingDirection - the direction the human in the image is looking at.
   * @returns The normal vector of the triangle.
   */
  public static calculateNormal(
    points: [Point3D, Point3D, Point3D],
    viewingDirection: Point3D
  ): Point3D {
    const [p1, p2, p3] = Perspective.orderTrianglePoints(points);

    // Calculate vectors from p1 to p2 and p1 to p3
    const u = new Point3D(-1, p2.x - p1.x, p2.y - p1.y, p2.z - p1.z, []);
    const v = new Point3D(-1, p3.x - p1.x, p3.y - p1.y, p3.z - p1.z, []);

    // Calculate the normal vector using the cross product
    const normal = new Point3D(
      -1,
      u.y * v.z - u.z * v.y,
      u.z * v.x - u.x * v.z,
      u.x * v.y - u.y * v.x,
      []
    );

    // Normalize the normal vector
    const len: number = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    normal.x = normal.x / len;
    normal.y = normal.y / len;
    normal.z = normal.z / len;

    // Ensure the normal points away from the viewing direction
    const dotProduct =
      normal.x * viewingDirection.x + normal.y * viewingDirection.y + normal.z * viewingDirection.z;
    if (dotProduct < 0) {
      normal.x = -normal.x;
      normal.y = -normal.y;
      normal.z = -normal.z;
    }

    return normal;
  }

  /**
   * Determine if a point is visible based on the normal vector and view direction.
   * @param normal - The normal vector of the face.
   * @param viewDirection - The view direction (camera direction).
   * @returns True if the point is hidden, false otherwise.
   */
  public static isVisible(normal: Point3D, viewDirection: Point3D): boolean {
    const dotProduct =
      normal.x * viewDirection.x + normal.y * viewDirection.y + normal.z * viewDirection.z;
    return dotProduct > 0;
  }
}
