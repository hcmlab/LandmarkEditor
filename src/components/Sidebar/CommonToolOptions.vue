<script setup lang="ts">
import FeatureDragBar from '@/components/Sidebar/ToolMenu/FaceMesh/FeatureDragBar.vue';
import FeatureSelectorToolMenu from '@/components/Sidebar/ToolMenu/FeatureSelector.vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';

const tools = useAnnotationToolStore();
</script>

<template>
  <BAccordionItem title="Common Options" visible class="mt-2" v-if="tools.getUsedTools().size > 0">
    <FeatureDragBar />
    <FeatureSelectorToolMenu />
  </BAccordionItem>
</template>
