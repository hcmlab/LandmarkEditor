<script setup lang="ts">
import { ref, watch } from 'vue';
import { BModal } from 'bootstrap-vue-next';
import { ModelType } from '@/enums/modelType';

// Props and Emits
const props = defineProps<{ modelValue: boolean }>();
const emits = defineEmits<{
  (e: 'input', value: boolean): void;
  (e: 'changeModel', value: ModelType): void;
}>();

// Refs
const isModalVisible = ref(props.modelValue);

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    isModalVisible.value = newValue;
  }
);

watch(isModalVisible, (newValue) => {
  emits('input', newValue);
});
</script>

<template>
  <BModal v-model="isModalVisible" title="Webservice" :hide-footer="true">
    <p>
      The webservice address will be used to detect a face mesh on selected images. Therefore, the
      images must be transferred to the webservice for processing. The open format allows it to
      create individual webservices by everyone and can be easily swapped.
    </p>
    <div class="alert alert-warning d-flex align-items-center" role="alert">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"
        viewBox="0 0 16 16"
        aria-label="Warning:"
        style="width: 2vw"
      >
        <path
          d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
        />
      </svg>
      <div>Be aware, that the webservice owner might store your images and annotations!</div>
    </div>
    <hr />
    <h6>API</h6>
    <p>
      The webservice API must provide the following addresses:
      <br /><code>/detect</code><br />
      This call is used to detect a single face on a provided image file inside a POST request.
      <br /><code>/annotations</code><br />
      This call is used to sync the annotations inside a POST request when the user triggers the
      download.
    </p>
    <hr />
    <h6>URL</h6>
    <p>
      Insert the webservice URL in the text field below and submit with hitting the Save button.
    </p>
    <div id="urlErrorText" class="text-danger" hidden></div>
    <label for="modelurl" class="form-label" hidden></label>
    <input
      id="modelurl"
      type="url"
      class="form-control"
      placeholder="https://example.com/model/api"
      required
    />
    <div class="modal-footer">
      <button
        id="btnCancelModal"
        type="button"
        class="btn btn-secondary"
        data-bs-dismiss="modal"
        @click="emits('changeModel', ModelType.mediapipe)"
      >
        Cancel
      </button>
      <button
        id="btnSaveCustomModel"
        type="submit"
        class="btn btn-primary"
        @click="emits('changeModel', ModelType.custom)"
      >
        Save
      </button>
    </div>
  </BModal>
</template>
