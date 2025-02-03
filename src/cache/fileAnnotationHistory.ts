import { type MathNumericType, type Matrix } from 'mathjs';
import { Point2D } from '@/graph/point2d';
import { Graph } from '@/graph/graph';
import { SaveStatus } from '@/enums/saveStatus';

import type { MultipleViewImage } from '@/interface/multiple_view_image';
import { Orientation } from '@/enums/orientation';
import { math, reverse } from '@/util/math';

export interface PointData {
  deleted: boolean;
  x: number;
  y: number;
  z?: number;
  id: number;
}

export interface GraphData {
  points?: PointData[][];
  sha256?: string;
}

/**
 * Represents a history of annotations for a specific file.
 * Keeps track of changes made to a graph of points (e.g., annotations on an image).
 * @template T - Type of the points (must extend Point2D).
 */
export class FileAnnotationHistory<T extends Point2D> {
  private readonly cacheSize: number;
  private _currentHistoryIndex: number[] = [0, 0, 0];
  private readonly _file: MultipleViewImage;

  /**
   * Creates a new FileAnnotationHistory instance.
   * @param file - The file associated with the annotations.
   * @param cacheSize - The maximum number of history entries to retain. If 0 (default) any amount of data is kept
   */
  constructor(file: MultipleViewImage, cacheSize: number = 0) {
    if (!file) throw new Error('FileAnnotationHistory: File is required.');
    this._file = file;
    this.cacheSize = cacheSize;
    this._status = SaveStatus.unedited;
  }

  private static orientationToIndex(orientation: Orientation) {
    switch (orientation) {
      case Orientation.center:
        return 1;
      case Orientation.left:
        return 0;
      case Orientation.right:
        return 2;
      case Orientation.unknown:
        throw Error('Unknown orientation');
    }
  }

  private _status: SaveStatus;

  get status(): SaveStatus {
    return this._status;
  }

  set status(value: SaveStatus) {
    this._status = value;
  }

  /**
   * Gets the associated file.
   * @returns - The file associated with the annotations.
   */
  get file(): MultipleViewImage {
    return this._file;
  }

  /**
   * returns the serialized data of the history, included file sha.
   */
  get graphData(): GraphData {
    return {
      points: this.toDictArray,
      sha256: this.file.center?.image.sha
    };
  }

  private __history: Graph<T>[][] = [[], [], []];

  private get _history() {
    return this.__history[FileAnnotationHistory.orientationToIndex(this.file.selected)];
  }

  private set _history(value: Graph<T>[]) {
    this.__history[FileAnnotationHistory.orientationToIndex(this.file.selected)] = value;
  }

  protected get history() {
    return this._history;
  }

  private get currentHistoryIndex() {
    return this._currentHistoryIndex[FileAnnotationHistory.orientationToIndex(this.file.selected)];
  }

  private set currentHistoryIndex(value: number) {
    this._currentHistoryIndex[FileAnnotationHistory.orientationToIndex(this.file.selected)] = value;
  }

  /**
   * Returns the current history as a plain object.
   * If the user used the "undo" feature, any states in the "future" will be ignored
   */
  protected get toDictArray(): PointData[][] {
    return this._history.slice(0, this.currentHistoryIndex + 1).map((graph) => graph.toDictArray());
  }

  /**
   * Parses the provided parsed json data into a history. Expects the latest element to be at the end of the array.
   * @param json the parsed data
   * @param file the image file, to check the sha
   * @param newObject a function to create a single Point, used to mitigate the templating.
   */
  static fromJson<T extends Point2D>(
    json: GraphData,
    file: MultipleViewImage,
    newObject: (id: number, neighbors: number[]) => T
  ): FileAnnotationHistory<T> | null {
    const h = new FileAnnotationHistory<T>(file);
    // skip files without annotation
    if (Object.keys(json).length == 0) {
      return null;
    }
    const sha = json.sha256;
    if (!sha) throw new Error('Missing sha from API!');
    if (sha !== file.center?.image.sha) throw new Error('Mismatching sha sent from API!');
    let graphs = json.points;
    if (!graphs) throw new Error("Didn't get any points from API!");
    /* backward compatibility if the file contains the old Points2D[] format instead of Points2D[][] */
    if (!Array.isArray(graphs[0])) {
      graphs = [graphs as unknown as PointData[]];
    }
    graphs.forEach((unparsedGraph) => {
      const graph: Graph<T> = Graph.fromJson(unparsedGraph, newObject);
      h.add(graph);
    });
    return h;
  }

