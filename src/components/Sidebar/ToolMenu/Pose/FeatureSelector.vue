<script setup lang="ts">
import { ref } from 'vue';
import ButtonWithIcon from '@/components/MenuItems/ButtonWithIcon.vue';
import { AnnotationTool } from '@/enums/annotationTool';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';
import {
  POSE_FEATURE_LEFT_EYE,
  POSE_FEATURE_MOUTH,
  POSE_FEATURE_NOSE,
  POSE_FEATURE_RIGHT_EYE
} from '@/Editors/PoseEditor';

const features = ['Left Eye', 'Right Eye', 'Nose', 'Mouth'];
const deletedFeatures = ref<Array<string>>([]);

const tools = useAnnotationToolStore();

function deleteFeature(feature: string) {
  const selectedHistory = tools.getSelectedHistory();
  if (!selectedHistory) {
    throw new Error('Failed to get histories on feature deletion.');
  }
  const graph = selectedHistory.get(AnnotationTool.Pose);
  if (!graph) return;

  switch (feature) {
    case 'Left Eye':
      graph.deletePoints(POSE_FEATURE_LEFT_EYE);
      break;
    case 'Right Eye':
      graph.deletePoints(POSE_FEATURE_RIGHT_EYE);
      break;
    case 'Nose':
      graph.deletePoints(POSE_FEATURE_NOSE);
      break;
    case 'Mouth':
      graph.deletePoints(POSE_FEATURE_MOUTH);
      break;
    default:
      throw new Error('No feature "' + feature + '" found to delete!');
  }
  deletedFeatures.value.push(feature);
  selectedHistory.add(graph, AnnotationTool.Pose);
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

  <div
    v-for="feature in features.filter(
      (deleted_feature) => !deletedFeatures.includes(deleted_feature)
    )"
    :key="'pose_' + feature"
  >
    <button-with-icon :text="feature" icon="bi-trash" shortcut="" @click="deleteFeature(feature)" />
  </div>
</template>
