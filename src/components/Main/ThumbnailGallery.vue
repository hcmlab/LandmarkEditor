<script lang="ts" setup>
import { ref } from 'vue';
import { useAnnotationHistoryStore } from '@/stores/annotationHistoryStore';
import ThumbnailContainer from '@/components/ThumbnailContainer.vue';
import { SaveStatus } from '@/enums/saveStatus';
import { FileAnnotationHistory } from '@/cache/fileAnnotationHistory';
import { Point3D } from '@/graph/point3d';
import { useModelStore } from '@/stores/modelStore';
import type { MultipleViewImage } from '@/interface/multiple_view_image';

const annotationHistoryStore = useAnnotationHistoryStore();
const modelStore = useModelStore();
const histories = ref(useAnnotationHistoryStore().histories);

function selectThumbnail(file: MultipleViewImage): void {
  /* clicking to save */
  const oldHistory = annotationHistoryStore.selectedHistory;
  const selected = file.center?.image;
  if (!selected) return;
  if (
    oldHistory &&
    selected.filePointer.name === oldHistory.file.center?.image.filePointer.name &&
    oldHistory.status !== SaveStatus.unedited &&
    file.center
  ) {
    oldHistory.status = SaveStatus.saved;
    modelStore.model
      .uploadAnnotations({ [file.center.image.filePointer.name]: oldHistory.graphData })
      .catch((reason) => {
        console.error('Posting history failed: ', reason);
      });
    return;
  }
  annotationHistoryStore.selectedHistory = annotationHistoryStore.find(
    selected.filePointer.name,
    selected.sha
  );
}
</script>

<template>
  <div id="thumbnail-gallery" class="w-10 h-100 rounded-start-1 shadow bg-light text-center">
    <div class="h-5 d-flex align-items-center justify-content-center">
      <h6>
        Images
        <small
          >(
          <output id="num-images"> {{ histories.length }}</output>
          )</small
        >
      </h6>
    </div>
    <div id="thumbnailGalleryContainer" class="overflow-auto mh-95 w-100">
      <div v-for="(history, idx) in histories" :key="idx" class="pb-1">
        <ThumbnailContainer
          :id="'thumbnail-' + idx"
          :history="history as FileAnnotationHistory<Point3D>"
          @click="selectThumbnail"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
