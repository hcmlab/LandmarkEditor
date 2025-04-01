<script setup lang="ts">
import { computed } from 'vue';
import { AnnotationTool } from '@/enums/annotationTool.ts';
import { useAnnotationToolStore } from '@/stores/annotationToolStore.ts';

const props = defineProps<{
  tool: AnnotationTool;
  text: string;
}>();

const tools = useAnnotationToolStore();

const isDetected = computed(() => {
  const h = tools.getSelectedHistory();
  if (!h) return true;
  const graph = h.get(props.tool);
  if (!graph) return false;
  return graph.points.length > 0;
});
</script>

<template>
  <div v-if="!isDetected" class="text-danger fw-bold">
    <i class="bi bi-exclamation-triangle" />
    {{ props.text }}
  </div>
</template>
