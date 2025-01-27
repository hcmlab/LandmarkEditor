import {
  all,
  create,
  type MathArray,
  type MathCollection,
  type Matrix as MathMatrix
} from 'mathjs';
import type { Matrix } from '@mediapipe/tasks-vision';

export const math = create(all);

export function reshape(matrix: Matrix): number[][] {
  if (!matrix || !Array.isArray(matrix.data)) {
    throw new Error('Invalid matrix input');
  }
  if (matrix.data.length < matrix.rows * matrix.columns) {
    throw new Error('Invalid requested invalid shape');
  }
  const { rows, columns, data } = matrix;
  return Array.from({ length: rows }, (_, i) => data.slice(i * columns, (i + 1) * columns));
}

export function reverse(matrix: MathMatrix | MathArray): MathMatrix {
  // Extract rotation (R) and translation (t)
  const R = math.subset(matrix, math.index([0, 1, 2], [0, 1, 2])); // Top-left 3x3
  const t = math.subset(matrix, math.index(3, [0, 1, 2])); // Bottom 1x3

  // Compute the inverse
  const R_inv = math.inv(R); // Transpose of R
  const t_inv = math.transpose(
    <MathCollection>math.multiply(-1, math.multiply(R_inv, math.transpose(t)))
  ); // Adjusted translation

  // Construct the inverse matrix
  let inv = math.zeros(4, 4) as MathMatrix;
  inv = math.subset(inv, math.index([0, 1, 2], [0, 1, 2]), R_inv);
  inv = math.subset(inv, math.index(3, [0, 1, 2]), t_inv);
  inv.set([3, 3], 1); // Set bottom-right value to 1

  return inv;
}