  /**
   * Adds a new annotation item to the history.
   * @param {Graph<T>} item - The graph of points representing the annotation.
   */
  add(item: Graph<T>): void {
    if (this.currentHistoryIndex + 1 < this.history.length) {
      // Delete history stack when moved back and changed something
      this._history.length = this.currentHistoryIndex + 1;
    }
    // only act if a size is provided see Issue #70
    if (this.cacheSize !== 0 && this.cacheSize === this._history.length) {
      // Remove the first item as it is too old and cache limit is reached
      this._history.shift();
    }
    this._history.push(item.clone());
    this.currentHistoryIndex = this._history.length - 1;
  }

  /**
   * Merges an array of Graph items into the current graph instance.
   * Expects the latest item at the last index (-1)
   *
   * @param items - An array of Graph items to be merged.
   */
  merge(items: Graph<T>[]) {
    items.forEach((item) => this.add(item));
  }

  append(other: FileAnnotationHistory<T>) {
    this.merge(other.history);
  }

  /**
   * Sets the current history index to the specified value.
   * @param {number} index - The desired history index.
   */
  setIndex(index: number): void {
    if (index < 0) {
      index = 0;
    } else if (index >= this._history.length) {
      index = this._history.length - 1;
    }
    if (this.currentHistoryIndex !== index) {
      this._status = SaveStatus.edited;
    }
    this.currentHistoryIndex = index;
  }

  /**
   * Moves to the next history entry.
   */
  next(): void {
    this.setIndex(this.currentHistoryIndex + 1);
  }

  /**
   * Moves to the previous history entry.
   */
  previous(): void {
    this.setIndex(this.currentHistoryIndex - 1);
  }

  /**
   * Retrieves the current annotation graph.
   * @returns {null | Graph<T>} - The current annotation graph or null if empty.
   */
  get(): null | Graph<T> {
    if (!this.isEmpty()) {
      return this._history[this.currentHistoryIndex];
    }
    return null;
  }

  /**
   * Checks if the history is empty.
   * @returns {boolean} - True if empty, false otherwise.
   */
  isEmpty(): boolean {
    return this._history.length === 0;
  }

  /**
   * Clears the entire history.
   */
  clear() {
    this._history = [];
    this.currentHistoryIndex = 0;
    this._status = SaveStatus.unedited;
  }

  /**
   * Resets the status if item is sent
   */
  markAsSent(): void {
    this._status = SaveStatus.unedited;
  }

  /**
   * Updates the points in the history of the specified orientation using the given absolute point and perspective matrix.
   * @param matrix - The perspective matrix of the manually modified image.
   * @param points - The array of movement to update in other images. Already update in the source image.
   */
  public updateFromMatrix(matrix: Matrix, points: T[]) {
    const orientation = this.file.selected;
    const inv_matrices: { [key in Orientation]?: Matrix } = {};

    if (orientation !== Orientation.left && this.file.left) {
      inv_matrices[Orientation.left] = reverse(this.file.left.transformationMatrix);
    }
    if (orientation !== Orientation.center && this.file.center) {
      inv_matrices[Orientation.center] = reverse(this.file.center.transformationMatrix);
    }
    if (orientation !== Orientation.right && this.file.right) {
      inv_matrices[Orientation.right] = reverse(this.file.right.transformationMatrix);
    }

    points.forEach((point) => {
      let abs_move = math.multiply(matrix, point.matrix);
      abs_move = math.divide(abs_move, abs_move.get([3])) as Matrix<MathNumericType>;

      Object.entries(inv_matrices).forEach(([orient, inv_matrix]) => {
        if (inv_matrix) {
          this.updatePerspectiveFromMatrix(point.id, abs_move, inv_matrix, orient as Orientation);
        }
      });
    });
  }

  /**
   * Updates the point at the given id in the history of the specified orientation using the given absolute point and perspective matrix.
   * @param point_id the id of the point to update
   * @param abs_move the relative movement inside the absolute coordinate space
   * @param matrix the perspective matrix to convert the movement to the perspective of the other image
   * @param orientation the orientation to update
   */
  private updatePerspectiveFromMatrix(
    point_id: number,
    abs_move: Matrix,
    matrix: Matrix,
    orientation: Orientation
  ) {
    const orientation_id = FileAnnotationHistory.orientationToIndex(orientation);
    const h = this.__history[orientation_id][this._currentHistoryIndex[orientation_id]];
    if (h === undefined) {
      return;
    }
    const other = h.getById(point_id);

    if (!other) {
      console.error(
        `Couldn't find corresponding point (id=${point_id}) in other perspective (orientation: ${orientation})`
      );
      return;
    }

    let move = math.multiply(matrix, abs_move);
    move = math.divide(move, move.get([3])) as Matrix<MathNumericType>;
    const move_pt = other.clone() as T;
    move_pt.matrix = move;
    other.add(move_pt);
  }
}
