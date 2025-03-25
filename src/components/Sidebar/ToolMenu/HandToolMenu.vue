<script setup lang="ts">
import { ref, watch } from 'vue';
import { AnnotationTool } from '@/enums/annotationTool.ts';
import NotDetectedWarning from '@/components/Sidebar/ToolMenu/Common/NotDetectedWarning.vue';
import ProcessingSpinner from '@/components/Sidebar/ToolMenu/Common/ProcessingSpinner.vue';
import { useHandConfig } from '@/stores/ToolSpecific/handConfig.ts';
const config = useHandConfig();
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
  <NotDetectedWarning :tool="AnnotationTool.Hand" text="No hand(s) detected" v-if="!processing" />
</template>
