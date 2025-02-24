<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { BvTriggerableEvent } from 'bootstrap-vue-next';
import { useImageLoadStore } from '@/stores/imageLoadStore';
import { ImageFile } from '@/imageFile';
import { guessOrientation, type orientationGuessResult } from '@/util/orientationGuesser';
import { Orientation } from '@/enums/orientation';
import { imageFromFile } from '@/util/imageFromFile';
import { useAnnotationHistoryStore } from '@/stores/annotationHistoryStore';
import { MultipleViewImage } from '@/interface/multiple_view_image';

const imageLoadStore = useImageLoadStore();
const disableHide = ref(true);
const imageCount = ref(0);
const progress = ref(0);
const imageInput = ref<HTMLInputElement | null>(null);
const orientations = ref<orientationGuessResult[]>([]);
const screenHeight = ref(window.innerHeight);
const processing = ref(false);
const confirmModal = ref(false);
const result = ref<MultipleViewImage[]>([]);
const showHelp = ref(false);

const selectedImages = ref<MultipleViewImage>(new MultipleViewImage());

watch(orientations, (newVal) => {
  nextTick().then(() => {
    newVal.forEach((res) => {
      const canvas = document.getElementById(res.image.sha + '-canvas') as HTMLCanvasElement;
      if (!canvas) {
        console.error('canvas not found');
        return;
      }
      drawImageToCanvas(canvas, res.image);
    });
  });
});

/**
 * Draws an image onto a given canvas element.
 *
 * @param canvas - The canvas element to draw the image on.
 * @param image - The image file to be drawn.
 * @return A promise that resolves when the image has been drawn to the canvas.
 */
async function drawImageToCanvas(canvas: HTMLCanvasElement, image: ImageFile) {
  const context = canvas.getContext('2d');
  if (!context) {
    console.error('context not found');
    return;
  }
  const img = new Image();
  img.src = await imageFromFile(image.filePointer);
  img.onload = () => {
    canvas.width = screenHeight.value * (img.width / img.height);
    canvas.height = screenHeight.value;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
  };
  img.onerror = (error) => {
    console.error('failed to load image', error);
  };
}

async function loadImages() {
  if (!imageInput.value) {
    console.error('imageInput not found on load click');
    return;
  }
  imageInput.value.click();
}

/**
 * Handles the escape event of the Main modal. Is used to stop the user from accidentally closing it.
 *
 * @param e - The event object representing the hide event.
 */
function handleHide(e: BvTriggerableEvent) {
  if (disableHide.value) {
    e.preventDefault();
  }
}

/**
 * Handles the logic for when an image is clicked by assigning the image to the corresponding
 * orientation slot in the selectedImages object.
 *
 * @param image - The image that was clicked and needs to be assigned.
 * @param direction - The direction (left, right, or center) to which the image should be assigned.
 */
function imageClicked(image: orientationGuessResult, direction: Orientation) {
  switch (direction) {
    case Orientation.left: {
      selectedImages.value.left = image;
      break;
    }
    case Orientation.right: {
      selectedImages.value.right = image;
      break;
    }
    case Orientation.center: {
      selectedImages.value.center = image;
      break;
    }
  }
}

function nextImage() {
  // early return if no image selected.
  if (!selectedImages.value.left && !selectedImages.value.center && !selectedImages.value.right) {
    disableHide.value = false;
    imageLoadStore.showLoadModal = false;
    confirmModal.value = true;
    return;
  }

  if (progress.value === imageCount.value) {
    disableHide.value = false;
    imageLoadStore.showLoadModal = false;
    confirmModal.value = true;
    return;
  }
  // remove selected images
  orientations.value = orientations.value.filter((value) => {
    return (
      !(
        selectedImages.value.left &&
        selectedImages.value.left.image.sha === value.image.sha &&
        selectedImages.value.left.orientation === Orientation.left
      ) &&
      !(
        selectedImages.value.right &&
        selectedImages.value.right.image.sha === value.image.sha &&
        selectedImages.value.right.orientation === Orientation.right
      ) &&
      !(
        selectedImages.value.center &&
        selectedImages.value.center.image.sha === value.image.sha &&
        selectedImages.value.center.orientation === Orientation.center
      )
    );
  });

  result.value.push(selectedImages.value);

  // clean up
  selectedImages.value = new MultipleViewImage();

  progress.value++;
  if (progress.value === imageCount.value) {
    disableHide.value = false;
    imageLoadStore.showLoadModal = false;
    confirmModal.value = true;
  }
}

