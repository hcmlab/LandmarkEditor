// eslint-disable-next-line import-x/no-nodejs-modules
import * as fs from 'node:fs';
import { mount } from '@vue/test-utils';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import ThumbnailGallery from '../ThumbnailGallery.vue';
import { ImageFile } from '../../../imageFile';
import { useAnnotationToolStore } from '../../../stores/annotationToolStore';
import { AnnotationTool } from '../../../enums/annotationTool';

// Mock fs.readFileSync to return a predetermined buffer
vi.mock('node:fs', () => ({
  readFileSync: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3]).buffer)
}));

// Mock ImageFile.create to return a predetermined ImageFile object
vi.mock('../../../imageFile', () => ({
  ImageFile: {
    create: vi.fn()
  }
}));

vi.mock('../../../util/imageFromFile', () => ({
  imageFromFile: vi.fn().mockReturnValue('')
}));

let tools = null;
let image_file: ImageFile;
let file: File;

beforeAll(async () => {
  // Set up the mock for ImageFile.create within beforeAll to avoid hoisting issues
  const fileBuffer = fs.readFileSync('src/model/__tests__/testImage.png');
  const arrayBuffer = Uint8Array.from(fileBuffer).buffer;
  file = new File([arrayBuffer], 'testImage.png', { type: 'image/png' });
  ImageFile.create.mockResolvedValue({ filePointer: file, sha: 'mocked-sha' });

  image_file = await ImageFile.create(file);
  setActivePinia(createPinia());
  tools = useAnnotationToolStore();
  await tools.histories.add(image_file, []);
});

describe('ThumbnailGallery', () => {
  it('should set selectedHistory to the current history upon selectThumbnail function execution', async () => {
    expect(tools.selectedHistory.isEmpty(AnnotationTool.FaceMesh)).toBeTruthy();

    const wrapper = mount(ThumbnailGallery);

    expect(wrapper.exists()).toBeTruthy();

    const thumbnailContainer = wrapper.find('#thumbnail-0');
    expect(thumbnailContainer.exists()).toBe(true);

    await thumbnailContainer.trigger('click', image_file);
    expect(tools.selectedHistory.file).toEqual(image_file);
  });
});
