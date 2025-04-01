<script setup lang="ts">
import { ref } from 'vue';
import { ImageFile } from '@/imageFile';
import ThumbnailContainer from '@/components/ThumbnailContainer.vue';
import { SaveStatus } from '@/enums/saveStatus';
import { FileAnnotationHistory } from '@/cache/fileAnnotationHistory';
import { Point2D } from '@/graph/point2d';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';
import { AnnotationTool } from '@/enums/annotationTool';

const tools = useAnnotationToolStore();
const histories = ref(tools.getAllHistories());

function selectThumbnail(file: ImageFile): void {
  const oldHistory = tools.getSelectedHistory();

  /* clicking to save */
  if (
    oldHistory &&
    file.filePointer.name === oldHistory.file.filePointer.name &&
    oldHistory.status !== SaveStatus.unedited
  ) {
    const graphData = oldHistory.graphData(AnnotationTool.FaceMesh);
    if (!graphData) return;
    const model = tools.getModel(AnnotationTool.FaceMesh);
    if (!model) return;
    model
      .uploadAnnotations({
        [file.filePointer.name]: graphData
      })
      .catch((reason) => {
        throw new Error(`Posting history failed: ${reason}`);
      });
    oldHistory.markAsSaved();
  }

  /* other image selected */
  tools.histories.selectedHistory = tools.histories.find(file.filePointer.name, file.sha);
}
</script>

<template>
  <div class="w-10 h-100 rounded-start-1 shadow bg-light text-center" id="thumbnail-gallery">
    <div class="h-5 d-flex align-items-center justify-content-center">
      <h6>
        Images
        <small v-if="histories"
          >(
          <output id="num-images"> {{ histories.length }}</output>
          )</small
        >
        <small v-else>(0)</small>
      </h6>
    </div>
    <div id="thumbnailGalleryContainer" class="overflow-auto mh-95 w-100">
      <div v-for="(history, idx) in histories" :key="idx" class="pb-1">
        <ThumbnailContainer
          @click="selectThumbnail"
          :history="history as FileAnnotationHistory<Point2D>"
          :id="'thumbnail-' + idx"
        />
      </div>
    </div>
  </div>
</template>
