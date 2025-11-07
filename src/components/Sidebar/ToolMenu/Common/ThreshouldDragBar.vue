<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps<{
  topText: string;
  icon: string;
  modelValue: number;
  disabled: boolean;
}>();
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
          <i :class="icon" class="bi"></i>
          {{ props.topText }}
        </b>
      </label>
    </div>
    <div class="d-flex align-items-center justify-content-around">
      <div class="me-2">{{ Math.round(sliderValue * 100) / 100 }}%</div>
      <input
        :id="barId"
        v-model.number="sliderValue"
        :disabled="props.disabled"
        class="form-range"
        max="100"
        min="0"
        type="range"
      />
    </div>
  </div>
</template>
