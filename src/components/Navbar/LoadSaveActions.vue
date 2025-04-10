<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Point3D } from '@/graph/point3d';
import { ModelType } from '@/enums/modelType';
import { useModelStore } from '@/stores/modelStore';
import { useAnnotationHistoryStore } from '@/stores/annotationHistoryStore';
import ButtonWithIcon from '@/components/MenuItems/ButtonWithIcon.vue';
import getFormattedTimestamp from '@/util/formattedTimestamp';
import { FileAnnotationHistory } from '@/cache/fileAnnotationHistory';
import type { AnnotationData } from '@/model/modelApi';
import { useImageLoadStore } from '@/stores/imageLoadStore';

const modelStore = useModelStore();
const annotationHistoryStore = useAnnotationHistoryStore();
const imageLoadStore = useImageLoadStore();

const imageInput = ref();
const annotationInput = ref();

function openImage(): void {
  imageLoadStore.showLoadModal = true;
}

function openAnnotation() {
  annotationInput.value.click();
}

function saveAnnotation(download: boolean): void {
  if (annotationHistoryStore.empty()) {
    return;
  }

  const result = annotationHistoryStore.collectAnnotations();
  if (Object.keys(result).length <= 0) {
    return;
  }

  modelStore.model.uploadAnnotations(result);

  if (!download) return;

  const dataStr: string = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result));
  const a: HTMLAnchorElement = document.createElement('a');
  a.id = 'download-all';
  a.href = dataStr;
  a.download = 'face_mesh_annotations_' + getFormattedTimestamp() + '.json';
  a.click();
}

onMounted(() => {
  imageInput.value.onchange = () => {
    if (imageInput.value.files) {
      const files: File[] = Array.from(imageInput.value.files);
      files.forEach((f) => {
        annotationHistoryStore.add(f, modelStore.model);
      });
    }
  };

  annotationInput.value.onchange = () => {
    if (!annotationInput.value.files) return;
    if (annotationInput.value.files.length <= 0) return;
    const annotationFile: File = annotationInput.value.files[0];
    const reader: FileReader = new FileReader();
    reader.onload = (_) => {
      const parsedData: AnnotationData = JSON.parse(reader.result as string);
      Object.keys(parsedData).forEach((filename) => {
        const rawData = parsedData[filename];
        // cancel for additional keys that don't describe graphs
        if (typeof rawData === 'string') {
          return;
        }
        const sha = rawData.sha256;
        if (!sha) {
          // Todo: error popup
          return;
        }
        const history = annotationHistoryStore.find(filename, sha);
        if (!history) {
          // Todo: inform the user the data cant be parsed for this image
          return;
        }
        const h = FileAnnotationHistory.fromJson(rawData, history.file,(id, neighbors) => new Point3D(id, 0, 0, 0, neighbors));
        if (!h) {
          // Todo: error popup
          return;
        }
        history.clear();
        history.append(h);
      });
    };
    reader.readAsText(annotationFile);
  };
})

// @ts-expect-error the error complains that not all code paths return something.
// This is completely intended. Since returning anything triggers a popup
onBeforeUnmount(() => {
  if (annotationHistoryStore.getUnsaved()) {
    if (modelStore.model.type() === ModelType.custom) {
      saveAnnotation(false);
    } else {
      return '?';
    }
  }
});
</script>

<template>
  <input id=image-input ref="imageInput" type=file accept=image/* multiple hidden>
  <input id=annotation-input ref="annotationInput" type=file accept=.json,application/json hidden>
  <BNavItemDropdown
    id="file-dropdown"
    text="File"
    class="pt-1"
    variant="light"
    auto-close="outside"
  >
    <BDropdownItem>
      <button-with-icon
        text="Open Images"
        icon="bi-folder2-open"
        shortcut="Control+O"
        @click="openImage"
      />
    </BDropdownItem>
    <BDropdownItem>
      <button-with-icon
        text="Open Annotations"
        icon="bi-folder2-open"
        shortcut="Control+A"
        @click="openAnnotation"
      />
    </BDropdownItem>
    <BDropdownItem>
      <button-with-icon
        text="Download all"
        icon="bi-download"
        shortcut="Control+S"
        @click="saveAnnotation(true)"
      />
    </BDropdownItem>
  </BNavItemDropdown>
</template>

<style scoped></style>
