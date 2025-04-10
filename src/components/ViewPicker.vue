<script lang="ts" setup>
import { ref } from 'vue';
import { Orientation } from '@/enums/orientation';
import { useAnnotationHistoryStore } from '@/stores/annotationHistoryStore';

const historyStore = useAnnotationHistoryStore();
const show = ref<boolean>(false);

const handleClick = (view: Orientation) => {
  const h = historyStore.selected();
  if (!h) return;
  h.file.selected = view;
};

historyStore.$subscribe(() => {
  show.value = historyStore.selected() !== null;
});
</script>

<template>
  <div
    v-if="show"
    class="position-absolute top-0 end-0 w-20 border bg-body-secondary d-flex justify-content-around m-2 p-2 rounded"
  >
    <BButton @click="handleClick(Orientation.left)">
      <div style="transform: rotateY(60deg)">
        <i class="bi bi-person"></i>
      </div>
    </BButton>
    <BButton @click="handleClick(Orientation.center)">
      <i class="bi bi-person"></i>
    </BButton>
    <BButton @click="handleClick(Orientation.right)">
      <div style="transform: rotateY(-60deg)">
        <i class="bi bi-person"></i>
      </div>
    </BButton>
  </div>
</template>

<style scoped></style>
