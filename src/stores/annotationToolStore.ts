import { defineStore } from 'pinia';
import { type UnwrapRef } from 'vue';
import { AnnotationTool } from '@/enums/annotationTool';
import type { ModelApi } from '@/model/modelApi';
import type { Point2D } from '@/graph/point2d';
import { MediapipePoseModel } from '@/model/mediapipePose';
import { MediapipeModel } from '@/model/mediapipe';
import { FileAnnotationHistoryContainer } from '@/cache/FileAnnotationHistoryContainer';
import { Graph } from '@/graph/graph';
import { FileAnnotationHistory } from '@/cache/fileAnnotationHistory';

export const useAnnotationToolStore = defineStore({
  id: 'annotationTool',

  state: (): {
    tools: Set<AnnotationTool>;
    models: Map<AnnotationTool, ModelApi<Point2D>>;
    histories: FileAnnotationHistoryContainer<Point2D>;
  } => ({
    tools: new Set([AnnotationTool.FaceMesh]),
    models: new Map<AnnotationTool, ModelApi<Point2D>>([
      [AnnotationTool.FaceMesh, new MediapipeModel()],
      [AnnotationTool.Pose, new MediapipePoseModel()]
    ]),
    histories: new FileAnnotationHistoryContainer()
  }),
  actions: {
    getUsedTools(): Set<AnnotationTool> {
      return this.tools;
    },
    getUsedModels(): Array<ModelApi<Point2D>> {
      return Array.from(this.tools).map((tool) => this.models.get(tool)!);
    },
    getModel(tool: AnnotationTool): ModelApi<Point2D> | undefined {
      return this.models.get(tool);
    },
    getHistories(tool: AnnotationTool): (Graph<Point2D> | null)[] | undefined {
      return this.histories.histories(tool);
    },
    getAllHistories(): FileAnnotationHistory<Point2D>[] {
      return this.histories.allHistories as FileAnnotationHistory<Point2D>[];
    },
    getAllModels(): UnwrapRef<ModelApi<Point2D>>[] {
      return Array.from(this.models.values());
    },
    getSelectedHistory() {
      return this.histories.selectedHistory as FileAnnotationHistory<Point2D>;
    }
  }
});
