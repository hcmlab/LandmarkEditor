import { Point2D } from '@/graph/point2d';
import { Graph } from '@/graph/graph';
import { ImageFile } from '@/imageFile';
import { SaveStatus } from '@/enums/saveStatus';
import { allAnnotationTools, AnnotationTool } from '@/enums/annotationTool';
import type { BodyFeature } from '@/enums/bodyFeature';
import type { GraphData, ImageAnnotationData, PointData } from '@/graph/serialisedData.ts';

/**
 * Represents a history of annotations for a specific file.
 * Keeps track of changes made to a graph of points (e.g., annotations on an image).
 * @template T - Type of the points (must extend Point2D).
 */
export class FileAnnotationHistory<T extends Point2D> {
  private readonly cacheSize: number;
  private readonly _file: ImageFile;

  /** Storing the actual history for each tool. The latest item is at the last index. */
  private readonly _history: Map<AnnotationTool, Graph<T>[]> = new Map();
  private readonly _currentHistoryIndex: Map<AnnotationTool, number> = new Map();

  private _status: SaveStatus;
  /** Keeping track of deleted features, used when user actually removes features
   * or if duplicate features are present from different models */
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

  /********************************************************************************************************************/
  /*     Getters and setters                                                                                          */
  /********************************************************************************************************************/

  get file(): ImageFile {
    return this._file;
  }

  get status(): SaveStatus {
    return this._status;
  }

