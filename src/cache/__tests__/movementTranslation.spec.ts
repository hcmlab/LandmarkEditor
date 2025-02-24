import { suite, describe, expect, it, beforeEach } from 'vitest';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { FileAnnotationHistory } from '../fileAnnotationHistory';
import { MultipleViewImage } from '../../interface/multiple_view_image';
import type { orientationGuessResult } from '../../util/orientationGuesser';
import { Point3D } from '../../graph/point3d';
import { math, reverse } from '../../util/math';
import { Orientation } from '../../enums/orientation';
import { Graph } from '../../graph/graph';

const point_x = new Point3D(0, 1, 0, 0, []);
const point_y = new Point3D(0, 0, 1, 0, []);
const point_z = new Point3D(0, 0, 0, 1, []);
const g = new Graph([point_x]);

const unit_matrix = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1]
];

const ninety_degree_matrix = [
  [0, 0, -1, 0],
  [0, 1, 0, 0],
  [1, 0, 0, 0],
  [0, 0, 0, 1]
];

const translation_matrix = [
  [1, 0, 0, 1],
  [0, 1, 0, 1],
  [0, 0, 1, 1],
  [0, 0, 0, 1]
];

const half_sqrt_two = Math.sqrt(2) / 2; // which is cos(45 degree) = sin(45 degree)

const forty_five_degree_matrix = [
  [half_sqrt_two, 0, half_sqrt_two, 0],
  [0, 1, 0, 0],
  [-half_sqrt_two, 0, half_sqrt_two, 0],
  [0, 0, 0, 1]
];

