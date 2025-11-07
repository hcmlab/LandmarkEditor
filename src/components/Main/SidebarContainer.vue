<script lang="ts" setup>
import AnnotationToolSelector from '@/components/Sidebar/AnnotationToolSelector.vue';
import ToolMenuContainer from '@/components/Sidebar/ToolMenuContainer.vue';
</script>

<template>
  <div id="sidebar" class="min-w-20rem w-20-rem h-100 px-3 shadow bg-light d-flex flex-column">
    <AnnotationToolSelector />
    <ToolMenuContainer class="flex-grow-1 overflow-y-auto d-flex flex-column" />
  </div>
</template>
