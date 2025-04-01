<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Point3D } from '@/graph/point3d';
import { Point2D } from '@/graph/point2d';
import ButtonWithIcon from '@/components/MenuItems/ButtonWithIcon.vue';
import getFormattedTimestamp from '@/util/formattedTimestamp';
import { FileAnnotationHistory } from '@/cache/fileAnnotationHistory';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';
import { AnnotationTool } from '@/enums/annotationTool';
import { SaveStatus } from '@/enums/saveStatus';
import { type AnnotationData, type ToolConfig, isToolConfig } from '@/graph/serialisedData.ts';
import { useFaceMeshConfig } from '@/stores/ToolSpecific/faceMeshConfig.ts';
import { useHandConfig } from '@/stores/ToolSpecific/handConfig.ts';
import { usePoseConfig } from '@/stores/ToolSpecific/poseConfig.ts';

const tools = useAnnotationToolStore();
const faceConfig = useFaceMeshConfig();
const handConfig = useHandConfig();
const poseConfig = usePoseConfig();

const imageInput = ref();
const annotationInput = ref();

function openImage(): void {
  imageInput.value.click();
}

function openAnnotation() {
  annotationInput.value.click();
}

function saveAnnotation(download: boolean): void {
  const h = tools.histories;
  if (!h) {
    throw new Error('Failed to retrieve histories for saving');
  }
  if (h.empty) {
    return;
  }

  const result: AnnotationData = h.collectAnnotations();
  if (Object.keys(result).length <= 0) {
    return;
  }

  const model = tools.getModel(AnnotationTool.FaceMesh);
  if (!model) {
    throw new Error('Failed to retrieve model during annotation upload.');
  }

  model.uploadAnnotations(result);

  if (!download) return;

  result.config = getToolConfigData();
  const dataStr: string =
    'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result));
  const a: HTMLAnchorElement = document.createElement('a');
  a.id = 'download-all';
  a.href = dataStr;
  a.download = 'face_mesh_annotations_' + getFormattedTimestamp() + '.json';
  a.click();
}

function onFileLoad(reader: FileReader): void {
  const parsedData: AnnotationData = JSON.parse(reader.result as string);
  Object.keys(parsedData).forEach((filename) => {
    const rawData = parsedData[filename];
    if (!rawData) {
      throw new Error(`Failed to retrieve annotation data for ${filename}`);
    }
    // cancel for additional keys that don't describe graphs
    if (typeof rawData === 'string' || isToolConfig(rawData)) {
      return;
    }
    const sha = rawData.sha256;
    if (!sha) {
      throw new Error(
        `Tried to load annotation data for matching filename ${filename} but not matching hash`
      );
    }
    const histories = tools.histories;
    if (!histories) {
      throw new Error('Failed to retrieve histories for loading annotation data');
    }
    const history = histories.find(filename, sha);
    if (!history) {
      throw new Error(`Tried to load annotation data for nonexistent file: ${filename}`);
    }
    let h = FileAnnotationHistory.fromJson(
      rawData,
      history.file,
      (id, neighbors) => new Point3D(id, 0, 0, 0, neighbors)
    );
    if (!h) {
      throw new Error(`Failed to parse histories for ${filename}`);
    }
    history.clear();

    // Add tools that are in the annotation data but not used already
    // eslint-disable-next-line no-loops/no-loops
    for (const key of h.keys()) {
      if (!tools.getUsedTools().has(key)) {
        tools.tools.add(key);
      }
    }
    history.mergeMultipleTools(h);
  });
  parseToolConfigData(parsedData);
}

function getToolConfigData() {
  return {
    faceMinDetectionConf: faceConfig.modelOptions.minFaceDetectionConfidence,
    faceMinPresenceConf: faceConfig.modelOptions.minFacePresenceConfidence,
    handMinDetectionConf: handConfig.modelOptions.minHandDetectionConfidence,
    handMinPresenceConf: handConfig.modelOptions.minHandPresenceConfidence,
    poseMinDetectionConf: poseConfig.modelConfig.minPoseDetectionConfidence,
    poseMinPresenceConf: poseConfig.modelConfig.minPosePresenceConfidence,
    poseModelType: poseConfig.modelType
  } as ToolConfig;
}

function parseToolConfigData(parsedData: AnnotationData): void {
  const toolConfig = parsedData.config as ToolConfig;
  if (!toolConfig) {
    return; // No tool config data to parse
  }

  if (!isToolConfig(toolConfig)) {
    throw new Error('Invalid tool config data format');
  }
  faceConfig.modelOptions.minFaceDetectionConfidence = toolConfig.faceMinDetectionConf;
  faceConfig.modelOptions.minFacePresenceConfidence = toolConfig.faceMinPresenceConf;

  handConfig.modelOptions.minHandDetectionConfidence = toolConfig.handMinDetectionConf;
  handConfig.modelOptions.minHandPresenceConfidence = toolConfig.handMinPresenceConf;

  poseConfig.modelConfig.minPoseDetectionConfidence = toolConfig.poseMinDetectionConf;
  poseConfig.modelConfig.minPosePresenceConfidence = toolConfig.poseMinPresenceConf;
  poseConfig.modelType = toolConfig.poseModelType;
}

function handleLeave(event: BeforeUnloadEvent) {
  const histories = tools.getAllHistories();

  if (!Array.isArray(histories)) {
    throw new Error('Failed to retrieve histories for saving during shutdown');
  }

  histories.forEach((h: FileAnnotationHistory<Point2D>) => {
    tools.getUsedTools().forEach((tool) => {
      const model = tools.getModel(tool);
      if (!model) {
        throw new Error('Failed to retrieve model for saving during shutdown');
      }
      if (h.status === SaveStatus.edited && model.shouldUpload) {
        saveAnnotation(false);
      }
    });
  });

  if (tools.histories.unsaved.length > 0) {
    event.preventDefault();
    event.returnValue = '';
  }
}

onMounted(() => {
  imageInput.value.onchange = () => {
    if (imageInput.value.files) {
      const files: File[] = Array.from(imageInput.value.files);
      files.forEach((f) => tools.histories.add(f, tools.getUsedModels()));
    }
  };

  annotationInput.value.onchange = () => {
    if (!annotationInput.value.files) return;
    if (annotationInput.value.files.length <= 0) return;
    const annotationFile: File = annotationInput.value.files[0];
    const reader: FileReader = new FileReader();
    reader.onload = (_) => onFileLoad(reader);
    reader.readAsText(annotationFile);
  };

  window.addEventListener('beforeunload', handleLeave);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleLeave);
});
</script>

<template>
  <input id="image-input" type="file" accept="image/*" multiple hidden ref="imageInput" />
  <input
    id="annotation-input"
    type="file"
    accept=".json,application/json"
    hidden
    ref="annotationInput"
  />
  <BNavItemDropdown
    text="File"
    class="pt-1"
    variant="light"
    auto-close="outside"
    id="file-dropdown"
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
