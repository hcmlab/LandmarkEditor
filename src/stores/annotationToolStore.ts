import { defineStore } from 'pinia';
import { type UnwrapRef } from 'vue';
import { AnnotationTool } from '@/enums/annotationTool';
import type { ModelApi } from '@/model/modelApi';
import type { Point2D } from '@/graph/point2d';
import { MediapipeModel } from '@/model/mediapipe';
import { MediapipeHandModel } from '@/model/mediapipeHand';
import { MediapipePoseModel } from '@/model/mediapipePose';
import { FileAnnotationHistoryContainer } from '@/cache/FileAnnotationHistoryContainer';
import { Graph } from '@/graph/graph';
import { FileAnnotationHistory } from '@/cache/fileAnnotationHistory';
import type { BodyFeature } from '@/enums/bodyFeature';

export const useAnnotationToolStore = defineStore('annotationTool', {
  state: () => ({
    tools: new Set([AnnotationTool.FaceMesh]),
    models: new Map<AnnotationTool, ModelApi<Point2D>>([
      [AnnotationTool.FaceMesh, new MediapipeModel()],
      [AnnotationTool.Pose, new MediapipePoseModel()],
      [AnnotationTool.Hand, new MediapipeHandModel()]
    ]),
    histories: new FileAnnotationHistoryContainer()
  }),
  getters: {
    getTools(state): Set<AnnotationTool> {
      return state.tools;
    },
    getModels(state): Array<ModelApi<Point2D>> {
      return Array.from(state.tools)
        .map((tool) => state.models.get(tool))
        .filter((model): model is ModelApi<Point2D> => model !== undefined);
    },
    allModels(state): UnwrapRef<ModelApi<Point2D>>[] {
      return Array.from(state.models.values());
    },
    selectedHistory(state) {
      return state.histories.selectedHistory as FileAnnotationHistory<Point2D>;
    },
    allHistories(state): FileAnnotationHistory<Point2D>[] {
      return state.histories.allHistories as FileAnnotationHistory<Point2D>[];
    }
  },
  actions: {
    getModel(tool: AnnotationTool): ModelApi<Point2D> | undefined {
      return this.models.get(tool);
    },
    getHistories(tool: AnnotationTool): (Graph<Point2D> | null)[] | undefined {
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
