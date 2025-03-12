<script setup lang="ts">
import ViewOptions from '@/components/Sidebar/ToolMenu/FaceMesh/ViewOptions.vue';
import ModelSelector from '@/components/Sidebar/ToolMenu/FaceMesh/ModelSelector.vue';
import FeatureSelectorToolMenu from '@/components/Sidebar/ToolMenu/FaceMesh/FeatureSelector.vue';
import FeatureDragBar from '@/components/Sidebar/ToolMenu/FaceMesh/FeatureDragBar.vue';
</script>

<template>
  <FeatureDragBar />
  <ViewOptions />
  <ModelSelector />
  <FeatureSelectorToolMenu />
</template>

<style scoped></style>
