<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{ topText: string; icon: string; modelValue: number }>();
const emit = defineEmits(['update:modelValue']);

const sliderValue = ref(props.modelValue);
const barId = ref('threshold_' + props.topText.replace(' ', '_'));

// Watch for changes in sliderValue and emit the new value
watch(sliderValue, (newValue) => {
  emit('update:modelValue', newValue);
});

// Watch for changes in props.modelValue and update sliderValue
watch(
  () => props.modelValue,
  (newValue) => {
    sliderValue.value = newValue;
  }
);
</script>

<template>
  <div class="form" style="padding-top: 0.2vw; padding-bottom: 0.2vw">
    <div class="d-flex flex-column w-100 align-items-center">
      <label :for="barId" class="form-label">
        <b>
          <i class="bi" :class="icon"></i>
          {{ props.topText }}
        </b>
      </label>
    </div>
    <div class="d-flex align-items-center justify-content-around">
      <div class="me-2">{{ Math.round(sliderValue * 100) / 100 }}%</div>
      <input
        :id="barId"
        v-model.number="sliderValue"
        type="range"
        class="form-range"
        min="0"
        max="100"
      />
    </div>
  </div>
</template>
