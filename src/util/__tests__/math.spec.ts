import { Matrix } from '@mediapipe/tasks-vision';
import { describe, expect, it } from 'vitest';
import { create, all, Matrix as MathMatrix } from 'mathjs';
import { reshape, reverse } from '../math';

describe('reshape', () => {
  it('returns a 2D array with correct shape', () => {
    const matrix: Matrix = {
      rows: 3,
      columns: 4,
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    };
    const result = reshape(matrix);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(3);
    expect(result[0].length).toBe(4);
  });

  it('correctly reshapes a matrix with different shape', () => {
    const matrix: Matrix = {
      rows: 2,
      columns: 5,
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    };
    const result = reshape(matrix);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(2);
    expect(result[0].length).toBe(5);
  });

  it('throws an error for invalid input', () => {
    expect(() => reshape({} as Matrix)).toThrowError();
  });
});

describe('reverse', () => {
  it('returns a MathMatrix object with correct inverse values', () => {
    const math = create(all);
    const matrix = math.matrix([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]);
    const result = reverse(matrix);
    expect(result.get([0, 0])).toBeCloseTo(1);
    expect(result.get([0, 1])).toBeCloseTo(0);
    expect(result.get([0, 2])).toBeCloseTo(0);
    expect(result.get([0, 3])).toBeCloseTo(0);
    expect(result.get([1, 0])).toBeCloseTo(0);
    expect(result.get([1, 1])).toBeCloseTo(1);
    expect(result.get([1, 2])).toBeCloseTo(0);
    expect(result.get([1, 3])).toBeCloseTo(0);
    expect(result.get([2, 0])).toBeCloseTo(0);
    expect(result.get([2, 1])).toBeCloseTo(0);
    expect(result.get([2, 2])).toBeCloseTo(1);
    expect(result.get([2, 3])).toBeCloseTo(0);
    expect(result.get([3, 0])).toBeCloseTo(0);
    expect(result.get([3, 1])).toBeCloseTo(0);
    expect(result.get([3, 2])).toBeCloseTo(0);
    expect(result.get([3, 3])).toBeCloseTo(1);
  });

  it('correctly handles different types of input matrices', () => {
    const math = create(all);
    const rotationMatrix = math.matrix([
      [0, 1, 0, 0],
      [-1, 0, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]);
    const translationMatrix = math.matrix([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [1, 2, 3, 1]
    ]);
    const scalingMatrix = math.matrix([
      [2, 0, 0, 0],
      [0, 3, 0, 0],
      [0, 0, 4, 0],
      [0, 0, 0, 1]
    ]);
    const rot_rev = reverse(rotationMatrix);
    expect(rot_rev).toBeDefined();
    expect(rot_rev.toArray()).toEqual([
      [0, -1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]);

    const trans_rev = reverse(translationMatrix);
    expect(trans_rev).toBeDefined();
    expect(trans_rev.toArray()).toEqual([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [-1, -2, -3, 1]
    ]);
    const scale_rev = reverse(scalingMatrix);
    expect(scale_rev).toBeDefined();
    expect(scale_rev.toArray()).toEqual([
      [0.5, 0, 0, 0],
      [0, 1 / 3, 0, 0],
      [0, 0, 0.25, 0],
      [0, 0, 0, 1]
    ]);
  });

  it('throws an error for invalid input', () => {
    expect(() => reverse({} as MathMatrix)).toThrowError();
  });
});
