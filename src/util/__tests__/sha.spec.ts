import { test, expect } from 'vitest';
import { checkSHA, calculateSHA } from '../sha';

const mockFile = new File(['dummy content'], 'example.jpeg');
const expectedSHA = 'bf0ecbdb9b814248d086c9b69cf26182d9d4138f2ad3d0637c4555fc8cbf68e5';

test('calculateSHA', async () => {
  const actualSHA = await calculateSHA(mockFile);
  expect(actualSHA).toBe(expectedSHA);
});

test('checkSHA', async () => {
  const isValidSHA = await checkSHA(mockFile, expectedSHA);

  expect(isValidSHA).toBe(true);
});
