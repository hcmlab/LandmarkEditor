import { test, expect } from 'vitest';
import { imageFromFile } from '../imageFromFile';

test('imageFromFile - success case', async () => {
  const file = new File(['dummy content'], 'example.jpeg');
  const result = await imageFromFile(file);
  expect(result).eq('data:application/octet-stream;base64,ZHVtbXkgY29udGVudA==');
});

test('imageFromFile - fail case', async () => {
  const mockError = new Error('mock error');

  const file = new File(['dummy content'], 'example.jpeg');
  try {
    await imageFromFile(file);
  } catch (err) {
    expect(err).eq(mockError);
  }
});
