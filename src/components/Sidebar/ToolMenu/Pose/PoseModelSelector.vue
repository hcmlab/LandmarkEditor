<script lang="ts" setup>
import { defineEmits, defineProps, ref } from 'vue';
import { PoseModelType, poseModelTypes } from '@/model/mediapipePose';
import PoseModelInfoModal from '@/components/Modals/PoseModelInfoModal.vue';

const props = defineProps({
  modelType: {
    type: String as () => PoseModelType,
    required: true
  }
});

const emit = defineEmits(['change']);

const showModelInfoModal = ref(false);
const modelType = ref<PoseModelType>(props.modelType);

function updateModelType(type: PoseModelType) {
  emit('change', type);
  modelType.value = type;
}

const accurarys = {
  [PoseModelType.LITE]: '87.0%',
  [PoseModelType.FULL]: '91.8%',
  [PoseModelType.HEAVY]: '94.2%'
};
</script>

<template>
  <div class="d-flex flex-row w-100 align-items-center justify-content-evenly">
    <b>
      <i class="bi bi-cpu me-1"></i>
      Model
    </b>
    <div class="" style="cursor: pointer" @click="showModelInfoModal = true">
      <i class="bi bi-info-circle fs-5" />
    </div>
  </div>
  <fieldset
    aria-label="Pose model selection"
    class="btn-group w-100 d-flex flex-col align-items-center"
  >
    <label
      v-for="(type, idx) in poseModelTypes"
      :key="'label_pose_' + idx"
      :class="{
        'btn-outline-secondary': type !== modelType,
        'btn-secondary': type === modelType
      }"
      :for="'btnPoseModel_' + type"
      class="btn text-center"
    >
      {{ type }}
      <small>{{ accurarys[type] }} </small>
      <input
        :id="'btnPoseModel_' + type"
        :key="'pose_model_' + idx"
        :checked="modelType === type"
        :disabled="modelType === type"
        autocomplete="off"
        class="btn-check"
        name="btn-radio-pose-model"
        type="radio"
        @change="updateModelType(type)"
      />
    </label>
  </fieldset>
  <PoseModelInfoModal v-model="showModelInfoModal" />
</template>
