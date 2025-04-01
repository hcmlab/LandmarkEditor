<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore.ts';
import { AnnotationTool } from '@/enums/annotationTool.ts';

const tools = useAnnotationToolStore();
const modalTool = ref<AnnotationTool | null>(null);
watch(
  () => tools.histories.toolForOverwriteModal,
  (newVal) => {
    modalTool.value = newVal;
  }
);

function discard() {
  tools.histories.toolForOverwriteModal = null;
  if (modalTool.value) tools.histories.resetHistoryForTool(modalTool.value);
}

function cancel() {
  tools.histories.toolForOverwriteModal = null;
}
</script>

<template>
  <div
    v-if="modalTool"
    class="d-flex justify-content-center align-items-center flex-column text-center p-lg-3 bg-black bg-opacity-50 w-100"
  >
    <div class="w-100 bg-white border p-lg-3 rounded-2">
      <div class="d-flex flex-row justify-content-center">
        <i class="bi bi-exclamation-triangle fs-3 me-1" />
        <div class="fs-3 fw-bold">WARNING</div>
        <i class="bi bi-exclamation-triangle fs-3 ms-1" />
      </div>
      <div class="blockquote mb-lg-5">
        You changed something in the model settings. You also have unchanged annotations. Are you
        sure you want to discard your changes without saving?
      </div>
      <div class="mb-lg-5">
        {{ tools.histories.unsaved.length > 1 ? 'Images' : 'Image' }} with unchanged annotations:
        <span class="fw-bold">{{ tools.histories.unsaved.length }}</span>
        <div
          v-for="(name, index) in tools.histories.unsaved.map(
            (value) => value.file.filePointer.name
          )"
          :key="name + index"
        >
          {{ name }}
        </div>
      </div>
      <div class="d-flex justify-content-evenly align-items-center flex-col">
        <BButton variant="danger" size="lg" class="border border-black" @click="discard">
          Discard
        </BButton>
        <BButton variant="secondary" size="lg" class="border border-black" @click="cancel">
          Cancel
        </BButton>
      </div>
    </div>
  </div>
</template>
