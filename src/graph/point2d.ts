/**
 * Represents a 2D point with an ID, coordinates, and neighbor information.
 */
export class Point2D {
  private readonly _id: number;
  private readonly neighbourIds: number[];

  /**
   * Creates a new Point2D instance.
   * @param {number} id - The unique identifier for the point.
   * @param {number} x - The x-coordinate of the point.
   * @param {number} y - The y-coordinate of the point.
   * @param {number[]} neighbourIds - An array of neighbor IDs.
   */
  constructor(id: number, x: number, y: number, neighbourIds: number[]) {
    this._id = id;
    this._x = x;
    this._y = y;
    this.neighbourIds = neighbourIds;
  }

  private _selected: boolean = false;

  /**
   * Gets or sets whether the point is selected.
   * @returns {boolean} - True if selected, false otherwise.
   */
  get selected(): boolean {
    return this._selected;
  }

  set selected(value: boolean) {
    this._selected = value;
  }

  private _hovered: boolean = false;

  /**
   * Gets or sets whether the point is hovered.
   * @returns {boolean} - True if hovered, false otherwise.
   */
  get hovered(): boolean {
    return this._hovered;
  }

  set hovered(value: boolean) {
    this._hovered = value;
  }

  private _deleted: boolean = false;

  /**
   * Gets or sets whether the point is marked as deleted.
   * @returns {boolean} - True if deleted, false otherwise.
   */
  get deleted(): boolean {
    return this._deleted;
  }

  set deleted(value: boolean) {
    this._deleted = value;
  }

  private _x: number;

  /**
   * Gets or sets the x-coordinate of the point.
   * @returns {number} - The x-coordinate.
   */
  get x(): number {
    return this._x;
  }

  set x(value: number) {
    this._x = value;
  }

  private _y: number;

  /**
   * Gets or sets the y-coordinate of the point.
   * @returns {number} - The y-coordinate.
   */
  get y(): number {
    return this._y;
  }

  set y(value: number) {
    this._y = value;
  }

  /**
   * Returns a string representation of the point.
   * @returns {string} - A formatted string with point details.
   */
  toString() {
    return `Point2D(id=${this.id}, x=${this.x}, y=${this.y})`;
  }

  /**
   * Retrieves the unique ID of the point.
   * @returns {number} - The point's ID.
   */
  get id() {
    return this._id;
  }

  /**
   * Retrieves a copy of the neighbor IDs.
   * @returns {number[]} - An array of neighbor IDs.
   */
  getNeighbourIds() {
    return [...this.neighbourIds];
  }

  /**
   * Moves the point to the specified coordinates.
   * @param {Point2D} point - The target point.
   */
  moveTo(point: Point2D): void {
    this.x = point.x;
    this.y = point.y;
  }

  /**
   * Creates a shallow copy of the point.
   * @returns {Point2D} - A new Point2D instance with cloned properties.
   */
  clone() {
    const copy = new Point2D(this.id, this._x, this._y, this.neighbourIds);
    copy.hovered = this.hovered;
    copy.deleted = this.deleted;
    copy.selected = this.selected;
    return copy;
  }

  /**
   * Converts the point to a dictionary object.
   * @returns {object} - A dictionary containing point properties.
   */
  toDict() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      // hovered: this.hovered,
      deleted: this.deleted
      // selected: this.selected,
      // neighbourIds: this.neighbourIds
    };
  }
}
