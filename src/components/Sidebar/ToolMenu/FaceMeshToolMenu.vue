<script setup lang="ts">
import { ref, watch } from 'vue';
import ViewOptions from '@/components/Sidebar/ToolMenu/FaceMesh/ViewOptions.vue';
import ModelSelector from '@/components/Sidebar/ToolMenu/FaceMesh/ModelSelector.vue';
import { AnnotationTool } from '@/enums/annotationTool.ts';
import NotDetectedWarning from '@/components/Sidebar/ToolMenu/Common/NotDetectedWarning.vue';
import ProcessingSpinner from '@/components/Sidebar/ToolMenu/Common/ProcessingSpinner.vue';
import { useFaceMeshConfig } from '@/stores/ToolSpecific/faceMeshConfig.ts';
import ThresholdDragBar from '@/components/Sidebar/ToolMenu/Common/ThreshouldDragBar.vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore.ts';

const config = useFaceMeshConfig();
const tools = useAnnotationToolStore();
const processing = ref(false);

const minDetectionConfidence = ref((config.modelOptions.minFaceDetectionConfidence || 0) * 100);
const minPresenceConfidence = ref((config.modelOptions.minFacePresenceConfidence || 0) * 100);

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

watch(
  () => config.modelOptions,
  (newVal) => {
    if (newVal.minFaceDetectionConfidence) {
      minDetectionConfidence.value = newVal.minFaceDetectionConfidence * 100;
    }
    if (newVal.minFacePresenceConfidence) {
      minPresenceConfidence.value = newVal.minFacePresenceConfidence * 100;
    }
  },
  {
    deep: true,
    immediate: true
  }
);

const updateDetectionConfidence = (newVal: number) => {
  if (!tools.tools.has(AnnotationTool.FaceMesh)) return;
  config.modelOptions.minFaceDetectionConfidence = newVal / 100;

  runUpdate();
};

const updatePresenceConfidence = (newVal: number) => {
  if (!tools.tools.has(AnnotationTool.FaceMesh)) return;
  config.modelOptions.minFacePresenceConfidence = newVal / 100;

  runUpdate();
};

function runUpdate() {
  tools
    .getModel(AnnotationTool.FaceMesh)
    ?.updateSettings()
    .then((_) => tools.histories.requestDetection(AnnotationTool.FaceMesh));
}
</script>

<template>
  <ProcessingSpinner :running="processing" />
  <NotDetectedWarning :tool="AnnotationTool.FaceMesh" text="No face detected" v-if="!processing" />
  <ViewOptions />
  <ModelSelector />
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
