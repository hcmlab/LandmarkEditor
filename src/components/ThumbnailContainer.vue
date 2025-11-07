<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { SaveStatus } from '@/enums/saveStatus';
import { FileAnnotationHistory } from '@/cache/fileAnnotationHistory';
import { Point2D } from '@/graph/point2d';
import { imageFromFile } from '@/util/imageFromFile';

const props = defineProps({
  history: {
    type: FileAnnotationHistory<Point2D>,
    required: true
  },
  imageSize: {
    type: Number,
    default: 100
  }
});

defineEmits(['click']);

// Canvas reference
const canvas = ref<HTMLCanvasElement | null>(null);
const href = ref('#');
const image = new Image();

onMounted(async () => {
  image.onload = () => draw();
  image.src = await imageFromFile(props.history.file.filePointer);
});

const draw = () => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;
  const size = canvas.value.offsetWidth;
  canvas.value.width = size;
  canvas.value.height = size;

  const scale = size / Math.max(image.width, image.height);
  const offX = (size - image.width * scale) / 2;
  const offY = (size - image.height * scale) / 2;

  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(image, offX, offY, image.width * scale, image.height * scale);
};

const iconClass = computed(() => {
  switch (props.history.status) {
    case SaveStatus.unedited: {
      return 'bi-floppy text-secondary';
    }
    case SaveStatus.edited: {
      return 'bi-floppy text-warning';
    }
    case SaveStatus.saved: {
      return 'bi-check text-success';
    }
  }
  return '';
});

const iconDescription = computed(() => {
  switch (props.history.status) {
    case SaveStatus.unedited: {
      return 'Annotation has not been Edited';
    }
    case SaveStatus.edited: {
      return 'Annotation has been changed but not saved';
    }
    case SaveStatus.saved: {
      return 'Annotation has been saved';
    }
    default: {
      return '';
    }
  }
});

watch(
  () => props.history.file,
  async (newSrc) => {
    image.src = await imageFromFile(newSrc.filePointer);
  }
);
</script>

<template>
  <div class="thumbnail" @click="$emit('click', props.history.file)">
    <a class="overlap-container" :href="href">
      <canvas
        ref="canvas"
        class="d-block img-thumbnail w-100 box-sizing-border-box"
        :width="imageSize"
        :height="imageSize"
      />
      <div
        :class="[
          'p-1 w-100 bg-dark bg-opacity-50 rounded border border-dark d-flex justify-content-center align-items-center',
          { 'd-none': history.status === SaveStatus.unedited }
        ]"
      >
        <i :class="'bi ' + iconClass" style="font-size: 6vh"></i>
        <span class="visually-hidden">{{ iconDescription }}</span>
      </div>
    </a>
  </div>
</template>

<style scoped>
.thumbnail .overlap-container {
  position: relative;
  cursor: pointer;
}
.thumbnail canvas {
  object-fit: cover;
}
.thumbnail div {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.box-sizing-border-box {
  box-sizing: border-box;
}
</style>
