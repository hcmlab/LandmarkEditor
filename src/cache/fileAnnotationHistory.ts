import { Point2D } from '@/graph/point2d';
import { Graph } from '@/graph/graph';
import { ImageFile } from '@/imageFile';
import { SaveStatus } from '@/enums/saveStatus';
import { allAnnotationTools, AnnotationTool } from '@/enums/annotationTool';
import type { BodyFeature } from '@/enums/bodyFeature';

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
  private readonly _history: Map<AnnotationTool, Graph<T>[]> = new Map();
  private readonly _currentHistoryIndex: Map<AnnotationTool, number> = new Map();
  private readonly _file: ImageFile;
  private _status: SaveStatus;
  private readonly _deletedFeatures: Set<BodyFeature> = new Set<BodyFeature>();

  /**
   * Creates a new FileAnnotationHistory instance.
   * @param file - The file associated with the annotations.
   * @param cacheSize - The maximum number of history entries to retain. If 0 (default) any amount of data is kept
   */
  constructor(file: ImageFile, cacheSize: number = 0) {
    this._file = file;
    this.cacheSize = cacheSize;
    this._status = SaveStatus.unedited;

    this.clear();
  }
  /**
   * Gets the associated file.
   * @returns {File} - The file associated with the annotations.
   */
  get file(): ImageFile {
    return this._file;
  }

  get status(): SaveStatus {
    return this._status;
  }

  set status(value: SaveStatus) {
    this._status = value;
  }

  protected history(tool: AnnotationTool) {
    return this._history.get(tool);
  }

  get deletedFeatures() {
    return this._deletedFeatures;
  }

  private currentHistoryIndex(tool: AnnotationTool) {
    const index = this._currentHistoryIndex.get(tool);
    if (index === undefined) {
      throw new Error(`Tried to get history index for unknown tool: ${tool}`);
    }
    return index;
  }

  private setCurrentHistoryIndex(tool: AnnotationTool, value: number) {
    this._currentHistoryIndex.set(tool, value);
  }

  toggleFeature(feature: BodyFeature) {
    if (this._deletedFeatures.has(feature)) {
      this._deletedFeatures.delete(feature);
    } else {
      this._deletedFeatures.add(feature);
    }
  }

  /**
   * Returns the current history as a plain object.
   * If the user used the "undo" feature, any states in the "future" will be ignored
   */
  protected toDictArray(tool: AnnotationTool): PointData[][] | null {
    const h = this._history.get(tool);
    if (!h) {
      throw new Error('Failed to retrieve history.');
    }

    return h.slice(0, this.currentHistoryIndex(tool) + 1).map((graph) => graph.toDictArray());
  }

  /**
   * returns the serialized data of the history, included file sha.
   */
  graphData(tool: AnnotationTool): GraphData | null {
    const points = this.toDictArray(tool);
    if (!points) {
      throw new Error('Failed to retrieve history.');
    }
    return {
      points: points,
      sha256: this.file.sha
    };
  }

  /**
   * Adds a new annotation item to the history.
   * @param item - The graph of points representing the annotation.
   * @param tool - The annotation tool to add to.
   */
  add(item: Graph<T> | null | undefined, tool: AnnotationTool): void {
    if (!item) return;
    if (!this._history.has(tool)) {
      throw new Error(`No history for tool ${tool} found.`);
    }
    const h = this._history.get(tool);
    if (!h) {
      throw new Error(`Failed to retrieve history for tool ${tool}.`);
    }

    if (this.currentHistoryIndex(tool) + 1 < h.length) {
      // Delete history stack when moved back and changed something
      h.length = this.currentHistoryIndex(tool) + 1;
    }
    // only act if a size is provided see Issue #70
    if (this.cacheSize !== 0 && this.cacheSize === h.length) {
      // Remove the first item as it is too old and cache limit is reached
      h.shift();
    }
    h.push(item.clone());
    this.setCurrentHistoryIndex(tool, h.length - 1);
  }

  /**
   * Merges an array of Graph items into the current graph instance.
   * Expects the latest item at the last index (-1)
   *
   * @param items - An array of Graph items to be merged.
   * @param tool - The annotation tool to add to.
   */
  merge(items: Graph<T>[] | undefined | null, tool: AnnotationTool) {
    if (!items) {
      throw new Error(`Failed to merge history for: ${tool}`);
    }
    items.forEach((item) => this.add(item, tool));
  }

  append(other: FileAnnotationHistory<T>) {
    allAnnotationTools.forEach((tool: AnnotationTool) => {
      this.merge(other.history(tool), tool);
    });
  }

  /**
   * Sets the current history index to the specified value.
   * @param {number} index - The desired history index.
   * @param tool - The annotation tool to add to.
   */
  setIndex(index: number, tool: AnnotationTool): void {
    const h = this._history.get(tool);
    if (!h) {
      throw new Error('Failed to retrieve history.');
    }
    if (index < 0) {
      index = 0;
    } else if (index >= h.length) {
      index = h.length - 1;
    }
    if (this.currentHistoryIndex(tool) !== index) {
      this._status = SaveStatus.edited;
    }
    this.setCurrentHistoryIndex(tool, index);
  }

  /**
   * Moves to the next history entry.
   */
  next(tool: AnnotationTool): void {
    this.setIndex(this.currentHistoryIndex(tool) + 1, tool);
  }

  /**
   * Moves to the previous history entry.
   */
  previous(tool: AnnotationTool): void {
    this.setIndex(this.currentHistoryIndex(tool) - 1, tool);
  }

  /**
   * Retrieves the current annotation graph.
   * @param tool - The tool to get the history for.
   * @returns - The current annotation graph or null if empty.
   */
  get(tool: AnnotationTool): null | Graph<T> {
    const h = this._history.get(tool);
    if (!h) {
      throw new Error('Failed to retrieve history.');
    }

    if (!this.isEmpty(tool)) {
      return h[this.currentHistoryIndex(tool)];
    }
    return null;
  }

  /**
   * Checks if the history is empty.
   * @param tool - The annotation tool to add to.
   * @returns {boolean} - True if empty, false otherwise.
   */
  isEmpty(tool: AnnotationTool): boolean {
    const h = this._history.get(tool);
    if (!h) {
      throw new Error('Failed to retrieve history.');
    }
    return h.length === 0;
  }

  /**
   * Clears the entire history.
   */
  clear() {
    allAnnotationTools.forEach((tool) => {
      this.clearForTool(tool);
    });
    this._status = SaveStatus.unedited;
  }

  /**
   * Clears the history for the provided tool.
   */
  public clearForTool(tool: AnnotationTool) {
    this._history.set(tool, []);
    this._currentHistoryIndex.set(tool, 0);
    this._status = SaveStatus.unedited;
  }

  /**
   * Resets the status if item is sent
   */
  markAsSent(): void {
    this._status = SaveStatus.unedited;
  }

  /**
   * Parses the provided parsed json data into a history. Expects the latest element to be at the end of the array.
   * @param json the parsed data
   * @param file the image file, to check the sha
   * @param newObject a function to create a single Point, used to mitigate the templating.
   */
  static fromJson<T extends Point2D>(
    json: GraphData,
    file: ImageFile,
    newObject: (id: number, neighbors: number[]) => T
  ): Graph<T>[] | null {
    // skip files without annotation
    if (Object.keys(json).length == 0) {
      return null;
    }
    const sha = json.sha256;
    if (!sha) throw new Error('Missing from API!');
    if (sha !== file.sha) throw new Error('Mismatching sha sent from API!');
    let graphs = json.points;
    if (!graphs) throw new Error("Didn't get any points from API!");
    /* backward compatibility if the file contains the old Points2D[] format instead of Points2D[][] */
    if (!Array.isArray(graphs[0])) {
      graphs = [graphs as unknown as PointData[]];
    }
    return graphs.reduce((prev, graph) => {
      prev.push(Graph.fromJson(graph, newObject));
      return prev;
    }, [] as Graph<T>[]);
  }
}
