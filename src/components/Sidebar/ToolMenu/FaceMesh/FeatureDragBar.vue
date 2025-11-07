<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { usePointMoveConfig } from '@/stores/ToolSpecific/pointMoveConfig';

const commonConfig = usePointMoveConfig();

const featureDragValue = ref(0);

function handleWheelEvent(e: WheelEvent) {
  if (e.shiftKey) {
    addFeatureDrag(e.deltaY / 100);
  }
}

onMounted(() => {
  window.addEventListener('wheel', handleWheelEvent, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('wheel', handleWheelEvent);
});

function addFeatureDrag(value: number): void {
  featureDragValue.value = Math.min(5, Math.max(0, featureDragValue.value + value));
}

watch(featureDragValue, (newValue) => {
  commonConfig.dragDepth = newValue;
});
</script>

<template>
  <div class="form" style="padding-top: 0.2vw; padding-bottom: 0.2vw">
    <div class="d-flex flex-column w-100 align-items-center">
      <label for="feature_drag" class="form-label" aria-keyshortcuts="Shift+Wheel">
        <b>
          <i class="bi bi-bounding-box-circles pe-1"></i>
          Drag Depth
        </b>
      </label>
    </div>
    <div class="d-flex align-items-center justify-content-around">
      <div class="me-2">{{ Math.round(featureDragValue) }}</div>
      <input
        id="feature-drag"
        v-model="featureDragValue"
        type="range"
        class="form-range"
        min="0"
        max="5"
        step="1"
      />
    </div>
  </div>
</template>

<style scoped></style>
