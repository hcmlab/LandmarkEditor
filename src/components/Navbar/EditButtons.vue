<script setup lang="ts">
import { useAnnotationHistoryStore } from '@/stores/annotationHistoryStore';
import { useModelStore } from '@/stores/modelStore';
import ButtonWithIcon from '@/components/MenuItems/ButtonWithIcon.vue';

const annotationHistoryStore = useAnnotationHistoryStore();
const modelStore = useModelStore();

function undo(): boolean {
  annotationHistoryStore.selected()?.previous();
  return false;
}

function redo(): boolean {
  annotationHistoryStore.selected()?.next();
  return false;
}

function reset(): boolean {
  annotationHistoryStore.selected()?.clear();
  runDetection();
  return false;
}

function runDetection() {
  const history = annotationHistoryStore.selected();
  if (!history) return;
  if (!history.file.center) return;
  modelStore.model?.detect(history.file).then((graphs) => {
    if (graphs === null) {
      return;
    }
    history.clear();
    history.append(graphs);
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

<style scoped></style>