function prevImage() {
  if (progress.value === 0) return;
  const last_image = result.value.pop() as MultipleViewImage;

  if (last_image.left) {
    orientations.value = [...orientations.value, last_image.left];
  }
  if (last_image.center) {
    orientations.value = [...orientations.value, last_image.center];
  }
  if (last_image.right) {
    orientations.value = [...orientations.value, last_image.right];
  }

  selectedImages.value = last_image;
  progress.value--;
}

/**
 * Callback when the input component is clicked. Loads all marked files and guesses their orientation.
 */
async function handleImageLoad() {
  if (!imageInput.value) {
    console.error('imageInput not found on change');
    return;
  }
  if (imageInput.value.files) {
    const files: File[] = Array.from(imageInput.value.files);
    const import_images: ImageFile[] = [];
    await Promise.all(
      files.map(async (file) => {
        const image = await ImageFile.create(file);
        import_images.push(image);
      })
    );
    processing.value = true;
    orientations.value = orientations.value.concat(await guessOrientation(import_images));
    imageCount.value = orientations.value.filter(
      (value) => value.orientation === Orientation.center
    ).length;

    if (
      orientations.value.filter((value) => value.orientation !== Orientation.center).length === 0
    ) {
      result.value = orientations.value.map((value) => {
        let res = new MultipleViewImage();
        res.selected = value.orientation;
        res.center = value as orientationGuessResult;
        return res;
      });
      save();
    }

    progress.value = 0;
    processing.value = false;
  }
}

const save = () => {
  const store = useAnnotationHistoryStore();
  store.merge(result.value as MultipleViewImage[]);
  imageLoadStore.showLoadModal = false;
};

const returnToLoad = () => {
  imageLoadStore.showLoadModal = true;
};

const updateScreenHeight = () => {
  screenHeight.value = window.innerHeight / 4;
};

const openHelp = () => {
  showHelp.value = true;
};

onMounted(() => {
  window.addEventListener('resize', updateScreenHeight);
  updateScreenHeight();

  if (!imageInput.value) {
    console.error('imageInput not found on mount');
    return;
  }
  imageInput.value.addEventListener('change', handleImageLoad);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenHeight);
});
</script>

