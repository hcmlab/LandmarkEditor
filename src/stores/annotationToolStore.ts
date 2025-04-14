import { defineStore } from 'pinia';
import { type UnwrapRef } from 'vue';
import { AnnotationTool } from '@/enums/annotationTool';
import type { ModelApi } from '@/model/modelApi';
import type { Point2D } from '@/graph/point2d';
import { MediapipeFaceModel } from '@/model/mediapipeFace.ts';
import { MediapipeHandModel } from '@/model/mediapipeHand';
import { MediapipePoseModel } from '@/model/mediapipePose';
import { FileAnnotationHistoryContainer } from '@/cache/FileAnnotationHistoryContainer';
import { Graph } from '@/graph/graph';
import { FileAnnotationHistory } from '@/cache/fileAnnotationHistory';
import type { BodyFeature } from '@/enums/bodyFeature';
import type { PublicInterface } from '@/util/publicInterface.ts';

export const useAnnotationToolStore = defineStore('annotationTool', {
  state: () => ({
    tools: new Set([AnnotationTool.FaceMesh]),
    models: new Map<AnnotationTool, ModelApi<Point2D, never>>([
      [AnnotationTool.FaceMesh, new MediapipeFaceModel()],
      [AnnotationTool.Pose, new MediapipePoseModel()],
      [AnnotationTool.Hand, new MediapipeHandModel()]
    ]),
    histories: new FileAnnotationHistoryContainer<Point2D>()
  }),
  getters: {
    getTools(state): Set<AnnotationTool> {
      return state.tools;
    },
    getModels(state): Array<ModelApi<Point2D, never>> {
      return Array.from(state.tools)
        .map((tool) => state.models.get(tool))
        .filter((model): model is ModelApi<Point2D, never> => model !== undefined);
    },
    allModels(state): UnwrapRef<ModelApi<Point2D, never>>[] {
      return Array.from(state.models.values());
    },
    selectedHistory(state) {
      return state.histories.selectedHistory as FileAnnotationHistory<Point2D>;
    },
    allHistories(state): FileAnnotationHistory<Point2D>[] {
      return state.histories.allHistories as FileAnnotationHistory<Point2D>[];
    },
    historyContainer(state): FileAnnotationHistoryContainer<Point2D> {
      return state.histories as FileAnnotationHistoryContainer<Point2D>;
    }
  },
  actions: {
    getModel(tool: AnnotationTool): PublicInterface<ModelApi<Point2D, never>> | undefined {
      return this.models.get(tool) as PublicInterface<ModelApi<Point2D, never>>;
    },
    getHistories(tool: AnnotationTool): (Graph<Point2D> | undefined)[] | undefined {
      return this.histories.histories(tool);
    },
    resetCurrentHistory() {
      this.histories.resetSelectedHistory();
    },
    toggleFeature(feature: BodyFeature) {
      const h = this.selectedHistory;
      if (!h) {
        return;
      }
      h.toggleFeature(feature);
    }
  }
});
