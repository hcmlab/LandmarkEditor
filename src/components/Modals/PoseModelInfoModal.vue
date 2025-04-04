<script lang="ts" setup>
import { BModal } from 'bootstrap-vue-next';
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const showModal = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newVal) => {
    showModal.value = newVal;
  }
);

watch(
  () => showModal.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  }
);
</script>

<template>
  <BModal
    v-model="showModal"
    :cancel-disabled="true"
    centered
    title="Pose model type information"
    @close="showModal = false"
  >
    <p>
      You can choose different weights and setups for the pose estimation model. The type describes
      the calculation effort. From <code>lite</code> to <code>heavy</code>. The
      <code>lite</code> model is the fastest and the <code>heavy</code> is the most accurate but
      also the slowest.
    </p>
    <p>
      <a
        href="https://storage.googleapis.com/mediapipe-assets/Model%20Card%20BlazePose%20GHUM%203D.pdf"
        >More Information</a
      >
      about the different models. Scroll down in the file for accuracy data.
    </p>

    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th scope="col">
            <b>Model</b>
          </th>
          <th scope="col">
            <b>Accuracy</b>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Lite</td>
          <td>87.0</td>
        </tr>
        <tr>
          <td>Full</td>
          <td>91.8</td>
        </tr>
        <tr>
          <td>Heavy</td>
          <td>94.2</td>
        </tr>
      </tbody>
    </table>
  </BModal>
</template>

<style scoped></style>
