import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { MediapipeFaceModel } from '../mediapipeFace';
import { ModelApi } from '../modelApi';
import { Point2D } from '../../graph/point2d';

/*
// Define a function to convert ArrayBuffer to Blob
function arrayBufferToBlob(buffer: ArrayBuffer, type: string) {
  return new Blob([buffer], { type });
}

// Define a function to convert Blob to File
function blobToFile(blob: Blob, name: string) {
  return new File([blob], name);
}
*/

describe('MediapipeModel', () => {
  let model: ModelApi<Point2D>;
  beforeEach(() => {
    setActivePinia(createPinia());
    model = new MediapipeFaceModel();
  });

  it('should initialize MediapipeModel correctly', async () => {
    expect(model).toBeDefined();
    expect(model.shouldUpload).eq(false);
  });

  it('should return correct model type', async () => {
    expect(model.shouldUpload).eq(false);
  });
});
