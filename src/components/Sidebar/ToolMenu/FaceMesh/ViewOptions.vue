<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useFaceMeshConfig } from '@/stores/ToolSpecific/faceMeshConfig';

const editorConfigStore = useFaceMeshConfig();
const isTesselationChecked = ref(editorConfigStore.showTesselation);

const handleTesselationChange = () => {
  editorConfigStore.showTesselation = isTesselationChecked.value;
};

onMounted(() => {
  isTesselationChecked.value = editorConfigStore.showTesselation;
  watch(
    () => editorConfigStore.showTesselation,
    (newVal) => {
      isTesselationChecked.value = newVal;
    }
  );
});
</script>

<template>
  <div class="d-flex flex-column w-100 align-items-center">
    <div>
      <b>
        <i class="bi bi-eye me-1"></i>
        View
      </b>
    </div>
  </div>
  <b-form-group>
    <b-form-checkbox
      v-model="isTesselationChecked"
      switch
      view-tesselation
      aria-checked="mixed"
      @change="handleTesselationChange"
    >
      Tesselation
    </b-form-checkbox>
  </b-form-group>
  <div class="mb-2" />
</template>

<style scoped></style>
