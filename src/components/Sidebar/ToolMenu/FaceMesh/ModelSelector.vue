<script setup lang="ts">
import * as bootstrap from 'bootstrap'; // import statically - don't grab it from a cdn
import $ from 'jquery';
import { ref } from 'vue';
import { ModelType } from '@/enums/modelType';
import { WebServiceModel } from '@/model/webservice';
import { MediapipeModel } from '@/model/mediapipe';
import { useModelStore } from '@/stores/modelStore';
import { urlError } from '@/enums/urlError';
import WebserviceSelectModal from '@/components/Modals/WebserviceSelectModal.vue';
import { useAnnotationHistoryStore } from '@/stores/annotationHistoryStore';

const modelStore = useModelStore();
const annotationHistoryStore = useAnnotationHistoryStore();
const showModal = ref(false);

function openModal(): void {
  showModal.value = true;
}

function setModel(model: ModelType): boolean {
  if (model === ModelType.custom) {
    $('#sendAnno').show(0.1);
  } else {
    $('#sendAnno').hide(0.1);
  }

  const btnMediapipe = document.getElementById('btnModelMediapipe') as HTMLInputElement;
  const btnCustom = document.getElementById('btnModelCustom') as HTMLInputElement;
  switch (model) {
    case ModelType.mediapipe: {
      btnMediapipe.checked = true;
      modelStore.model = new MediapipeModel();
      showModal.value = false;
      break;
    }
    case ModelType.custom: {
      btnCustom.checked = true;
      const inputBox = $('#modelurl');
      const url = String(inputBox.val()).trim();

      WebServiceModel.verifyUrl(url).then((error) => {
        const errorText = $('#urlErrorText');
        if (error === null) {
          modelStore.model = new WebServiceModel(url);
          showModal.value = false;
          errorText.hide();
          const saveElement = $('#saveNotification')[0];
          const toast = bootstrap.Toast.getOrCreateInstance(saveElement);
          toast.show();
          localStorage.setItem('apiUrl', url);
          const notificationText = $('#saveNotificationText');
          notificationText.text('Webservice url saved!');
          annotationHistoryStore.histories().forEach((history) => {
            modelStore.model?.detect(history.file).then((graphs) => {
              if (graphs === null) {
                return;
              }
              history.clear();
              history.append(graphs);
            });
          });
          setTimeout(() => {
            toast.hide();
            notificationText.text();
          }, 5000);
        } else {
          // Display error:
          switch (error) {
            case urlError.InvalidUrl: {
              errorText.removeAttr('hidden');
              errorText.text('Please enter a valid URL!');
              break;
            }
            case urlError.Unreachable: {
              errorText.removeAttr('hidden');
              errorText.text("The provided endpoint wasn't reachable!");
              break;
            }
          }
          // shake the input window
          inputBox.addClass('wrongInput');
          setTimeout(function () {
            inputBox.removeClass('wrongInput');
          }, 500);
        }
      });
      break;
    }
    default:
      console.error('No model "' + model + '" found to change to!');
      break;
  }
  return false;
}
</script>

<template>
  <div>
    <div class="d-flex flex-column w-100 align-items-center">
      <div>
        <b>
          <i class="bi bi-cpu me-1"></i>
          Model
        </b>
      </div>
    </div>

    <fieldset class="btn-group" role="group" style="padding: 0.2vw; width: 100%">
      <input
        type="radio"
        class="btn-check"
        name="btnradio"
        id="btnModelMediapipe"
        autocomplete="off"
        @change="setModel(ModelType.mediapipe)"
        checked
      />
      <label class="btn btn-outline-secondary" for="btnModelMediapipe"
        >Mediapipe<br /><small>Offline</small></label
      >
      <input
        type="radio"
        class="btn-check"
        name="btnradio"
        id="btnModelCustom"
        autocomplete="off"
        @change="openModal"
      />
      <label class="btn btn-outline-secondary" for="btnModelCustom"
        >Webservice<br /><small>Online</small></label
      >
    </fieldset>
    <div class="mb-2" />
  </div>

  <WebserviceSelectModal @changeModel="(model) => setModel(model)" v-model="showModal" />
</template>
