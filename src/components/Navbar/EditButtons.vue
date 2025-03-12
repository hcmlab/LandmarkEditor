<script setup lang="ts">
import ButtonWithIcon from '@/components/MenuItems/ButtonWithIcon.vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';
import type { FileAnnotationHistory } from '@/cache/fileAnnotationHistory';
import type { Point2D } from '@/graph/point2d';

const tools = useAnnotationToolStore();

function undo() {
  const selectedHistory = tools.getSelectedHistory();
  if (!selectedHistory) {
    throw new Error('Could not retrieve selected history');
  }
  tools.getUsedTools().forEach((tool) => {
    selectedHistory.previous(tool);
  });
  return false;
}

function redo() {
  const selectedHistory = tools.getSelectedHistory();
  if (!selectedHistory) {
    throw new Error('Could not retrieve selected history');
  }
  tools.getUsedTools().forEach((tool) => {
    selectedHistory.next(tool);
  });
}

function reset() {
  const selectedHistory = tools.getSelectedHistory();
  if (!selectedHistory) {
    throw new Error('Could not retrieve selected history');
  }

  if (!selectedHistory) return;
  selectedHistory.clear();
  runDetection(selectedHistory);
}

function runDetection(selectedHistory: FileAnnotationHistory<Point2D>) {
  tools.getUsedTools()?.forEach((tool) => {
    const model = tools.getModel(tool);
    if (!model) return;

    model.detect(selectedHistory.file).then((graphs) => {
      if (graphs === null) {
        return;
      }
      selectedHistory.clear();
      selectedHistory.merge(graphs, tool);
    });
  });
}
</script>

<template>
  <BNavItemDropdown text="Edit" class="pt-1" variant="light" id="edit-dropdown">
    <BDropdownItem>
      <button-with-icon
        text="Undo"
        icon="bi-arrow-counterclockwise"
        shortcut="Control+Z"
        @click="undo"
      />
    </BDropdownItem>
    <BDropdownItem>
      <button-with-icon text="Redo" icon="bi-arrow-clockwise" shortcut="Control+Y" @click="redo" />
    </BDropdownItem>
    <BDropdownItem>
      <button-with-icon text="Reset" icon="bi-x-square" shortcut="Control+R" @click="reset" />
    </BDropdownItem>
  </BNavItemDropdown>
</template>
