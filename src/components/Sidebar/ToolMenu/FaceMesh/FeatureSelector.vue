<script setup lang="ts">
import {
  FACE_FEATURE_LEFT_EYE,
  FACE_FEATURE_LEFT_EYEBROW,
  FACE_FEATURE_LIPS,
  FACE_FEATURE_NOSE,
  FACE_FEATURE_RIGHT_EYE,
  FACE_FEATURE_RIGHT_EYEBROW
} from '@/graph/face_landmarks_features';
import ButtonWithIcon from '@/components/MenuItems/ButtonWithIcon.vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';
import { AnnotationTool } from '@/enums/annotationTool';

const tools = useAnnotationToolStore();

const features = ['Left Eye', 'Left Eyebrow', 'Right Eye', 'Right Eyebrow', 'Nose', 'Mouth'];

function deleteFeature(feature: string) {
  const selectedHistory = tools.getSelectedHistory();
  if (!selectedHistory) {
    throw new Error('Failed to get histories on feature deletion.');
  }
  const graph = selectedHistory.get(AnnotationTool.FaceMesh);
  if (!graph) return;
  switch (feature) {
    case 'Left Eye':
      graph.deletePoints(FACE_FEATURE_LEFT_EYE);
      break;
    case 'Left Eyebrow':
      graph.deletePoints(FACE_FEATURE_LEFT_EYEBROW);
      break;
    case 'Right Eye':
      graph.deletePoints(FACE_FEATURE_RIGHT_EYE);
      break;
    case 'Right Eyebrow':
      graph.deletePoints(FACE_FEATURE_RIGHT_EYEBROW);
      break;
    case 'Nose':
      graph.deletePoints(FACE_FEATURE_NOSE);
      break;
    case 'Mouth':
      graph.deletePoints(FACE_FEATURE_LIPS);
      break;
    default:
      throw new Error('No feature "' + feature + '" found to delete!');
  }
  selectedHistory.add(graph, AnnotationTool.FaceMesh);
}
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
  <div v-for="feature in features" :key="feature">
    <button-with-icon :text="feature" icon="bi-trash" shortcut="" @click="deleteFeature(feature)" />
  </div>
</template>
