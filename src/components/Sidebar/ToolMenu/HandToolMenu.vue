<script lang="ts" setup>
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
  () => config.isProcessing,
  (newVal) => {
    processing.value = newVal;
  },
  {
    deep: true,
    immediate: true
  }
);
const minDetectionConfidence = ref((config.minDetectionConfidence || 0.5) * 100);
const minPresenceConfidence = ref((config.minPresenceConfidence || 0.5) * 100);

const updateDetectionConfidence = (newVal: number) => {
  if (!tools.tools.has(AnnotationTool.Hand)) return;
  config.setMinDetectionConfidence(newVal / 100);

  runUpdate();
};

const updatePresenceConfidence = (newVal: number) => {
  if (!tools.tools.has(AnnotationTool.Hand)) return;
  config.setMinPresenceConfidence(newVal / 100);

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
  <NotDetectedWarning v-if="!processing" :tool="AnnotationTool.Hand" text="No hand(s) detected" />
  <ThresholdDragBar
    v-model="minDetectionConfidence"
    icon="bi-speedometer2"
    top-text="Minimum Detection Confidence"
    @change="updateDetectionConfidence(minDetectionConfidence)"
  />
  <ThresholdDragBar
    v-model="minPresenceConfidence"
    icon="bi-speedometer2"
    top-text="Minimum Presence Confidence"
    @change="updatePresenceConfidence(minPresenceConfidence)"
  />
</template>
