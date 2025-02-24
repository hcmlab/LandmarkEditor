import { defineStore } from 'pinia';
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { FileAnnotationHistory } from '@/cache/fileAnnotationHistory';
import { Point3D } from '@/graph/point3d';
import { ImageFile } from '@/imageFile';
import type { AnnotationData, ModelApi } from '@/model/modelApi';
import { SaveStatus } from '@/enums/saveStatus';
import { Graph } from '@/graph/graph';
import { MediapipeModel } from '@/model/mediapipe';
import type { orientationGuessResult } from '@/util/orientationGuesser';
import type { MultipleViewImage } from '@/interface/multiple_view_image';
import { Orientation } from '@/enums/orientation';

export const useAnnotationHistoryStore = defineStore({
  id: 'annotationHistory',

  state: (): {
    _histories: FileAnnotationHistory<Point3D>[];
    selectedHistory: FileAnnotationHistory<Point3D> | null;
  } => ({
    _histories: [],
    selectedHistory: null
  }),

  actions: {
    async add(file: File, api: ModelApi<Point3D>) {
      const imageFile = await ImageFile.create(file);
      if (!imageFile) {
        // Todo - error message
        throw new Error('Failed to parse image data.');
      }
      const multipleView = {} as MultipleViewImage;
      multipleView.center = { image: imageFile } as orientationGuessResult;
      const history = await Graph.detect(api, multipleView);
      if (!history) {
        // Todo - error message
        throw new Error('Failed to detect history from the Graph API.');
      }
      this._histories.push(history);
      if (!this.selectedHistory) {
        this.selectedHistory = history;
      }
    },
    empty(): boolean {
      return this._histories?.length <= 0;
    },
    find(fileName: string, sha256: string): FileAnnotationHistory<Point3D> {
      return this._histories.find(
        (history) =>
          (history.file.left?.image.filePointer.name === fileName &&
            history.file.left.image.sha === sha256) ||
          (history.file.right?.image.filePointer.name === fileName &&
            history.file.right.image.sha === sha256) ||
          (history.file.center?.image.filePointer.name === fileName &&
            history.file.center.image.sha === sha256)
      ) as FileAnnotationHistory<Point3D>;
    },

    async merge(data: MultipleViewImage[]) {
      data.forEach((value) => {
        const h = new FileAnnotationHistory<Point3D>(value);
        const mesh = {} as FaceLandmarkerResult;
        if (!value.center?.mesh) return;
        mesh.faceLandmarks = [value.center?.mesh];
        const graph = MediapipeModel.processResult(mesh, value.center?.viewingDir);
        if (!graph) return;
        h.add(graph);
        if (value.left?.mesh) {
          mesh.faceLandmarks = [value.left?.mesh];
          const graph = MediapipeModel.processResult(mesh, value.left?.viewingDir);
          if (!graph) return;
          h.file.selected = Orientation.left;
          h.add(graph);
        }
        if (value.right?.mesh) {
          mesh.faceLandmarks = [value.right?.mesh];
          const graph = MediapipeModel.processResult(mesh, value.right?.viewingDir);
          if (!graph) return;
          h.file.selected = Orientation.right;
          h.add(graph);
        }
        h.file.selected = Orientation.center;
        this._histories.push(h as FileAnnotationHistory<Point3D>); // NOSONAR - false positive. Else this will be marked as an error by Chrome.
      });
      if (!this.selectedHistory) {
        this.selectedHistory = this._histories[0];
      }
    },

    /**
     * Returns any files with pending changes
     */
    getUnsaved(): FileAnnotationHistory<Point3D>[] {
      return this._histories.filter(
        (file) => file.status === SaveStatus.saved
      ) as FileAnnotationHistory<Point3D>[];
    },

    selected(): FileAnnotationHistory<Point3D> | null {
      return this.selectedHistory as FileAnnotationHistory<Point3D> | null;
    },
    histories(): FileAnnotationHistory<Point3D>[] {
      return this.histories as unknown as FileAnnotationHistory<Point3D>[]; // NOSONAR - false positive. Else this will be marked as an error by Chrome.
    },

    /**
     * Collects and processes annotation data from the annotation history store.
     * It gathers saved annotation histories, marks them as sent, and transforms
     * the data into a structured object format, with points and file SHA256 hash.
     * The resulting object uses filenames as keys.
     *
     * @return An object where each key is a filename associated with its
     * corresponding annotation data, consisting of points and the SHA256 hash.
     */
    collectAnnotations(): AnnotationData {
      const result: AnnotationData = {};
      this._histories.forEach((h) => {
        if (h.status === SaveStatus.unedited) {
          return;
        }
        const graph = h.graphData;

        if (!graph || !h.file.center) {
          return;
        }
        result[h.file.center.image.filePointer.name] = graph;
        h.markAsSent();
      });
      return result;
    }
  }
});
