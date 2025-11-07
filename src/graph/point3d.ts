import { Point2D } from './point2d';

import type { PointData } from '@/graph/serialisedData.ts';

/**
 * Represents a 3D point with an ID, coordinates, and neighbor information.
 * Extends the base class Point2D.
 */
export class Point3D extends Point2D {
  /**
   * Creates a new Point3D instance.
   * @param {number} id - The unique identifier for the point.
   * @param {number} x - The x-coordinate of the point.
   * @param {number} y - The y-coordinate of the point.
   * @param {number} z - The z-coordinate of the point (additional dimension).
   * @param {number[]} neighbourIds - An array of neighbor IDs.
   */
  constructor(id: number, x: number, y: number, z: number, neighbourIds: number[]) {
    super(id, x, y, neighbourIds);
    this._z = z;
  }

  private _z: number;

  /**
   * Gets or sets the z-coordinate of the point.
   * @returns {number} - The z-coordinate.
   */
  get z(): number {
    return this._z;
  }

  set z(value: number) {
    this._z = value;
  }

  /**
   * Returns a string representation of the 3D point.
   * @returns - A formatted string with point details.
   */
  toString() {
    return `Point3D(id=${this.id}, x=${this.x}, y=${this.y}, z=${this.z})`;
  }

  /**
   * Creates a shallow copy of the 3D point.
   * @returns - A new Point3D instance with cloned properties.
   */
  clone() {
    const copy = new Point3D(this.id, this.x, this.y, this.z, this.getNeighbourIds());
    copy.hovered = this.hovered;
    copy.deleted = this.deleted;
    copy.selected = this.selected;
    return copy;
  }

  /**
   * Converts the point to a dictionary object.
   * @returns - A dictionary containing point properties.
   */
  toDict(): PointData {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      z: this.z,
      deleted: this.deleted
    };
  }
}