suite('Test Movement translation', () => {
  let file: MultipleViewImage;
  let h: FileAnnotationHistory<Point3D>;

  beforeEach(() => {
    file = new MultipleViewImage();
    file.left = {
      image: {
        filePointer: new File([''], 'test.jpg')
      },
      orientation: Orientation.left,
      viewingDir: new Point3D(-1, 0, -1, 0, []),
      mesh: [{ x: 1, y: 0, z: 0 } as NormalizedLandmark],
      transformationMatrix: math.matrix(ninety_degree_matrix),
      revTransformationMatrix: reverse(math.matrix(ninety_degree_matrix))
    } as orientationGuessResult;

    file.center = {
      image: {
        filePointer: new File([''], 'test.jpg')
      },
      orientation: Orientation.center,
      viewingDir: new Point3D(-1, 0, 0, -1, []),
      mesh: [{ x: 1, y: 0, z: 0 } as NormalizedLandmark],
      transformationMatrix: math.matrix(unit_matrix),
      revTransformationMatrix: math.matrix(unit_matrix)
    };

    file.right = {
      image: {
        filePointer: new File([''], 'test.jpg')
      },
      orientation: Orientation.left,
      viewingDir: new Point3D(-1, 0, 1, 0, []),
      mesh: [{ x: 1, y: 0, z: 0 } as NormalizedLandmark],
      transformationMatrix: math.matrix(ninety_degree_matrix),
      revTransformationMatrix: math.matrix(unit_matrix)
    } as orientationGuessResult;

    file.selected = Orientation.center;
    h = new FileAnnotationHistory<Point3D>(file);
    h.add(g);
    h.file.selected = Orientation.left;
    h.add(g);
    h.file.selected = Orientation.right;
    h.add(g);
    h.file.selected = Orientation.center;
  });

  describe('should do 90 degree movement if translation is 90 degree', () => {
    it('should not change the axis translated on the axis that the rotation is around', () => {
      h.updateOtherPerspectives([point_y]);
      h.file.selected = Orientation.left;
      const res = h.get().getById(0);
      expect(res.x).toBeCloseTo(1);
      expect(res.y).toBeCloseTo(1);
      expect(res.z).toBeCloseTo(0);

      h.file.selected = Orientation.right;
      const res2 = h.get().getById(0);
      expect(res2.x).toBeCloseTo(0);
      expect(res2.y).toBeCloseTo(1);
      expect(res2.z).toBeCloseTo(1);
    });

    it('should change direction in 90 degree on one axis', () => {
      h.updateOtherPerspectives([point_x]);
      h.file.selected = Orientation.left;
      const res = h.get().getById(0);
      expect(res.x).toBeCloseTo(2);
      expect(res.y).toBeCloseTo(0);
      expect(res.z).toBeCloseTo(0);

      h.file.selected = Orientation.right;
      const res2 = h.get().getById(0);
      expect(res2.x).toBeCloseTo(0);
      expect(res2.y).toBeCloseTo(0);
      expect(res2.z).toBeCloseTo(2);
    });

    it('should change direction in 90 degree on other axis', () => {
      h.updateOtherPerspectives([new Point3D(0, 0, 0, 1, [])]);
      h.file.selected = Orientation.left;
      const res = h.get().getById(0);
      expect(res.x).toBeCloseTo(1);
      expect(res.y).toBeCloseTo(0);
      expect(res.z).toBeCloseTo(1);

      h.file.selected = Orientation.right;
      const res2 = h.get().getById(0);
      expect(res2.x).toBeCloseTo(-1);
      expect(res2.y).toBeCloseTo(0);
      expect(res2.z).toBeCloseTo(1);
    });
  });

  describe('should do 45 degree movement if translation is 45 degree', () => {
    beforeEach(() => {
      file.left.transformationMatrix = math.matrix(forty_five_degree_matrix);
      file.left.revTransformationMatrix = reverse(math.matrix(forty_five_degree_matrix));
      file.right.transformationMatrix = math.matrix(forty_five_degree_matrix);
    });

    it('should not change the axis translated on the axis that the rotation is around', () => {
      h.updateOtherPerspectives([point_y]);
      h.file.selected = Orientation.left;
      const res = h.get().getById(0);
      expect(res.x).toBeCloseTo(1);
      expect(res.y).toBeCloseTo(1);
      expect(res.z).toBeCloseTo(0);

      h.file.selected = Orientation.right;
      const res2 = h.get().getById(0);
      expect(res2.x).toBeCloseTo(half_sqrt_two);
      expect(res2.y).toBeCloseTo(1);
      expect(res2.z).toBeCloseTo(-half_sqrt_two);
    });

    it('should change direction in 45 degree on one axis', () => {
      h.updateOtherPerspectives([point_x]);
      h.file.selected = Orientation.left;
      const res = h.get().getById(0);
      expect(res.x).toBeCloseTo(2);
      expect(res.y).toBeCloseTo(0);
      expect(res.z).toBeCloseTo(0);

      h.file.selected = Orientation.right;
      const res2 = h.get().getById(0);
      expect(res2.x).toBeCloseTo(2 * half_sqrt_two);
      expect(res2.y).toBeCloseTo(0);
      expect(res2.z).toBeCloseTo(-2 * half_sqrt_two);
    });

    it('should change direction in 45 degree on other axis', () => {
      h.updateOtherPerspectives([point_z]);
      h.file.selected = Orientation.left;
      const res = h.get().getById(0);
      expect(res.x).toBeCloseTo(1);
      expect(res.y).toBeCloseTo(0);
      expect(res.z).toBeCloseTo(1);

      h.file.selected = Orientation.right;
      const res2 = h.get().getById(0);
      expect(res2.x).toBeCloseTo(2 * half_sqrt_two);
      expect(res2.y).toBeCloseTo(0);
      expect(res2.z).toBeCloseTo(0);
    });
  });

  describe('should work with translation', () => {
    beforeEach(() => {
      file.left.transformationMatrix = math.matrix(translation_matrix);
      file.left.revTransformationMatrix = reverse(math.matrix(translation_matrix));
      file.right.transformationMatrix = math.matrix(translation_matrix);
    });
    it('should translate the point when moving on x axis', () => {
      h.updateOtherPerspectives([point_x]);
      h.file.selected = Orientation.left;
      const res = h.get().getById(0);
      expect(res.x).toBeCloseTo(2);
      expect(res.y).toBeCloseTo(0);
      expect(res.z).toBeCloseTo(0);

      h.file.selected = Orientation.right;
      const res2 = h.get().getById(0);
      expect(res2.x).toBeCloseTo(3);
      expect(res2.y).toBeCloseTo(1);
      expect(res2.z).toBeCloseTo(1);
    });

    it('should translate the point when moving on y axis', () => {
      h.updateOtherPerspectives([point_y]);
      h.file.selected = Orientation.left;
      const res = h.get().getById(0);
      expect(res.x).toBeCloseTo(1);
      expect(res.y).toBeCloseTo(1);
      expect(res.z).toBeCloseTo(0);

      h.file.selected = Orientation.right;
      const res2 = h.get().getById(0);
      expect(res2.x).toBeCloseTo(2);
      expect(res2.y).toBeCloseTo(2);
      expect(res2.z).toBeCloseTo(1);
    });

    it('should translate the point when moving on z axis', () => {
      h.updateOtherPerspectives([point_z]);
      h.file.selected = Orientation.left;
      const res = h.get().getById(0);
      expect(res.x).toBeCloseTo(1);
      expect(res.y).toBeCloseTo(0);
      expect(res.z).toBeCloseTo(1);

      h.file.selected = Orientation.right;
      const res2 = h.get().getById(0);
      expect(res2.x).toBeCloseTo(2);
      expect(res2.y).toBeCloseTo(1);
      expect(res2.z).toBeCloseTo(2);
    });
  });
});
