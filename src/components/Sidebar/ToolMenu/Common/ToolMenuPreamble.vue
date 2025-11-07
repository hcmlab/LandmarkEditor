<script lang="ts" setup>
import { type PropType, ref, watch } from 'vue';
import { AnnotationTool } from '@/enums/annotationTool.ts';
import ProcessingSpinner from '@/components/Sidebar/ToolMenu/Common/ProcessingSpinner.vue';
import NotDetectedWarning from '@/components/Sidebar/ToolMenu/Common/NotDetectedWarning.vue';
import ThresholdDragBar from '@/components/Sidebar/ToolMenu/Common/ThreshouldDragBar.vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore.ts';

const props = defineProps({
  config: {
    type: Object,
    required: true,
    validator(value: object): boolean {
      if (!value) return false;
      return (
        Object.keys(value).includes('minDetectionConfidence') &&
        Object.keys(value).includes('minPresenceConfidence') &&
        Object.keys(value).includes('isProcessing') &&
        Object.keys(value).includes('setMinDetectionConfidence') &&
        Object.keys(value).includes('setMinPresenceConfidence')
      );
    }
  },
  tool: {
    type: String as PropType<AnnotationTool>,
    required: true
  },
  notDetectedText: {
    type: String,
    required: true
  }
});

const tools = useAnnotationToolStore();
const processing = ref(false);

const minDetectionConfidence = ref(props.config.minDetectionConfidence * 100);
const minPresenceConfidence = ref(props.config.minPresenceConfidence * 100);

const oldDetectionConfidence = ref(props.config.minDetectionConfidence * 100);
const oldPresenceConfidence = ref(props.config.minPresenceConfidence * 100);

watch(
  () => props.config.isProcessing,
  (newVal) => {
    processing.value = newVal;
  },
  {
    deep: true,
    immediate: true
  }
);

watch(
  () => props.config.minDetectionConfidence,
  (newVal) => {
    minDetectionConfidence.value = newVal * 100;
  }
);

watch(
  () => props.config.minPresenceConfidence,
  (newVal) => {
    minPresenceConfidence.value = newVal * 100;
  }
);

const updateDetectionConfidence = (newVal: number) => {
  if (!tools.tools.has(props.tool)) return;
  oldDetectionConfidence.value = props.config.minDetectionConfidence;
  oldPresenceConfidence.value = props.config.minPresenceConfidence;
  props.config.setMinDetectionConfidence(newVal / 100);

  runUpdate();
};

const updatePresenceConfidence = (newVal: number) => {
  if (!tools.tools.has(props.tool)) return;
  oldDetectionConfidence.value = props.config.minDetectionConfidence;
  oldPresenceConfidence.value = props.config.minPresenceConfidence;
  props.config.setMinPresenceConfidence(newVal / 100);

  runUpdate();
};

function runUpdate() {
  tools
    .getModel(props.tool)
    ?.updateSettings()
    .then((_) =>
      tools.histories.requestDetection(
        props.tool,
        oldDetectionConfidence.value,
        oldPresenceConfidence.value
      )
    );
}
</script>

<template>
  <ProcessingSpinner :running="processing" />
  <NotDetectedWarning v-if="!processing" :text="props.notDetectedText" :tool="props.tool" />

  <ThresholdDragBar
    v-model="minDetectionConfidence"
    :disabled="
      tools.histories.toolOverwriteModalConfig !== undefined &&
      tools.histories.toolOverwriteModalConfig.tool !== props.tool
    "
    icon="bi-speedometer2"
    top-text="Minimum Detection Confidence"
    @change="updateDetectionConfidence(minDetectionConfidence)"
  />
  <ThresholdDragBar
    v-model="minPresenceConfidence"
    :disabled="
      tools.histories.toolOverwriteModalConfig !== undefined &&
      tools.histories.toolOverwriteModalConfig.tool !== props.tool
    "
    icon="bi-speedometer2"
    top-text="Minimum Presence Confidence"
    @change="updatePresenceConfidence(minPresenceConfidence)"
  />
</template>
