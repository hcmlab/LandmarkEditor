<script setup lang="ts">
import * as bootstrap from 'bootstrap'; // import statically - don't grab it from a cdn
import $ from 'jquery';
import { ref } from 'vue';
import { WebServiceModel } from '@/model/webservice';
import { MediapipeModel } from '@/model/mediapipe';
import { urlError } from '@/enums/urlError';
import WebserviceSelectModal from '@/components/Modals/WebserviceSelectModal.vue';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';
import { AnnotationTool } from '@/enums/annotationTool';
import { ModelType } from '@/enums/modelType.ts';

const tools = useAnnotationToolStore();
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
    case ModelType.mediapipeFaceMesh: {
      btnMediapipe.checked = true;
      tools.models.set(AnnotationTool.FaceMesh, new MediapipeModel());
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
          tools.models.set(AnnotationTool.FaceMesh, new WebServiceModel(url));
          showModal.value = false;
          errorText.hide();
          const saveElement = $('#saveNotification')[0];
          const toast = bootstrap.Toast.getOrCreateInstance(saveElement);
          toast.show();
          localStorage.setItem('apiUrl', url);
          const notificationText = $('#saveNotificationText');
          notificationText.text('Webservice url saved!');

          const histories = tools.allHistories;
          if (!histories) {
            console.log('Failed to retrieve history on API change.');
            return;
          }

          const model = tools.getModel(AnnotationTool.FaceMesh);
          if (!model) {
            throw new Error('Failed to retrieve model on API change.');
          }

          histories.forEach((history) => {
            model.detect(history.file).then((graphs) => {
              if (graphs === null) {
                return;
              }
              history.clear();
              history.merge(graphs, AnnotationTool.FaceMesh);
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
      throw new Error(`No model "${model}" found to change to!`);
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
        id="btnModelMediapipe"
        type="radio"
        class="btn-check"
        name="btnradio"
        autocomplete="off"
        checked
        @change="setModel(ModelType.mediapipeFaceMesh)"
      />
      <label class="btn btn-outline-secondary" for="btnModelMediapipe"
        >Mediapipe<br /><small>Offline</small></label
      >
      <input
        id="btnModelCustom"
        type="radio"
        class="btn-check"
        name="btnradio"
        autocomplete="off"
        @change="openModal"
      />
      <label class="btn btn-outline-secondary" for="btnModelCustom"
        >Webservice<br /><small>Online</small></label
      >
    </fieldset>
    <div class="mb-2" />
  </div>

  <WebserviceSelectModal v-model="showModal" @change-model="(model) => setModel(model)" />
</template>
