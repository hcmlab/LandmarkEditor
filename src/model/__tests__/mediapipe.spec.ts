import { describe, expect, it } from 'vitest';
import { MediapipeModel } from '../mediapipe';
import { ModelType } from '../../enums/modelType';

const model = new MediapipeModel();

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
  it('should initialize MediapipeModel correctly', async () => {
    expect(model).not.toBeNull();
    expect(model.type()).eq(ModelType.mediapipe);
  });

  it('should return correct model type', async () => {
    expect(model.type()).eq(ModelType.mediapipe);
  });
});
