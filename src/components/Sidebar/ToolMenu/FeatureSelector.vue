<script setup lang="ts">
import ButtonWithIcon from '@/components/MenuItems/ButtonWithIcon.vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';
import { allBodyFeatures } from '@/enums/bodyFeature';

const tools = useAnnotationToolStore();
</script>

<template>
  <div class="d-flex flex-column w-100 align-items-center">
    <div>
      <b>
        <i class="bi bi-gear me-1"></i>
        Features
      </b>
    </div>
  </div>
  <div v-for="feature in allBodyFeatures" :key="feature">
    <button-with-icon
      :text="feature"
      :icon="
        tools.getSelectedHistory()?.deletedFeatures.has(feature)
          ? 'bi-arrow-counterclockwise'
          : 'bi-trash'
      "
      shortcut=""
      @click="tools.toggleFeature(feature)"
    />
  </div>
</template>
