<script setup lang="ts">
import { ref, watch } from 'vue';
import { AnnotationTool } from '@/enums/annotationTool.ts';
import NotDetectedWarning from '@/components/Sidebar/ToolMenu/Common/NotDetectedWarning.vue';
import { usePoseConfig } from '@/stores/ToolSpecific/poseConfig.ts';
import ProcessingSpinner from '@/components/Sidebar/ToolMenu/Common/ProcessingSpinner.vue';
import ThresholdDragBar from '@/components/Sidebar/ToolMenu/Common/ThreshouldDragBar.vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore.ts';
import { PoseModelType, poseModelTypes } from '@/model/mediapipePose.ts';

const config = usePoseConfig();
const tools = useAnnotationToolStore();
const processing = ref(false);
const showModelInfoModal = ref(false);

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
const minDetectionConfidence = ref((config.modelConfig.minPoseDetectionConfidence || 0) * 100);
const minPresenceConfidence = ref((config.modelConfig.minPosePresenceConfidence || 0) * 100);

const updateDetectionConfidence = (newVal: number) => {
  if (!tools.tools.has(AnnotationTool.Pose)) return;
  config.modelConfig.minPoseDetectionConfidence = newVal / 100;

  runUpdate();
};

const updatePresenceConfidence = (newVal: number) => {
  if (!tools.tools.has(AnnotationTool.Pose)) return;
  config.modelConfig.minPosePresenceConfidence = newVal / 100;

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
  <NotDetectedWarning :tool="AnnotationTool.Pose" text="No pose detected" v-if="!processing" />
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
  <div class="d-flex flex-row justify-content-center align-items-center">
    <BDropdown text="Model Type" class="w-100">
      <div v-for="(type, idx) in poseModelTypes" :key="idx">
        <BDropdownItemButton :disabled="type === config.modelType" @click="updateModelType(type)">{{
          type
        }}</BDropdownItemButton>
      </div>
    </BDropdown>
    <BButton variant="outline-dark" @click="showModelInfoModal = true">
      <i class="bi bi-info-circle" />
    </BButton>
  </div>
  <BModal
    title="Pose model type information"
    @close="showModelInfoModal = false"
    v-model="showModelInfoModal"
    :cancel-disabled="true"
    centered
  >
    <p>
      You can choose different weights and setups for the pose estimation model. The type describes
      the calculation effort. From <code>lite</code> to <code>heavy</code>. The
      <code>lite</code> model is the fastest and the <code>heavy</code> is the most accurate but
      also the slowest.
    </p>
    <p>
      <a
        href="https://storage.googleapis.com/mediapipe-assets/Model%20Card%20BlazePose%20GHUM%203D.pdf"
        >More Information</a
      >
      about the different models. Scroll down in the file for accuracy data.
    </p>

    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th scope="col">
            <b>Model</b>
          </th>
          <th scope="col">
            <b>Accuracy</b>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Lite</td>
          <td>87.0</td>
        </tr>
        <tr>
          <td>Full</td>
          <td>91.8</td>
        </tr>
        <tr>
          <td>Heavy</td>
          <td>94.2</td>
        </tr>
      </tbody>
    </table>
  </BModal>
</template>
