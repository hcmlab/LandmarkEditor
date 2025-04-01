import { test, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useFaceMeshConfig } from '../faceMeshConfig';

beforeEach(() => {
  setActivePinia(createPinia());
});

test('Store sets showTesselation correctly', () => {
  const store = useFaceMeshConfig();
  store.$state.showTesselation = true;
  expect(store.$state.showTesselation).toEqual(true);
});

test('Check the elements in the state', () => {
  const store = useFaceMeshConfig();

  const expectedKeys = ['showTesselation', 'processing', 'modelOptions'];
  const actualKeys = Object.keys(store.$state);

  expect(actualKeys.length).toBe(expectedKeys.length);
  expectedKeys.forEach((key) => expect(actualKeys).toContain(key));
});
