<script setup lang="ts">
import { ref, watch } from 'vue';
import ViewOptions from '@/components/Sidebar/ToolMenu/FaceMesh/ViewOptions.vue';
import ModelSelector from '@/components/Sidebar/ToolMenu/FaceMesh/ModelSelector.vue';
import { AnnotationTool } from '@/enums/annotationTool.ts';
import NotDetectedWarning from '@/components/Sidebar/ToolMenu/Common/NotDetectedWarning.vue';
import ProcessingSpinner from '@/components/Sidebar/ToolMenu/Common/ProcessingSpinner.vue';
import { useFaceMeshConfig } from '@/stores/ToolSpecific/faceMeshConfig.ts';
const config = useFaceMeshConfig();

const processing = ref(false);

watch(
  () => config.processing,
  (newVal) => {
    processing.value = newVal;
  },
  {
    deep: true,
    immediate: true
  }
);
</script>

<template>
  <ProcessingSpinner :running="processing" />
  <NotDetectedWarning :tool="AnnotationTool.FaceMesh" text="No face detected" v-if="!processing" />
  <ViewOptions />
  <ModelSelector />
</template>

<style scoped></style>
