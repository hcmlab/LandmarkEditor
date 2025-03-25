import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { MediapipeModel } from '../mediapipe';
import { ModelType } from '../../enums/modelType';
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
    model = new MediapipeModel();
  });

  it('should initialize MediapipeModel correctly', async () => {
    expect(model);
    expect(model.type()).eq(ModelType.mediapipeFaceMesh);
  });

  it('should try to detect image correctly', async () => {
    /** This doesn't work, since mediapipe doesn't run without a browser */
    /*
    const fileBuffer = fs.readFileSync('src/model/__tests__/testImage.png');

    // Create an ArrayBuffer from the file data
    const arrayBuffer = Uint8Array.from(fileBuffer).buffer;

    // Create a Blob from the ArrayBuffer
    const blob = arrayBufferToBlob(arrayBuffer, 'text/plain');

    // Create a File object from the Blob
    const file = blobToFile(blob, 'file.txt');
    const imageFile = ImageFile.create(file);
    let detectionResults;
    let errorFlag = false;

    try {
      detectionResults = await model.detect(imageFile);
    } catch (error) {
      errorFlag = true;
    }

    expect(detectionResults || errorFlag);
    */
  });

  it('should return correct model type', async () => {
    expect(model.type()).eq(ModelType.mediapipeFaceMesh);
  });
});