<template>
  <BModal
    v-model="imageLoadStore.showLoadModal"
    centered
    hide-footer
    scrollable
    size="lg"
    title="Load images"
    @hide="handleHide"
  >
    <input ref="imageInput" accept="image/*" hidden multiple type="file" />
    <div class="d-flex flex-column h-100">
      <!-- the images to select -->
      <div>
        <div v-if="progress < imageCount && imageCount != 0">
          <div class="d-flex max-h-60vh position-relative">
            <!-- Left Images Section -->
            <h3>
              <a href="#" @click="openHelp" class="pe-auto">
                <i class="bi bi-question-square-fill position-absolute top-0 end-0 zindex-10"></i>
              </a>
            </h3>
            <div class="flex-grow-1 d-flex flex-column align-items-center w-33">
              <h2>Left</h2>
              <div class="overflow-y-auto">
                <div
                  v-for="res in orientations.filter((val) => val.orientation === Orientation.left)"
                  :id="res.image.sha + '-container'"
                  :key="res.image.sha"
                  class="overflow-y-auto"
                >
                  <BButton
                    :variant="
                      selectedImages.left?.image.sha === res.image.sha ? 'primary' : 'outline-dark'
                    "
                    class="w-100"
                    @click="+imageClicked(res as orientationGuessResult, Orientation.left)"
                  >
                    <canvas :id="res.image.sha + '-canvas'" class="w-100 rounded border border-2" />
                  </BButton>
                </div>
              </div>
            </div>

            <!-- Frontal Images Section -->
            <div class="flex-grow-1 d-flex flex-column align-items-center w-33">
              <h2>Frontal</h2>
              <div class="overflow-y-auto">
                <div
                  v-for="res in orientations.filter(
                    (val) => val.orientation === Orientation.center
                  )"
                  :id="res.image.sha + '-container'"
                  :key="res.image.sha"
                  class="overflow-y-auto"
                >
                  <BButton
                    :variant="
                      selectedImages.center?.image.sha === res.image.sha
                        ? 'primary'
                        : 'outline-dark'
                    "
                    class="w-100"
                    @click="imageClicked(res as orientationGuessResult, Orientation.center)"
                  >
                    <canvas :id="res.image.sha + '-canvas'" class="w-100 rounded border border-2" />
                  </BButton>
                </div>
              </div>
            </div>

            <!-- Right Images Section -->
            <div class="flex-grow-1 d-flex flex-column align-items-center w-33">
              <h2>Right</h2>
              <div class="overflow-y-auto">
                <div
                  v-for="res in orientations.filter((val) => val.orientation === Orientation.right)"
                  :id="res.image.sha + '-container'"
                  :key="res.image.sha"
                >
                  <BButton
                    :variant="
                      selectedImages.right?.image.sha === res.image.sha ? 'primary' : 'outline-dark'
                    "
                    class="w-100"
                    @click="imageClicked(res as orientationGuessResult, Orientation.right)"
                  >
                    <canvas :id="res.image.sha + '-canvas'" class="w-100 rounded border border-2" />
                  </BButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="imageCount == 0" class="d-flex justify-content-around">
          <h1 class="text-center">Press "Load" to get started</h1>
        </div>
        <div v-if="imageCount === progress && imageCount != 0">
          <div class="d-flex justify-content-around">
            <h1 class="text-center">
              Selection finished.<br />
              <br />
              Press <b>"Next"</b> to continue. Press <b>"Previous"</b> to go back to the selection.
            </h1>
          </div>
        </div>
      </div>
      <!-- Bottom row -->
      <div class="mt-auto w-100 align-items-center">
        <hr />
        <div class="d-flex align-items-center justify-content-around">
          <BButton variant="outline-dark" @click="loadImages" class="me-2">
            <BSpinner v-if="processing" small />
            Load
          </BButton>
          <BButton
            v-if="progress !== 0"
            :variant="progress === 0 ? 'outline-secondary' : 'secondary'"
            @click="prevImage"
            >Previous</BButton
          >
          <BProgress :max="imageCount" :value="progress" class="w-75 mx-4 my-auto" show-value />
          <BButton variant="primary" @click="nextImage">Next</BButton>
        </div>
      </div>
    </div>
  </BModal>
  <BModal v-model="confirmModal" @ok="save" @cancel="returnToLoad" centered>
    <div class="d-flex justify-content-around">
      <h1 class="text-center">Selection Finished!<br />Confirm?</h1>
    </div>
  </BModal>
  <BModal v-model="showHelp" centered ok-only title="Help">
    <h5>Overall process</h5>
    <p>
      Select images of the same person from multiple angles. You don't need to select all three
      views. If you are happy with your choice, click the
      <BButton variant="primary" class="btn-sm">Next</BButton> button.
    </p>
    <p>
      You can select images by clicking on the images. You can see your selection by the blue
      background. You can change your choice after selecting another.
    </p>
    <h5>Going back</h5>
    <p>
      You can go back to the last selection by clicking the
      <BButton variant="secondary" class="btn-sm">Previous</BButton> button.
    </p>
    <h5>Load more images</h5>
    <p>
      You can load more images by clicking the
      <BButton variant="outline-dark" class="btn-sm">Load</BButton> button. Previously loaded images
      will be ignored.
    </p>
    <h5>Finishing selection</h5>
    <p>
      When there are no more images to select you will be prompted to confirm your choices. If you
      want to finish your selection with images left, click the
      <BButton variant="primary" class="btn-sm">Next</BButton> without any images selected. You can
      still go back to the selection.
    </p>
  </BModal>
</template>

<style>
.max-h-60vh {
  max-height: 60vh !important;
}
</style>
