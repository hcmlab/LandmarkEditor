import { type Matrix } from 'mathjs';
import { Point2D } from '@/graph/point2d';
import { Graph } from '@/graph/graph';
import { SaveStatus } from '@/enums/saveStatus';

import type { MultipleViewImage } from '@/interface/multiple_view_image';
import { Orientation } from '@/enums/orientation';
import { math, normalizeVector } from '@/util/math';

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

  public static FromDetection<T extends Point2D>(
    file: MultipleViewImage,
    left: Graph<T> | undefined,
    center: Graph<T> | undefined,
    right: Graph<T> | undefined
  ) {
    const h = new FileAnnotationHistory<T>(file);
    if (left) h.__history[FileAnnotationHistory.orientationToIndex(Orientation.left)][0] = left;
    if (center)
      h.__history[FileAnnotationHistory.orientationToIndex(Orientation.center)][0] = center;
    if (right) h.__history[FileAnnotationHistory.orientationToIndex(Orientation.right)][0] = right;
    return h;
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
    this._add(item, FileAnnotationHistory.orientationToIndex(this.file.selected));
  }

  private _add(item: Graph<T>, orientationId: number) {
    if (this._currentHistoryIndex[orientationId] + 1 < this.__history[orientationId].length) {
      // Delete history stack when moved back and changed something
      this.__history[orientationId].length = this._currentHistoryIndex[orientationId] + 1;
    }
    // only act if a size is provided see Issue #70
    if (this.cacheSize !== 0 && this.cacheSize === this.__history[orientationId].length) {
      // Remove the first item as it is too old and cache limit is reached
      this.__history[orientationId].shift();
    }
    this.__history[orientationId].push(item.clone());
    this._currentHistoryIndex[orientationId] = this.__history[orientationId].length - 1;
  }

  /**
   * Merges an array of Graph items into the current graph instance.
   * Expects the latest item at the last index (-1)
   *
   * @param items - An array of Graph items to be merged.
   * @param orientation_id - the id of the orientation to be merged
   */
  merge(items: FileAnnotationHistory<T>, orientation_id: number) {
    items.__history[orientation_id].forEach((item) => this._add(item, orientation_id));
  }

  append(other: FileAnnotationHistory<T>) {
    this.merge(other, FileAnnotationHistory.orientationToIndex(Orientation.left));
    this.merge(other, FileAnnotationHistory.orientationToIndex(Orientation.center));
    this.merge(other, FileAnnotationHistory.orientationToIndex(Orientation.right));
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
    this.__history = [[], [], []];
    this._currentHistoryIndex = [0, 0, 0];
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
   * @param points - The array of movement to update in other images. Already update in the source image.
   */
  public updateOtherPerspectives(points: T[]) {
    const orientation = this.file.selected;
    if (!points || points.length === 0) {
      return;
    }
    if (orientation == Orientation.unknown) {
      throw new Error('Unknown orientation');
    }
    const matrices: { [key in Orientation]?: [Matrix, Matrix] } = {};

    if (orientation !== Orientation.left && this.file.left) {
      matrices[Orientation.left] = [
        this.file.left.transformationMatrix,
        this.file.left.revTransformationMatrix
      ];
    }
    if (orientation !== Orientation.center && this.file.center) {
      matrices[Orientation.center] = [
        this.file.center.transformationMatrix,
        this.file.center.revTransformationMatrix
      ];
    }
    if (orientation !== Orientation.right && this.file.right) {
      matrices[Orientation.right] = [
        this.file.right.transformationMatrix,
        this.file.right.revTransformationMatrix
      ];
    }

    const point_matrix = this._file.selectedGuess()?.transformationMatrix;
    if (!point_matrix) {
      throw new Error('No transformation matrix found');
    }

    points.forEach((point) => {
      point.matrix = normalizeVector(
        math.multiply(
          math.subset(point_matrix, math.index([0, 1, 2], 3), [[0], [0], [0]]),
          point.matrix.clone()
        )
      );
      Object.entries(matrices).forEach(([orient, [matrix, rev_matrix]]) => {
        if (matrix) {
          this.updatePerspectiveFromMatrix(point, matrix, rev_matrix, orient as Orientation);
        }
      });
    });
  }

  /**
   * Updates the point at the given id in the history of the specified orientation using the given absolute point and perspective matrix.
   * @param point the point to be updated
   * @param matrix the matrix that describes the translation onto the other face
   * @param rev_matrix the reverse of the other matrix
   * @param orientation the orientation to update
   */
  private updatePerspectiveFromMatrix(
    point: T,
    matrix: Matrix,
    rev_matrix: Matrix,
    orientation: Orientation
  ) {
    const orientation_id = FileAnnotationHistory.orientationToIndex(orientation);
    const g = this.__history[orientation_id][this._currentHistoryIndex[orientation_id]];
    if (g === undefined) {
      throw new Error("Can't find the graph to update");
    }
    const other = g.getById(point.id);

    if (!other) {
      console.error(
        `Couldn't find corresponding point (id=${point.id}) in other perspective (orientation: ${orientation})`
      );
      return;
    }
    const move = math.multiply(
      math.subset(matrix, math.index([0, 1, 2], 3), [[0], [0], [0]]),
      point.matrix.clone()
    );
    let other_transposed = math.multiply(matrix, other.matrix.clone()); // Transpose other to other perspective
    other_transposed = normalizeVector(other_transposed);

    other_transposed = math.subset(
      other_transposed,
      math.index([0, 1, 2]),
      math.add(
        math.subset(other_transposed, math.index([0, 1, 2])),
        math.subset(move, math.index([0, 1, 2]))
      )
    ); // Add the movement
    other_transposed = math.multiply(rev_matrix, other_transposed); // Convert back to original perspective
    other.matrix = normalizeVector(other_transposed);
    g.points[other.id] = other;
  }
}
