import { beforeEach, expect, test } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { ModelType } from '../../enums/modelType';
import { Point2D } from '../../graph/point2d';
import { AnnotationData, type ModelApi } from '../../model/modelApi';
import { useAnnotationHistoryStore } from '../annotationHistoryStore';
import { FileAnnotationHistory } from '../../cache/fileAnnotationHistory';
import { ImageFile } from '../../imageFile';
import { MultipleViewImage } from '../../interface/multiple_view_image';
import { Orientation } from '../../enums/orientation';

beforeEach(() => {
  setActivePinia(createPinia());
});

const mockFile: MultipleViewImage = {
  center: {
    image: {
      filePointer: new File([''], 'mock.png', {
        type: 'image/png'
      })
    },
    mesh: []
  },
  left: null,
  right: null,
  selected: Orientation.center
} as MultipleViewImage;

class MockApi implements ModelApi<Point2D> {
  async detect(imageFile: ImageFile): Promise<FileAnnotationHistory<Point2D> | null> {
    return new FileAnnotationHistory<Point2D>(imageFile);
  }

  type(): ModelType {
    return ModelType.custom;
  }

  async uploadAnnotations(_: AnnotationData): Promise<void | Response> {
    return;
  }
}

const mockApi = new MockApi();

test('Test store is initially empty', async () => {
  const store = useAnnotationHistoryStore();
  expect(store.empty()).toEqual(true);
  await store.add(mockFile.center.image.filePointer, mockApi);
  expect(store.empty()).toEqual(false);
});

test('Test adding', async () => {
  const store = useAnnotationHistoryStore();
  await store.add(mockFile.center.image.filePointer, mockApi);

  expect(store._histories.length).toEqual(1);
  expect(store.selectedHistory).not.toBeNull();
});

test('Test find function', async () => {
  const store = useAnnotationHistoryStore();
  await store.add(mockFile.center.image.filePointer, mockApi);

  const found = store.find(
    mockFile.center.image.filePointer.name,
    store._histories[0].file.center.image.sha
  );
  expect(found).toEqual(store.selectedHistory);
});

test('Check the elements in the state', () => {
  const store = useAnnotationHistoryStore();

  const expectedKeys = ['_histories', 'selectedHistory'];
  const actualKeys = Object.keys(store.$state);

  expect(actualKeys.length).toBe(expectedKeys.length);
  expectedKeys.forEach((key) => expect(actualKeys).toContain(key));
});
