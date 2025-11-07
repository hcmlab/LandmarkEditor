<script setup lang="ts">
import { BAccordionItem } from 'bootstrap-vue-next';
import FeatureDragBar from '@/components/Sidebar/ToolMenu/FaceMesh/FeatureDragBar.vue';
import FeatureSelectorToolMenu from '@/components/Sidebar/ToolMenu/Common/FeatureSelector.vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';

const tools = useAnnotationToolStore();
</script>

<template>
  <BAccordionItem v-if="tools.tools.size > 0" title="Common Options" visible class="mt-2">
    <FeatureDragBar />
    <FeatureSelectorToolMenu />
  </BAccordionItem>
</template>
