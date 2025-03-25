<script setup lang="ts">
import { ref, watch } from 'vue';
import { AnnotationTool } from '@/enums/annotationTool.ts';
import NotDetectedWarning from '@/components/Sidebar/ToolMenu/Common/NotDetectedWarning.vue';
import { usePoseConfig } from '@/stores/ToolSpecific/poseConfig.ts';
import ProcessingSpinner from '@/components/Sidebar/ToolMenu/Common/ProcessingSpinner.vue';
const config = usePoseConfig();
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
  <NotDetectedWarning :tool="AnnotationTool.Pose" text="No pose detected" v-if="!processing" />
</template>
