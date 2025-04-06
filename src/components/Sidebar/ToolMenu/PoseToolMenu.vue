<script lang="ts" setup>
import { ref, watch } from 'vue';
import { AnnotationTool } from '@/enums/annotationTool.ts';
import NotDetectedWarning from '@/components/Sidebar/ToolMenu/Common/NotDetectedWarning.vue';
import { usePoseConfig } from '@/stores/ToolSpecific/poseConfig.ts';
import ProcessingSpinner from '@/components/Sidebar/ToolMenu/Common/ProcessingSpinner.vue';
import ThresholdDragBar from '@/components/Sidebar/ToolMenu/Common/ThreshouldDragBar.vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore.ts';
import { PoseModelType } from '@/model/mediapipePose.ts';
import PoseModelSelector from '@/components/Sidebar/ToolMenu/Pose/PoseModelSelector.vue';

const config = usePoseConfig();
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
  if (!tools.tools.has(AnnotationTool.Pose)) return;
  config.setMinDetectionConfidence(newVal / 100);

  runUpdate();
};

const updatePresenceConfidence = (newVal: number) => {
  if (!tools.tools.has(AnnotationTool.Pose)) return;
  config.setMinPresenceConfidence(newVal / 100);

  runUpdate();
};

function updateModelType(modelType: PoseModelType) {
  if (modelType === config.modelType) return;

  config.modelType = modelType as PoseModelType;
  runUpdate();
}

function runUpdate() {
  tools
    .getModel(AnnotationTool.Pose)
    ?.updateSettings()
    .then((_) => tools.histories.requestDetection(AnnotationTool.Pose));
}
</script>

<template>
  <ProcessingSpinner :running="processing" />
  <NotDetectedWarning v-if="!processing" :tool="AnnotationTool.Pose" text="No pose detected" />
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
  <PoseModelSelector :model-type="config.modelType" @change="updateModelType" />
</template>
