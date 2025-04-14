<script lang="ts" setup>
import ViewOptions from '@/components/Sidebar/ToolMenu/FaceMesh/ViewOptions.vue';
import FaceModelSelector from '@/components/Sidebar/ToolMenu/FaceMesh/FaceModelSelector.vue';
import ToolMenuPreamble from '@/components/Sidebar/ToolMenu/Common/ToolMenuPreamble.vue';
import { useFaceMeshConfig } from '@/stores/ToolSpecific/faceMeshConfig.ts';
import { AnnotationTool } from '@/enums/annotationTool.ts';

const config = useFaceMeshConfig();
</script>

<template>
  <ToolMenuPreamble
    :config="config"
    :tool="AnnotationTool.FaceMesh"
    not-detected-text="No face detected"
  />
  <ViewOptions />
  <FaceModelSelector />
</template>
