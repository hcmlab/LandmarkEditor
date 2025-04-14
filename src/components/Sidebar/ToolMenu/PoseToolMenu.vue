<script lang="ts" setup>
import { AnnotationTool } from '@/enums/annotationTool.ts';
import { usePoseConfig } from '@/stores/ToolSpecific/poseConfig.ts';
import { useAnnotationToolStore } from '@/stores/annotationToolStore.ts';
import { PoseModelType } from '@/model/mediapipePose.ts';
import PoseModelSelector from '@/components/Sidebar/ToolMenu/Pose/PoseModelSelector.vue';
import ToolMenuPreamble from '@/components/Sidebar/ToolMenu/Common/ToolMenuPreamble.vue';

const config = usePoseConfig();
const tools = useAnnotationToolStore();

function updateModelType(modelType: PoseModelType) {
  if (modelType === config.modelType) return;
  config.modelType = modelType as PoseModelType;
  runUpdate();
}

function runUpdate() {
  tools
    .getModel(AnnotationTool.Pose)
    ?.updateSettings()
    .then((_) =>
      tools.histories.requestDetection(
        AnnotationTool.Pose,
        config.minDetectionConfidence || 0,
        config.minPresenceConfidence || 0
      )
    );
}
</script>

<template>
  <ToolMenuPreamble
    :config="config"
    :tool="AnnotationTool.Pose"
    not-detected-text="No pose detected"
  />
  <PoseModelSelector :model-type="config.modelType" @change="updateModelType" />
</template>