  private set status(value: SaveStatus) {
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

  /********************************************************************************************************************/
  /*     Moving the history                                                                                           */
  /********************************************************************************************************************/

  /** Moves to the next history entry. */
  next(tool: AnnotationTool): void {
    this.setIndex(this.currentHistoryIndex(tool) + 1, tool);
  }

  /** Moves to the previous history entry. */
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

  /** Clears the entire history for all tools and resets the save status. */
  clear() {
    allAnnotationTools.forEach((tool) => {
      this.clearForTool(tool);
    });
    this._status = SaveStatus.unedited;
  }

  /** Clears the history for the provided tool and resets the save status. */
  public clearForTool(tool: AnnotationTool) {
    this._history.set(tool, []);
    this._currentHistoryIndex.set(tool, 0);
    this._status = SaveStatus.unedited;
  }

  /** Resets the save status if item is sent */
  markAsSent(): void {
    this._status = SaveStatus.unedited;
  }

  /********************************************************************************************************************/
  /*     Data Serialization                                                                                           */
  /********************************************************************************************************************/

  /**
   * returns the serialized data of the history, included file sha.
   * @param tool - The annotation tool to serialize. If undefined, all tools will be serialized.
   */
  graphData(tool: AnnotationTool | undefined = undefined): GraphData | undefined {
    const points = this.toImageAnnotationData(tool);
    if (!points) {
      throw new Error('Failed to retrieve history.');
    }
    return {
      points: points,
      sha256: this.file.sha
    };
  }

  /**
   * Go through all tools or the provided one and serialize the data.
   * @param tool - if provided only this tools will be serialized. Is used to serialize data when sending to the API.
   * @returns - The serialized data if present. If undefined is returned, no positions were found by the model(s).
   * @private
   */
  private toImageAnnotationData(
    tool: AnnotationTool | undefined = undefined
  ): ImageAnnotationData | undefined {
    const data: ImageAnnotationData = {};
    const tools = tool ? [tool] : allAnnotationTools;
    tools.forEach((tool) => {
      if (tool === AnnotationTool.BackgroundDrawer) {
        return; // skip background drawer
      }
      const h = this.toDictArray(tool);
      if (h && h.length > 0) {
        data[tool] = h;
      }
    });
    return data;
  }

  /**
   * Serializes the history of the specified tool. Will only serialize the current history index.
   * Will drop any data if user used the 'undo' feature.
   * @param tool The annotation tool to serialize.
   * @returns An array of PointData arrays representing the history.
   * @throws - Throws an error if the history for the specified tool is not found.
   *           Should only happen, if the toll is not in the `allAnnotationTools` list.
   */
  protected toDictArray(tool: AnnotationTool): PointData[][] | undefined {
    const h = this._history.get(tool);
    if (!h) {
      throw new Error('Failed to retrieve history.');
    }

    return h.slice(0, this.currentHistoryIndex(tool) + 1).map((graph) => graph.toDictArray());
  }

  /********************************************************************************************************************/
  /*     Loading Data from other histories                                                                            */
  /********************************************************************************************************************/

  /**
   * Adds a new annotation item to the history. Is used when the user modifies the annotation.
   * @param item - The graph of points representing the annotation.
   * @param tool - The annotation tool to add to.
   */
  add(item: Graph<T> | undefined, tool: AnnotationTool): void {
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
    this._status = SaveStatus.edited;
  }

  /**
   * Merges multiple annotation tools into the current history. New histories will be appended at the end.
   * Is used when annotation data is loaded from file.
   * @param items Histories to merge
   */
  mergeMultipleTools(items: Map<AnnotationTool, Graph<T>[]>) {
    items.forEach((item, tool) => {
      if (tool === AnnotationTool.BackgroundDrawer) {
        return; // skip background drawer
      }
      this.merge(item, tool);
    });
  }

  /**
   * Merges an array of Graph items into the current graph instance.
   * Expects the latest item at the last index (-1)
   *
   * @param items - An array of Graph items to be merged.
   * @param tool - The annotation tool to add to.
   * @throws - Throws an error if the items are undefined or if the tool is not found in the history.
   */
  merge(items: Graph<T>[] | undefined, tool: AnnotationTool) {
    if (!items) {
      throw new Error(`Failed to merge history for: ${tool}`);
    }
    items.forEach((item) => this.add(item, tool));
  }

  /**
   * Merges another FileAnnotationHistory instance into the current history.
   * @param other - The other FileAnnotationHistory instance to merge.
   */
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
   * Parses the provided parsed json data into a history. Expects the latest element to be at the end of the array.
   * @param json the parsed data
   * @param file the image file, to check the sha
   * @param newObject a function to create a single Point, used to mitigate the templating.
   */
  static fromJson<T extends Point2D>(
    json: GraphData,
    file: ImageFile,
    newObject: (id: number, neighbors: number[]) => T
  ): Map<AnnotationTool, Graph<T>[]> | undefined {
    // skip files without annotation
    if (Object.keys(json).length == 0) {
      return undefined;
    }
    const sha = json.sha256;
    if (!sha) throw new Error('Missing from API!');
    if (sha !== file.sha) throw new Error('Mismatching sha sent from API!');
    let graphs = json.points;
    if (!graphs) throw new Error("Didn't get any points from API!");

    /* Backwards compatibility pt. 1 - data without tool. assumed as face mesh. */
    if (Array.isArray(graphs)) {
      /* Backwards compatibility pt. 2 - if the file contains the old Points2D[] format instead of Points2D[][] */
      if (!Array.isArray(graphs[0])) {
        graphs = {
          [AnnotationTool.FaceMesh]: [graphs as unknown as PointData[]]
        };
      } else {
        graphs = {
          [AnnotationTool.FaceMesh]: graphs
        };
      }
    }

    const res = new Map<AnnotationTool, Graph<T>[]>();
    Object.keys(graphs).forEach((modelString) => {
      const model = modelString as AnnotationTool;
      if (!graphs || model === AnnotationTool.BackgroundDrawer) {
        return;
      }
      const unparsedGraphs = graphs[model];
      if (!unparsedGraphs) {
        return;
      }
      const parsedGraphs: Graph<T>[] = unparsedGraphs.reduce((prev, graph) => {
        prev.push(Graph.fromJson(graph, newObject));
        return prev;
      }, [] as Graph<T>[]);
      res.set(model, parsedGraphs);
    });
    return res;
  }
}
