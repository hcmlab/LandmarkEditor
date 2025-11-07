<script lang="ts" setup>
import { useHandConfig } from '@/stores/ToolSpecific/handConfig.ts';
import ToolMenuPreamble from '@/components/Sidebar/ToolMenu/Common/ToolMenuPreamble.vue';
import { AnnotationTool } from '@/enums/annotationTool.ts';

const config = useHandConfig();
</script>

<template>
  <ToolMenuPreamble
    :config="config"
    :tool="AnnotationTool.Hand"
    not-detected-text="No hand(s) detected"
  />
</template>
