<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';
import { AnnotationTool } from '@/enums/annotationTool';
import CommonToolOptions from '@/components/Sidebar/CommonToolOptions.vue';

const annotationTools = useAnnotationToolStore();
const tools = computed(() =>
  Array.from(annotationTools.tools).map((tool, index) => ({
    id: index + 1,
    tool: tool
  }))
);

function componentFromTool(tool: AnnotationTool) {
  switch (tool) {
    case AnnotationTool.FaceMesh: {
      return defineAsyncComponent(() => import('./ToolMenu/FaceMeshToolMenu.vue'));
    }
    case AnnotationTool.Pose: {
      return defineAsyncComponent(() => import('./ToolMenu/PoseToolMenu.vue'));
    }
    case AnnotationTool.Hand: {
      return defineAsyncComponent(() => import('./ToolMenu/HandToolMenu.vue'));
    }
    default:
      return null;
  }
}
</script>

<template>
  <div v-if="tools.length > 0" class="mt-1">
    <!-- The list was intended to be sortable,but the faders break with this - sortablejs-vue3 -->
    <BAccordion free class="bg-light rounded-1">
      <CommonToolOptions />
      <div v-for="element in tools" :key="element.id">
        <div :key="element.id" class="draggable mt-2">
          <BAccordionItem :title="element.tool" visible>
            <component
              :is="componentFromTool(element.tool)"
              v-if="componentFromTool(element.tool)"
            />
            <div v-else>Component not found.</div>
            <!-- remove -->
            <hr />
            <BButton
              variant="outline-dark"
              class="w-100"
              @click="annotationTools.tools.delete(element.tool)"
            >
              <i class="bi bi-trash"></i>
              Remove tool
            </BButton>
          </BAccordionItem>
        </div>
      </div>
    </BAccordion>
  </div>
</template>

<style scoped></style>
