<script setup lang="ts">
import { ref, watch } from 'vue';
import { AnnotationTool } from '@/enums/annotationTool.ts';
import NotDetectedWarning from '@/components/Sidebar/ToolMenu/Common/NotDetectedWarning.vue';
import ProcessingSpinner from '@/components/Sidebar/ToolMenu/Common/ProcessingSpinner.vue';
import { useHandConfig } from '@/stores/ToolSpecific/handConfig.ts';
import ThresholdDragBar from '@/components/Sidebar/ToolMenu/Common/ThreshouldDragBar.vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore.ts';

const config = useHandConfig();
const tools = useAnnotationToolStore();
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
const minDetectionConfidence = ref(50);
const minPresenceConfidence = ref(50);

const updateDetectionConfidence = (newVal: number) => {
  if (!tools.tools.has(AnnotationTool.Hand)) return;
  config.modelOptions.minHandDetectionConfidence = newVal / 100;

  runUpdate();
};

const updatePresenceConfidence = (newVal: number) => {
  if (!tools.tools.has(AnnotationTool.Hand)) return;
  config.modelOptions.minHandPresenceConfidence = newVal / 100;

  runUpdate();
};

function runUpdate() {
  tools
    .getModel(AnnotationTool.Hand)
    ?.updateSettings()
    .then((_) => tools.histories.requestDetection(AnnotationTool.Hand));
}
</script>

<template>
  <ProcessingSpinner :running="processing" />
  <NotDetectedWarning :tool="AnnotationTool.Hand" text="No hand(s) detected" v-if="!processing" />
  <ThresholdDragBar
    top-text="Minimum Detection Confidence"
    icon="bi-speedometer2"
    v-model="minDetectionConfidence"
    @change="updateDetectionConfidence(minDetectionConfidence)"
  />
  <ThresholdDragBar
    top-text="Minimum Presence Confidence"
    icon="bi-speedometer2"
    v-model="minPresenceConfidence"
    @change="updatePresenceConfidence(minPresenceConfidence)"
  />
</template>
