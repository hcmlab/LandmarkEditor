<script setup lang="ts">
import ButtonWithIcon from '@/components/MenuItems/ButtonWithIcon.vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';

const tools = useAnnotationToolStore();

function undo() {
  const selectedHistory = tools.selectedHistory;
  if (!selectedHistory) {
    throw new Error('Could not retrieve selected history');
  }
  tools.tools.forEach((tool) => {
    selectedHistory.previous(tool);
  });
  return false;
}

function redo() {
  const selectedHistory = tools.selectedHistory;
  if (!selectedHistory) {
    throw new Error('Could not retrieve selected history');
  }
  tools.tools.forEach((tool) => {
    selectedHistory.next(tool);
  });
}

function reset() {
  tools.resetCurrentHistory();
}
</script>

<template>
  <BNavItemDropdown id="edit-dropdown" text="Edit" class="pt-1" variant="light">
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
