import type { Point2D } from '@/graph/point2d';
import { FileAnnotationHistory } from '@/cache/fileAnnotationHistory';
import type { AnnotationData, ModelApi } from '@/model/modelApi';
import { ImageFile } from '@/imageFile';
import { Graph } from '@/graph/graph';
import { SaveStatus } from '@/enums/saveStatus';
import { AnnotationTool } from '@/enums/annotationTool';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';

export class FileAnnotationHistoryContainer<T extends Point2D> {
  private readonly _histories: FileAnnotationHistory<T>[] = [];
  private _selectedHistoryIndex: number = 0;
  private readonly tools = useAnnotationToolStore();

  public histories(tool: AnnotationTool): (Graph<T> | null)[] {
    return this._histories.map((h) => h.get(tool));
  }

  public get allHistories(): FileAnnotationHistory<T>[] {
    return this._histories;
  }

  public get selectedHistory(): FileAnnotationHistory<T> | undefined {
    return this._histories[this._selectedHistoryIndex] as FileAnnotationHistory<T>;
  }

  public set selectedHistory(h: FileAnnotationHistory<T>) {
    this._selectedHistoryIndex = this._histories.indexOf(h);
  }

  public get empty(): boolean {
    return this.histories?.length <= 0;
  }

  /**
   * Returns any files with pending changes
   */
  public get unsaved(): FileAnnotationHistory<Point2D>[] {
    return this._histories.filter(
      (file) => file.status === SaveStatus.saved
    ) as FileAnnotationHistory<Point2D>[];
  }

  public async add(file: File, apis: ModelApi<T>[]): Promise<void> {
    const imageFile = await ImageFile.create(file);
    if (!imageFile) {
      throw new Error('Failed to parse image data.');
    }
    const history = new FileAnnotationHistory<T>(imageFile);
    await Promise.all(
      apis.map(async (api) => {
        if (!api.tool()) return;
        await api
          .detect(imageFile)
          .then((result) => {
            if (result) {
              history.merge(result, api.tool());
            }
          })
          .catch((err) => {
            console.error(err);
          });
      })
    );
    if (!history) {
      throw new Error('Failed to detect history from the Graph API.');
    }
    this._histories.push(history);
    if (!this.selectedHistory) {
      this.selectedHistory = history;
    }
  }

  public find(fileName: string, sha256: string): FileAnnotationHistory<T> {
    return this._histories.find(
      (history) => history.file.filePointer.name === fileName && history.file.sha === sha256
    ) as FileAnnotationHistory<T>;
  }

  public push(h: FileAnnotationHistory<T>) {
    this._histories.push(h);
  }

  /**
   * Collects and processes annotation data from the annotation history store.
   * It gathers saved annotation histories, marks them as sent, and transforms
   * the data into a structured object format, with points and file SHA256 hash.
   * The resulting object uses filenames as keys.
   *
   * @param tool - The tool to get the annotation data for.
   * @return An object where each key is a filename associated with its
   * corresponding annotation data, consisting of points and the SHA256 hash.
   */
  public collectAnnotations(tool: AnnotationTool): AnnotationData {
    const result: AnnotationData = {};
    this._histories.forEach((h) => {
      if (h.status === SaveStatus.unedited) {
        return;
      }
      const graph = h.graphData(tool);

      if (graph) {
        result[h.file.filePointer.name] = graph;
      }
      h.markAsSent();
    });
    return result;
  }

  public async resetSelectedHistory() {
    const selectedHistory = this.selectedHistory;
    if (!selectedHistory) {
      return;
    }

    if (!selectedHistory) return;
    await this.runDetection(selectedHistory);
  }

  public async resetSelectedHistoryForTool(tool: AnnotationTool) {
    const h = this.selectedHistory;
    if (!h) return;

    h.clearForTool(tool);
    await this.runDetectionForTool(h, tool);
  }

  private async runDetection(selectedHistory: FileAnnotationHistory<T>) {
    await Promise.all(
      Array.from(this.tools.getUsedTools() || []).map(async (tool) => {
        await this.runDetectionForTool(selectedHistory, tool);
      })
    );
  }

  private async runDetectionForTool(
    selectedHistory: FileAnnotationHistory<T>,
    tool: AnnotationTool
  ) {
    const model = this.tools.getModel(tool);
    if (!model) return;

    console.log(`Starting detection ${tool}`);
    const graphs = await model.detect(selectedHistory.file);
    if (graphs === null) {
      return;
    }
    console.log(`Detected detection ${tool}`);
    selectedHistory.clearForTool(tool);
    selectedHistory.merge(graphs as Graph<T>[], tool);
  }
}
