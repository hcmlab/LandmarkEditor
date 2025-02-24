import * as fs from 'node:fs';
import { mount } from '@vue/test-utils';
import { beforeAll, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import ThumbnailGallery from '../ThumbnailGallery.vue';
import { FileAnnotationHistory } from '../../../cache/fileAnnotationHistory';
import { Point2D } from '../../../graph/point2d';
import { useAnnotationHistoryStore } from '../../../stores/annotationHistoryStore';
import { ImageFile } from '../../../imageFile';

import { MultipleViewImage } from '../../../interface/multiple_view_image';
import { Orientation } from '../../../enums/orientation';

// Define a function to convert ArrayBuffer to Blob
function arrayBufferToBlob(buffer: ArrayBuffer, type: string) {
  return new Blob([buffer], { type });
}

// Define a function to convert Blob to File using the browser's File constructor
function blobToFile(blob: Blob, name: string) {
  return new File([blob], name, { type: blob.type });
}

const fileBuffer = fs.readFileSync('src/model/__tests__/testImage.png');

// Create an ArrayBuffer from the file data
const arrayBuffer = Uint8Array.from(fileBuffer).buffer;

// Create a Blob from the ArrayBuffer
const blob = arrayBufferToBlob(arrayBuffer, 'text/plain');

// Create a mock File object using the browser's File constructor
const mockFile = blobToFile(blob, 'mock.png');

// Mock data
const mockData = {
  selected: Orientation.center,
  center: {
    image: {
      file: mockFile
    },
    mesh: []
  },
  left: null,
  right: null
} as MultipleViewImage;

let store = null;

beforeAll(async () => {
  mockData.center.image = await ImageFile.create(mockFile);
  setActivePinia(createPinia());
  store = useAnnotationHistoryStore();
  store._histories.push(new FileAnnotationHistory<Point2D>(mockData, 25));
});

describe('ThumbnailGallery', () => {
  it('should set selectedHistory to the current history upon selectThumbnail function execution', async () => {
    expect(store.selectedHistory).toBeNull;

    const wrapper = mount(ThumbnailGallery);

    const thumbnailContainer = wrapper.find('#thumbnail-0');
    expect(thumbnailContainer.exists()).toBe(true);

    await thumbnailContainer.trigger('click', mockData);
    expect(store.selectedHistory.file).toEqual(mockData);
  });
});
