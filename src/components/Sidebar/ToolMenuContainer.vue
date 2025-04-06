<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue';
import { BAccordion, BAccordionItem, BButton } from 'bootstrap-vue-next';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';
import { AnnotationTool } from '@/enums/annotationTool';

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
      return defineAsyncComponent(() => import('./ToolMenu/FaceMesh.vue'));
    }
    default:
      return null;
  }
}
</script>

<template>
  <div v-if="tools.length > 0" class="mt-1">
    <!-- The list was intended to be sortable,but the faders break with this - sortablejs-vue3 -->
    <div v-for="element in tools" :key="element.id">
      <div :key="element.id" class="draggable">
        <BAccordion class="mt-2 bg-light rounded-1" free>
          <BAccordionItem :title="element.tool" visible>
            <component
              :is="componentFromTool(element.tool)"
              v-if="componentFromTool(element.tool)"
            />
            <div v-else>Component not found.</div>
            <!-- remove -->
            <hr />
            <BButton
              class="w-100"
              variant="outline-dark"
              @click="annotationTools.tools.delete(element.tool)"
            >
              <i class="bi bi-trash"></i>
              Remove tool
            </BButton>
          </BAccordionItem>
        </BAccordion>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
