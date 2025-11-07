<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{ running: boolean }>();
const isRunning = ref(props.running);

watch(
  () => props.running,
  (newVal) => {
    isRunning.value = newVal;
  },
  {
    deep: true,
    immediate: true
  }
);
</script>

<template>
  <div v-if="isRunning" class="d-flex justify-center align-items-center-center w-100">
    <BSpinner class="mx-1" small variant="primary" /> Processing...
  </div>
</template>

<style scoped></style>
