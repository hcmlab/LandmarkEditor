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
  private _selectedHistory: FileAnnotationHistory<T> | undefined = undefined;

  public histories(tool: AnnotationTool): (Graph<T> | null)[] {
    return this._histories.map((h) => h.get(tool));
  }

  public get allHistories(): FileAnnotationHistory<T>[] {
    return this._histories;
  }

  public get selectedHistory(): FileAnnotationHistory<T> | undefined {
    return this._selectedHistory;
  }

  public set selectedHistory(h: FileAnnotationHistory<T>) {
    this._selectedHistory = h;
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
        await Graph.detect(api, imageFile)
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

  public resetSelectedHistory() {
    const selectedHistory = this.selectedHistory;
    if (!selectedHistory) {
      return;
    }

    if (!selectedHistory) return;

    this.runDetection(selectedHistory);
  }

  private runDetection(selectedHistory: FileAnnotationHistory<Point2D>) {
    const tools = useAnnotationToolStore();
    tools.getUsedTools()?.forEach((tool) => {
      const model = tools.getModel(tool);
      if (!model) return;

      model.detect(selectedHistory.file).then((graphs) => {
        if (graphs === null) {
          return;
        }
        selectedHistory.clear();
        selectedHistory.merge(graphs, tool);
      });
    });
  }
}
